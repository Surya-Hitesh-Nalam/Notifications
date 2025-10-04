import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Hash a password
 * @param password Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare plain text password with hashed password
 * @param password Plain text password
 * @param hashedPassword Hashed password from database
 * @returns Boolean indicating if passwords match
 */
export const comparePasswords = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Generate JWT token for a user
 * @param user User object
 * @returns JWT token
 */
export const generateToken = (user: any): string => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    branch: user.branch,
  };

  return jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: 7 * 24 * 60 * 60, 
  });
};

/**
 * Verify JWT token
 * @param token JWT token
 * @returns Decoded token payload or null if invalid
 */
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET as string);
  } catch (error) {
    return null;
  }
};