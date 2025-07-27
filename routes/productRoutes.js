import express from 'express';
import { productController } from '../controllers/productController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { validateProduct } from '../middleware/validation.js';
import { uploadProductImages, handleProductUploadError } from '../middleware/productUpload.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, productController.getAllProducts);
router.get('/categories', productController.getCategories);
router.get('/category/:categoryId', productController.getByCategory);
router.get('/search', productController.searchProducts);
router.get('/seller/:sellerId', productController.getSellerProducts);
router.get('/:id', optionalAuth, productController.getProductById);

// Protected routes
router.post('/', 
  authenticateToken, 
  uploadProductImages, 
  handleProductUploadError, 
  productController.createProduct
);
router.get('/my/products', authenticateToken, productController.getMyProducts);
router.put('/:id', 
  authenticateToken, 
  uploadProductImages, 
  handleProductUploadError, 
  productController.updateProduct
);
router.patch('/:id/sold', authenticateToken, productController.toggleSoldStatus);
router.delete('/:id', authenticateToken, productController.deleteProduct);

export default router;
