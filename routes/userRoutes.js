import express from 'express';
import { cartController, wishlistController } from '../controllers/cartWishlistController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Cart routes
router.post('/cart', cartController.addToCart);
router.get('/cart', cartController.getCart);
router.put('/cart/:productId', cartController.updateQuantity);
router.delete('/cart/:productId', cartController.removeFromCart);
router.delete('/cart', cartController.clearCart);
router.get('/cart/count', cartController.getCartCount);

// Wishlist routes
router.post('/wishlist', wishlistController.addToWishlist);
router.get('/wishlist', wishlistController.getWishlist);
router.delete('/wishlist/:productId', wishlistController.removeFromWishlist);
router.get('/wishlist/:productId/check', wishlistController.checkWishlist);
router.get('/wishlist/count', wishlistController.getWishlistCount);

export default router;
