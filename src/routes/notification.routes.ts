import express from 'express';
import { 
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();


router.get('/', authenticate, getNotifications);
router.put('/:id/read', authenticate, markNotificationAsRead);
router.put('/read-all', authenticate, markAllNotificationsAsRead);
router.delete('/:id', authenticate, deleteNotification);

export default router;
