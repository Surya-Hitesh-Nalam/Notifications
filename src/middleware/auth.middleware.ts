import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.utils';
import { prisma } from '../server';


declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Authentication middleware to verify JWT token
 * @param req Express Request object
 * @param res Express Response object
 * @param next Express NextFunction
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    const token = authHeader.split(' ')[1];
    const decoded: any = verifyToken(token);
    
    if (!decoded) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
    
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });
    
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }
    
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Authorization middleware to check user roles
 * @param allowedRoles Array of roles that are allowed to access the route
 */
export const checkRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }
    
    next();
  };
};

/**
 * Authorization middleware to check branch access
 * @param req Express Request object
 * @param res Express Response object
 * @param next Express NextFunction
 */
export const checkBranchAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  
  
  if (req.user.role === 'OFFICIAL') {
    next();
    return;
  }
  
  
  const { branch } = req.params;
  if (branch && req.user.branch !== branch) {
    res.status(403).json({ message: 'Access denied to this branch' });
    return;
  }
  
  next();
};

/**
 * Validate messaging permissions based on hierarchy rules
 * @param sender User object of the sender
 * @param targetRole Role of the target user(s)
 * @param targetBranch Branch of the target user(s), if applicable
 */
export const validateMessagePermissions = (
  sender: any,
  targetRole: string,
  targetBranch: string | null
): boolean => {
  
  if (sender.role === 'OFFICIAL') {
    return true;
  }
  
  
  if (sender.role === 'TEACHER') {
    return targetRole === 'STUDENT' && targetBranch === sender.branch;
  }
  
  
  if (sender.role === 'STUDENT') {
    return targetRole === 'STUDENT';
  }
  
  return false;
};