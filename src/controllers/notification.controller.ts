import { Request, Response } from 'express';
import { prisma } from '../server';


export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      notifications,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const markNotificationAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    
    const existingNotification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!existingNotification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    if (existingNotification.userId !== req.user.id) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    
    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.status(200).json({
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const markAllNotificationsAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });

    res.status(200).json({
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    
    const existingNotification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!existingNotification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    if (existingNotification.userId !== req.user.id) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    
    await prisma.notification.delete({
      where: { id },
    });

    res.status(200).json({
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const createNotification = async (
  userId: string,
  type: string,
  referenceId: string,
  content: string
): Promise<void> => {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        referenceId,
        content,
      },
    });
  } catch (error) {
    console.error('Create notification error:', error);
  }
};
