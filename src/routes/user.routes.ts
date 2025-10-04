import express from 'express';
import { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  getUsersByBranch 
} from '../controllers/user.controller';
import { authenticate, checkRole } from '../middleware/auth.middleware';

const router = express.Router();


router.get('/', authenticate, getAllUsers);
router.get('/:id', authenticate, getUserById);
router.put('/:id', authenticate, updateUser);
router.get('/branch/:branch', authenticate, getUsersByBranch);

export default router;