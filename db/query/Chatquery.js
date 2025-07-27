import pool from '../config.js';

export const chatQueries = {
  // Create or get chat room
  createOrGetRoom: async (user1Id, user2Id) => {
    // Ensure consistent ordering to avoid duplicate rooms
    const [smallerId, largerId] = user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id];
    
    // Check if room exists
    let result = await pool.query(
      'SELECT * FROM chat_rooms WHERE user1_id = $1 AND user2_id = $2',
      [smallerId, largerId]
    );

    if (result.rows.length === 0) {
      // Create new room
      result = await pool.query(
        'INSERT INTO chat_rooms (user1_id, user2_id) VALUES ($1, $2) RETURNING *',
        [smallerId, largerId]
      );
    }

    return result.rows[0];
  },

  // Get user's chat rooms
  getUserRooms: async (userId) => {
    const result = await pool.query(
      `SELECT cr.*, 
              CASE 
                WHEN cr.user1_id = $1 THEN u2.username 
                ELSE u1.username 
              END as other_user_name,
              CASE 
                WHEN cr.user1_id = $1 THEN u2.id 
                ELSE u1.id 
              END as other_user_id,
              CASE 
                WHEN cr.user1_id = $1 THEN u2.profile_image 
                ELSE u1.profile_image 
              END as other_user_image,
              m.content as last_message,
              m.created_at as last_message_time,
              COUNT(unread.id) as unread_count
       FROM chat_rooms cr
       JOIN users u1 ON cr.user1_id = u1.id
       JOIN users u2 ON cr.user2_id = u2.id
       LEFT JOIN messages m ON m.room_id = cr.id AND m.id = (
         SELECT id FROM messages WHERE room_id = cr.id ORDER BY created_at DESC LIMIT 1
       )
       LEFT JOIN messages unread ON unread.room_id = cr.id 
         AND unread.sender_id != $1 AND unread.is_read = false
       WHERE cr.user1_id = $1 OR cr.user2_id = $1
       GROUP BY cr.id, u1.username, u2.username, u1.id, u2.id, u1.profile_image, u2.profile_image, m.content, m.created_at
       ORDER BY COALESCE(m.created_at, cr.created_at) DESC`,
      [userId]
    );
    return result.rows;
  },

  // Send message
  sendMessage: async (roomId, senderId, content, messageType = 'text') => {
    const result = await pool.query(
      'INSERT INTO messages (room_id, sender_id, content, message_type) VALUES ($1, $2, $3, $4) RETURNING *',
      [roomId, senderId, content, messageType]
    );

    // Update room's updated_at
    await pool.query(
      'UPDATE chat_rooms SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [roomId]
    );

    return result.rows[0];
  },

  // Get messages for a room
  getRoomMessages: async (roomId, limit = 50, offset = 0) => {
    const result = await pool.query(
      `SELECT m.*, u.username as sender_name, u.profile_image as sender_image
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.room_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [roomId, limit, offset]
    );
    return result.rows.reverse(); // Return in chronological order
  },

  // Mark messages as read
  markAsRead: async (roomId, userId) => {
    const result = await pool.query(
      'UPDATE messages SET is_read = true WHERE room_id = $1 AND sender_id != $2 AND is_read = false RETURNING *',
      [roomId, userId]
    );
    return result.rowCount;
  },

  // Get unread message count
  getUnreadCount: async (userId) => {
    const result = await pool.query(
      `SELECT COUNT(*) as count
       FROM messages m
       JOIN chat_rooms cr ON m.room_id = cr.id
       WHERE (cr.user1_id = $1 OR cr.user2_id = $1) 
       AND m.sender_id != $1 
       AND m.is_read = false`,
      [userId]
    );
    return parseInt(result.rows[0].count);
  },

  // Check if user is part of room
  isUserInRoom: async (roomId, userId) => {
    const result = await pool.query(
      'SELECT id FROM chat_rooms WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
      [roomId, userId]
    );
    return result.rows.length > 0;
  },

  // Delete message
  deleteMessage: async (messageId, senderId) => {
    const result = await pool.query(
      'DELETE FROM messages WHERE id = $1 AND sender_id = $2 RETURNING *',
      [messageId, senderId]
    );
    return result.rows[0];
  }
};