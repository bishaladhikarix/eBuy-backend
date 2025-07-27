// File path validation middleware - for testing with local image paths

// File path validation helper function
const isValidImagePath = (path) => {
  try {
    // Check if it's a file path with a valid image extension
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    
    // Check file extension
    const hasImageExtension = imageExtensions.some(ext => 
      path.toLowerCase().endsWith(ext)
    );
    
    // For testing, we'll just check the extension
    // In production, you might want to check if the file exists
    return hasImageExtension;
  } catch {
    return false;
  }
};

// Middleware to validate image paths instead of uploading files
export const validateImagePaths = (fieldName, maxCount = 6) => {
  return (req, res, next) => {
    try {
      console.log('Upload middleware called with body:', JSON.stringify(req.body));
      
      // Get paths from request body
      let imagePaths = [];
      
      if (fieldName === 'productImages') {
        // Handle product images from body
        if (req.body.productImages) {
          if (typeof req.body.productImages === 'string') {
            imagePaths = [req.body.productImages];
          } else if (Array.isArray(req.body.productImages)) {
            imagePaths = req.body.productImages;
          }
        }
      } else if (fieldName === 'profileImage') {
        // Handle profile image from body
        if (req.body.profileImage) {
          imagePaths = [req.body.profileImage];
        }
      }

      // Validate paths
      if (imagePaths.length > maxCount) {
        return res.status(400).json({
          success: false,
          message: `Maximum ${maxCount} images allowed`
        });
      }

      // Validate each path
      const invalidPaths = imagePaths.filter(path => !isValidImagePath(path));
      if (invalidPaths.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid image paths provided',
          invalidPaths
        });
      }

      // Store validated paths in req object for use in controllers
      req.validatedImagePaths = imagePaths;
      next();

    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error validating image paths',
        error: error.message
      });
    }
  };
};

// Export functions with same names for compatibility
export const uploadSingle = (fieldName) => validateImagePaths(fieldName, 1);
export const uploadMultiple = (fieldName, maxCount = 6) => validateImagePaths(fieldName, maxCount);
export const uploadFields = validateImagePaths; // Simplified for path validation

// Default export for backward compatibility
export default { validateImagePaths, uploadSingle, uploadMultiple, uploadFields };
