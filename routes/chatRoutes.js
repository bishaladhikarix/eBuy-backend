import express from 'express';
import { chatController } from '../controllers/chatController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateMessage } from '../middleware/validation.js';

const router = express.Router();

// All chat routes require authentication
router.use(authenticateToken);

// Chat room routes
router.post('/rooms', chatController.createOrGetRoom);
router.get('/rooms', chatController.getUserRooms);

// Message routes
router.post('/rooms/:roomId/messages', validateMessage, chatController.sendMessage);
router.get('/rooms/:roomId/messages', chatController.getRoomMessages);
router.patch('/rooms/:roomId/read', chatController.markAsRead);

// Utility routes
router.get('/unread-count', chatController.getUnreadCount);
router.delete('/messages/:messageId', chatController.deleteMessage);

export default router;
