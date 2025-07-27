import { chatQueries } from '../db/query/Chatquery.js';

export const chatController = {
  // Create or get chat room
  createOrGetRoom: async (req, res) => {
    try {
      const { otherUserId } = req.body;
      const currentUserId = req.user.id;

      if (currentUserId === parseInt(otherUserId)) {
        return res.status(400).json({
          success: false,
          message: 'Cannot create chat room with yourself'
        });
      }

      const room = await chatQueries.createOrGetRoom(currentUserId, parseInt(otherUserId));

      res.json({
        success: true,
        data: { room }
      });

    } catch (error) {
      console.error('Create/get room error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get user's chat rooms
  getUserRooms: async (req, res) => {
    try {
      const rooms = await chatQueries.getUserRooms(req.user.id);

      res.json({
        success: true,
        data: { rooms }
      });

    } catch (error) {
      console.error('Get user rooms error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Send message
  sendMessage: async (req, res) => {
    try {
      const { roomId } = req.params;
      const { content, messageType = 'text' } = req.body;
      const senderId = req.user.id;

      // Check if user is part of the room
      const isUserInRoom = await chatQueries.isUserInRoom(roomId, senderId);
      if (!isUserInRoom) {
        return res.status(403).json({
          success: false,
          message: 'You are not part of this chat room'
        });
      }

      const message = await chatQueries.sendMessage(roomId, senderId, content, messageType);

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: { message }
      });

    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get messages for a room
  getRoomMessages: async (req, res) => {
    try {
      const { roomId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const userId = req.user.id;

      // Check if user is part of the room
      const isUserInRoom = await chatQueries.isUserInRoom(roomId, userId);
      if (!isUserInRoom) {
        return res.status(403).json({
          success: false,
          message: 'You are not part of this chat room'
        });
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const messages = await chatQueries.getRoomMessages(roomId, parseInt(limit), offset);

      // Mark messages as read
      await chatQueries.markAsRead(roomId, userId);

      res.json({
        success: true,
        data: {
          messages,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            hasMore: messages.length === parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Get room messages error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Mark messages as read
  markAsRead: async (req, res) => {
    try {
      const { roomId } = req.params;
      const userId = req.user.id;

      // Check if user is part of the room
      const isUserInRoom = await chatQueries.isUserInRoom(roomId, userId);
      if (!isUserInRoom) {
        return res.status(403).json({
          success: false,
          message: 'You are not part of this chat room'
        });
      }

      const markedCount = await chatQueries.markAsRead(roomId, userId);

      res.json({
        success: true,
        message: 'Messages marked as read',
        data: { markedCount }
      });

    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get unread message count
  getUnreadCount: async (req, res) => {
    try {
      const count = await chatQueries.getUnreadCount(req.user.id);

      res.json({
        success: true,
        data: { unreadCount: count }
      });

    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Delete message
  deleteMessage: async (req, res) => {
    try {
      const { messageId } = req.params;
      const senderId = req.user.id;

      const deletedMessage = await chatQueries.deleteMessage(messageId, senderId);

      if (!deletedMessage) {
        return res.status(404).json({
          success: false,
          message: 'Message not found or you can only delete your own messages'
        });
      }

      res.json({
        success: true,
        message: 'Message deleted successfully'
      });

    } catch (error) {
      console.error('Delete message error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};
