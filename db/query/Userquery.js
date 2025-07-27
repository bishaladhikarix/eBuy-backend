import pool from '../config.js';

export const userQueries = {
  // Create user
  createUser: async (userData) => {
    const { username, email, password, firstName, lastName, phone, address } = userData;
    const result = await pool.query(
      `INSERT INTO users (username, email, password, first_name, last_name, phone, address) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, username, email, first_name, last_name, phone, address, created_at`,
      [username, email, password, firstName, lastName, phone, address]
    );
    return result.rows[0];
  },

  // Find user by email
  findByEmail: async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  // Find user by username
  findByUsername: async (username) => {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
  },

  // Find user by ID
  findById: async (id) => {
    const result = await pool.query(
      'SELECT id, username, email, first_name, last_name, phone, address, profile_image, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  // Update user profile
  updateProfile: async (id, userData) => {
    const { firstName, lastName, phone, address, profileImage } = userData;
    
    // Keep existing values if new values are not provided
    const query = `
      UPDATE users 
      SET 
        first_name = COALESCE($2, first_name), 
        last_name = COALESCE($3, last_name), 
        phone = COALESCE($4, phone), 
        address = COALESCE($5, address), 
        profile_image = COALESCE($6, profile_image),
        updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1 
      RETURNING id, username, email, first_name, last_name, phone, address, profile_image
    `;
    
    const result = await pool.query(query, [id, firstName, lastName, phone, address, profileImage]);
    return result.rows[0];
  },

  // Update password
  updatePassword: async (id, hashedPassword) => {
    const result = await pool.query(
      'UPDATE users SET password = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id, hashedPassword]
    );
    return result.rowCount > 0;
  },

  // Get user with product count
  getUserWithStats: async (id) => {
    const result = await pool.query(
      `SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.phone, u.address, 
              u.profile_image, u.created_at, COUNT(p.id) as product_count
       FROM users u
       LEFT JOIN products p ON u.id = p.seller_id
       WHERE u.id = $1
       GROUP BY u.id`,
      [id]
    );
    return result.rows[0];
  }
};