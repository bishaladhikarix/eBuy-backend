import { cartQueries, wishlistQueries } from '../db/query/CartWishlistquery.js';

export const cartController = {
  // Add to cart
  addToCart: async (req, res) => {
    try {
      const { productId, quantity = 1 } = req.body;
      const userId = req.user.id;

      const cartItem = await cartQueries.addToCart(userId, productId, quantity);

      res.status(201).json({
        success: true,
        message: 'Product added to cart successfully',
        data: { cartItem }
      });

    } catch (error) {
      console.error('Add to cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get user's cart
  getCart: async (req, res) => {
    try {
      const cart = await cartQueries.getUserCart(req.user.id);

      res.json({
        success: true,
        data: { cart }
      });

    } catch (error) {
      console.error('Get cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Update cart item quantity
  updateQuantity: async (req, res) => {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;
      const userId = req.user.id;

      if (quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be greater than 0'
        });
      }

      const updatedItem = await cartQueries.updateQuantity(userId, productId, quantity);

      if (!updatedItem) {
        return res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
      }

      res.json({
        success: true,
        message: 'Cart quantity updated successfully',
        data: { cartItem: updatedItem }
      });

    } catch (error) {
      console.error('Update cart quantity error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Remove from cart
  removeFromCart: async (req, res) => {
    try {
      const { productId } = req.params;
      const userId = req.user.id;

      const removedItem = await cartQueries.removeFromCart(userId, productId);

      if (!removedItem) {
        return res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
      }

      res.json({
        success: true,
        message: 'Product removed from cart successfully'
      });

    } catch (error) {
      console.error('Remove from cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Clear cart
  clearCart: async (req, res) => {
    try {
      await cartQueries.clearCart(req.user.id);

      res.json({
        success: true,
        message: 'Cart cleared successfully'
      });

    } catch (error) {
      console.error('Clear cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get cart count
  getCartCount: async (req, res) => {
    try {
      const count = await cartQueries.getCartCount(req.user.id);

      res.json({
        success: true,
        data: { count }
      });

    } catch (error) {
      console.error('Get cart count error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

export const wishlistController = {
  // Add to wishlist
  addToWishlist: async (req, res) => {
    try {
      const { productId } = req.body;
      const userId = req.user.id;

      const wishlistItem = await wishlistQueries.addToWishlist(userId, productId);

      res.status(201).json({
        success: true,
        message: 'Product added to wishlist successfully',
        data: { wishlistItem }
      });

    } catch (error) {
      if (error.message === 'Product already in wishlist') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      console.error('Add to wishlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get user's wishlist
  getWishlist: async (req, res) => {
    try {
      const wishlist = await wishlistQueries.getUserWishlist(req.user.id);

      res.json({
        success: true,
        data: { wishlist }
      });

    } catch (error) {
      console.error('Get wishlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Remove from wishlist
  removeFromWishlist: async (req, res) => {
    try {
      const { productId } = req.params;
      const userId = req.user.id;

      const removedItem = await wishlistQueries.removeFromWishlist(userId, productId);

      if (!removedItem) {
        return res.status(404).json({
          success: false,
          message: 'Wishlist item not found'
        });
      }

      res.json({
        success: true,
        message: 'Product removed from wishlist successfully'
      });

    } catch (error) {
      console.error('Remove from wishlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Check if product is in wishlist
  checkWishlist: async (req, res) => {
    try {
      const { productId } = req.params;
      const userId = req.user.id;

      const isInWishlist = await wishlistQueries.isInWishlist(userId, productId);

      res.json({
        success: true,
        data: { isInWishlist }
      });

    } catch (error) {
      console.error('Check wishlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get wishlist count
  getWishlistCount: async (req, res) => {
    try {
      const count = await wishlistQueries.getWishlistCount(req.user.id);

      res.json({
        success: true,
        data: { count }
      });

    } catch (error) {
      console.error('Get wishlist count error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};
