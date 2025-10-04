import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../server';
import { hashPassword, comparePasswords, generateToken } from '../utils/auth.utils';


const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.enum(['OFFICIAL', 'TEACHER', 'STUDENT']),
  position: z.string().optional(),
  branch: z.string().optional(),
  profileImage: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});


export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ 
        message: 'Validation error', 
        errors: result.error.flatten() 
      });
      return;
    }
    
    const { email, password, name, role, position, branch, profileImage } = result.data;
    
    
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      res.status(409).json({ message: 'User already exists' });
      return;
    }
    
    
    const hashedPassword = await hashPassword(password);
    
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        position: role === 'OFFICIAL' ? position : null,
        branch: role === 'OFFICIAL' ? null : branch,
        profileImage,
      },
    });
    
    
    const token = generateToken(user);
    
    
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ 
        message: 'Validation error', 
        errors: result.error.flatten() 
      });
      return;
    }
    
    const { email, password } = result.data;
    
    
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    
    
    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    
    
    const token = generateToken(user);
    
    
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    
    
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    
    const { password: _, ...userWithoutPassword } = req.user;
    
    res.status(200).json({
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};