import { Request, Response } from 'express';
import { prisma } from '../server';

/**
 * Get all users with optional filtering by role/branch
 * @param req Express Request object
 * @param res Express Response object
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, branch } = req.query;
    
    
    const where: any = {};
    
    if (role) {
      where.role = role;
    }
    
    if (branch) {
      where.branch = branch;
    }
    
    
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        position: true,
        branch: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    res.status(200).json({
      users,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get user by ID
 * @param req Express Request object
 * @param res Express Response object
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        position: true,
        branch: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.status(200).json({
      user,
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update user profile
 * @param req Express Request object
 * @param res Express Response object
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, position, branch, profileImage } = req.body;
    
    
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!existingUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    
    if (req.user?.id !== id && req.user?.role !== 'OFFICIAL') {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }
    
    
    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        position: existingUser.role === 'OFFICIAL' ? position : existingUser.position,
        branch: existingUser.role === 'OFFICIAL' ? existingUser.branch : branch,
        profileImage,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        position: true,
        branch: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    res.status(200).json({
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get users by branch
 * @param req Express Request object
 * @param res Express Response object
 */
export const getUsersByBranch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { branch } = req.params;
    
    
    const users = await prisma.user.findMany({
      where: { branch },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        position: true,
        branch: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    res.status(200).json({
      users,
    });
  } catch (error) {
    console.error('Get users by branch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};