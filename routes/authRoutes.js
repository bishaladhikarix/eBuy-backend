import express from 'express';
import { authController } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';
import { uploadProfileImage, handleUploadError } from '../middleware/fileUpload.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.get('/user/:id', authController.getUserById);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);

// Test upload endpoint (for debugging)
router.post('/test-upload', 
  authenticateToken, 
  uploadProfileImage, 
  handleUploadError, 
  (req, res) => {
    console.log('TEST UPLOAD - File received:', req.file);
    res.json({
      success: true,
      message: 'Test upload successful',
      file: req.file ? {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        path: `/uploads/profiles/${req.file.filename}`
      } : null
    });
  }
);

// Profile update with file upload support
router.put('/profile', 
  authenticateToken, 
  uploadProfileImage, 
  handleUploadError, 
  authController.updateProfile
);
// Add a simpler endpoint for name updates only
router.put('/update-name', authenticateToken, authController.updateName);
router.put('/password', authenticateToken, authController.changePassword);

export default router;
