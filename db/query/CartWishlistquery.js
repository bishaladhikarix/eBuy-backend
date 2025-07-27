import pool from '../config.js';

export const cartQueries = {
  // Add to cart
  addToCart: async (userId, productId, quantity = 1) => {
    try {
      // Check if item already exists in cart
      const existing = await pool.query(
        'SELECT * FROM cart WHERE user_id = $1 AND product_id = $2',
        [userId, productId]
      );

      if (existing.rows.length > 0) {
        // Update quantity
        const result = await pool.query(
          'UPDATE cart SET quantity = quantity + $3 WHERE user_id = $1 AND product_id = $2 RETURNING *',
          [userId, productId, quantity]
        );
        return result.rows[0];
      } else {
        // Insert new item
        const result = await pool.query(
          'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
          [userId, productId, quantity]
        );
        return result.rows[0];
      }
    } catch (error) {
      throw error;
    }
  },

  // Get user's cart
  getUserCart: async (userId) => {
    const result = await pool.query(
      `SELECT c.*, p.title, p.description, p.price, p.images, p.is_sold, p.seller_id,
              u.username as seller_name
       FROM cart c
       JOIN products p ON c.product_id = p.id
       JOIN users u ON p.seller_id = u.id
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  // Update cart item quantity
  updateQuantity: async (userId, productId, quantity) => {
    const result = await pool.query(
      'UPDATE cart SET quantity = $3 WHERE user_id = $1 AND product_id = $2 RETURNING *',
      [userId, productId, quantity]
    );
    return result.rows[0];
  },

  // Remove from cart
  removeFromCart: async (userId, productId) => {
    const result = await pool.query(
      'DELETE FROM cart WHERE user_id = $1 AND product_id = $2 RETURNING *',
      [userId, productId]
    );
    return result.rows[0];
  },

  // Clear cart
  clearCart: async (userId) => {
    const result = await pool.query(
      'DELETE FROM cart WHERE user_id = $1 RETURNING *',
      [userId]
    );
    return result.rows;
  },

  // Get cart item count
  getCartCount: async (userId) => {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM cart WHERE user_id = $1',
      [userId]
    );
    return parseInt(result.rows[0].count);
  }
};

export const wishlistQueries = {
  // Add to wishlist
  addToWishlist: async (userId, productId) => {
    try {
      const result = await pool.query(
        'INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2) RETURNING *',
        [userId, productId]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('Product already in wishlist');
      }
      throw error;
    }
  },

  // Get user's wishlist
  getUserWishlist: async (userId) => {
    const result = await pool.query(
      `SELECT w.*, p.title, p.description, p.price, p.images, p.is_sold, p.seller_id,
              u.username as seller_name
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       JOIN users u ON p.seller_id = u.id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  // Remove from wishlist
  removeFromWishlist: async (userId, productId) => {
    const result = await pool.query(
      'DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2 RETURNING *',
      [userId, productId]
    );
    return result.rows[0];
  },

  // Check if product is in wishlist
  isInWishlist: async (userId, productId) => {
    const result = await pool.query(
      'SELECT id FROM wishlist WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );
    return result.rows.length > 0;
  },

  // Get wishlist count
  getWishlistCount: async (userId) => {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM wishlist WHERE user_id = $1',
      [userId]
    );
    return parseInt(result.rows[0].count);
  }
};
