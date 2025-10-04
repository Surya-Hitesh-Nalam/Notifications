import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../server';
import { validateMessagePermissions } from '../middleware/auth.middleware';


const sendMessageSchema = z.object({
  content: z.string().min(1),
  targetRole: z.enum(['STUDENT', 'TEACHER']).optional(),
  targetBranch: z.string().optional(),
  recipientIds: z.array(z.string()).optional(),
});


export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    
    const result = sendMessageSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ 
        message: 'Validation error', 
        errors: result.error.flatten() 
      });
      return;
    }

    const { content, targetRole, targetBranch, recipientIds } = result.data;

    
    if (!validateMessagePermissions(req.user, targetRole || 'STUDENT', targetBranch || null)) {
      res.status(403).json({ message: 'Insufficient permissions to send message' });
      return;
    }

    
    let messageType = 'INDIVIDUAL';
    let recipients: string[] = [];

    if (recipientIds && recipientIds.length > 0) {
      
      recipients = recipientIds;
    } else if (targetRole) {
      
      messageType = 'GROUP';
      
      
      const recipientFilter: any = { role: targetRole };
      
      if (targetBranch) {
        recipientFilter.branch = targetBranch;
      } else if (req.user.role === 'OFFICIAL') {
        
        
      } else if (req.user.role === 'TEACHER') {
        
        recipientFilter.branch = req.user.branch;
      }
      
      const recipientUsers = await prisma.user.findMany({
        where: recipientFilter,
        select: { id: true },
      });
      
      recipients = recipientUsers.map((user: { id: string }) => user.id);
    }

    
    const message = await prisma.message.create({
      data: {
        senderId: req.user.id,
        content,
        messageType,
        targetRole: targetRole || undefined,
        targetBranch: targetBranch || undefined,
        isRead: false,
      },
    });

    
    if (recipients.length > 0) {
      await prisma.message.update({
        where: { id: message.id },
        data: {
          recipients: {
            connect: recipients.map(id => ({ id })),
          },
        },
      });
    }

    res.status(201).json({
      message: 'Message sent successfully',
      data: message,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const getConversations = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.user.id },
          { recipients: { some: { id: req.user.id } } },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            branch: true,
            profileImage: true,
          },
        },
        recipients: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            branch: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      messages,
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getConversationWithUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { userId } = req.params;

    
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: req.user.id,
            recipients: { some: { id: userId } },
          },
          {
            senderId: userId,
            recipients: { some: { id: req.user.id } },
          },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            branch: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.status(200).json({
      messages,
    });
  } catch (error) {
    console.error('Get conversation with user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const markMessageAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    
    const message = await prisma.message.findUnique({
      where: { id },
      include: { recipients: true },
    });

    if (!message) {
      res.status(404).json({ message: 'Message not found' });
      return;
    }

    const isRecipient = message.recipients.some((recipient: { id: string }) => recipient.id === req.user?.id);
    if (!isRecipient) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    
    const updatedMessage = await prisma.message.update({
      where: { id },
      data: { isRead: true },
    });

    res.status(200).json({
      message: 'Message marked as read',
      data: updatedMessage,
    });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    
    const message = await prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      res.status(404).json({ message: 'Message not found' });
      return;
    }

    if (message.senderId !== req.user.id) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    
    await prisma.message.delete({
      where: { id },
    });

    res.status(200).json({
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};