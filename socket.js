import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { userQueries } from './db/query/Userquery.js';
import { chatQueries } from './db/query/Chatquery.js';

const setupSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userQueries.findById(decoded.userId);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user.id;
      socket.username = user.username;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.username} connected`);

    // Join user to their personal room for notifications
    socket.join(`user_${socket.userId}`);

    // Join chat room
    socket.on('join_room', (roomId) => {
      socket.join(`room_${roomId}`);
      console.log(`User ${socket.username} joined room ${roomId}`);
    });

    // Leave chat room
    socket.on('leave_room', (roomId) => {
      socket.leave(`room_${roomId}`);
      console.log(`User ${socket.username} left room ${roomId}`);
    });

    // Handle new message
    socket.on('send_message', async (data) => {
      try {
        const { roomId, content, messageType = 'text' } = data;

        // Verify user is part of the room
        const isUserInRoom = await chatQueries.isUserInRoom(roomId, socket.userId);
        if (!isUserInRoom) {
          socket.emit('error', { message: 'You are not part of this chat room' });
          return;
        }

        // Save message to database
        const message = await chatQueries.sendMessage(roomId, socket.userId, content, messageType);

        // Emit message to all users in the room
        io.to(`room_${roomId}`).emit('new_message', {
          ...message,
          sender_name: socket.username
        });

        // Get the other user in the room and send notification
        const room = await chatQueries.getUserRooms(socket.userId);
        const currentRoom = room.find(r => r.id === parseInt(roomId));
        
        if (currentRoom) {
          io.to(`user_${currentRoom.other_user_id}`).emit('message_notification', {
            roomId,
            message: message.content,
            senderName: socket.username,
            senderId: socket.userId
          });
        }

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { roomId, isTyping } = data;
      socket.to(`room_${roomId}`).emit('user_typing', {
        userId: socket.userId,
        username: socket.username,
        isTyping
      });
    });

    // Handle message read
    socket.on('mark_read', async (data) => {
      try {
        const { roomId } = data;
        await chatQueries.markAsRead(roomId, socket.userId);
        
        socket.to(`room_${roomId}`).emit('messages_read', {
          userId: socket.userId,
          roomId
        });
      } catch (error) {
        console.error('Mark read error:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.username} disconnected`);
    });
  });

  return io;
};

export default setupSocketIO;
