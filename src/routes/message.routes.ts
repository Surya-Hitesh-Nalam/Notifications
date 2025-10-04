import express from 'express';
import { 
  sendMessage,
  getConversations,
  getConversationWithUser,
  markMessageAsRead,
  deleteMessage
} from '../controllers/message.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();


router.post('/send', authenticate, sendMessage);
router.get('/conversations', authenticate, getConversations);
router.get('/conversation/:userId', authenticate, getConversationWithUser);
router.put('/:id/read', authenticate, markMessageAsRead);
router.delete('/:id', authenticate, deleteMessage);

export default router;
