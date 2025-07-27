import { productQueries } from '../db/query/Productquery.js';

export const productController = {
  // Create new product
  createProduct: async (req, res) => {
    try {
      console.log('=== CREATE PRODUCT REQUEST ===');
      console.log('Request body:', req.body);
      console.log('Uploaded files:', req.files);
      console.log('User:', req.user?.id);

      const { title, description, price, categoryId, condition, brand, model } = req.body;
      
      // Handle uploaded images
      let imagePaths = [];
      if (req.files && req.files.length > 0) {
        imagePaths = req.files.map(file => `/uploads/products/${file.filename}`);
        console.log('Product images uploaded:', imagePaths);
      }

      const productData = {
        title,
        description,
        price: parseFloat(price),
        categoryId: parseInt(categoryId),
        sellerId: req.user.id,
        condition,
        brand,
        model,
        images: imagePaths
      };

      console.log('Product data to save:', productData);

      const newProduct = await productQueries.createProduct(productData);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: { product: newProduct }
      });

    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get all products with filters
  getAllProducts: async (req, res) => {
    try {
      const {
        category,
        minPrice,
        maxPrice,
        condition,
        search,
        isSold,
        page = 1,
        limit = 20
      } = req.query;

      const filters = {
        category,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        condition,
        search,
        isSold: isSold !== undefined ? isSold === 'true' : undefined,
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      };

      const products = await productQueries.getAllProducts(filters);

      res.json({
        success: true,
        data: {
          products,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            hasMore: products.length === parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get product by ID
  getProductById: async (req, res) => {
    try {
      const { id } = req.params;
      const product = await productQueries.getById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        data: { product }
      });

    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get products by seller
  getSellerProducts: async (req, res) => {
    try {
      const { sellerId } = req.params;
      const products = await productQueries.getBySeller(sellerId);

      res.json({
        success: true,
        data: { products }
      });

    } catch (error) {
      console.error('Get seller products error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get current user's products
  getMyProducts: async (req, res) => {
    try {
      const products = await productQueries.getBySeller(req.user.id);

      res.json({
        success: true,
        data: { products }
      });

    } catch (error) {
      console.error('Get my products error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Update product
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, price, categoryId, condition, brand, model, existingImages } = req.body;

      console.log('Updating product with data:', {
        title, description, price, categoryId, condition, brand, model,
        newFiles: req.files?.length || 0,
        existingImages: existingImages ? JSON.parse(existingImages) : []
      });

      // Check if product exists and belongs to user
      const existingProduct = await productQueries.getById(id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      if (existingProduct.seller_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own products'
        });
      }

      // Handle images - combine existing images with new uploads
      let images = [];
      
      // Add existing images that user wants to keep
      if (existingImages) {
        try {
          const parsedExistingImages = JSON.parse(existingImages);
          images = [...parsedExistingImages];
        } catch (e) {
          console.error('Error parsing existing images:', e);
        }
      }

      // Add new uploaded images
      if (req.files && req.files.length > 0) {
        const newImagePaths = req.files.map(file => `/uploads/products/${file.filename}`);
        images = [...images, ...newImagePaths];
        console.log(`Added ${newImagePaths.length} new images:`, newImagePaths);
      }

      // If no images at all, keep the original images
      if (images.length === 0) {
        images = existingProduct.images;
      }

      console.log('Final images array:', images);

      const productData = {
        title,
        description,
        price: parseFloat(price),
        categoryId: parseInt(categoryId),
        condition,
        brand,
        model,
        images
      };

      const updatedProduct = await productQueries.updateProduct(id, productData);

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: { product: updatedProduct }
      });

    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Mark product as sold/unsold
  toggleSoldStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { isSold } = req.body;

      // Check if product exists and belongs to user
      const existingProduct = await productQueries.getById(id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      if (existingProduct.seller_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own products'
        });
      }

      const updatedProduct = await productQueries.markAsSold(id, isSold);

      res.json({
        success: true,
        message: `Product marked as ${isSold ? 'sold' : 'available'}`,
        data: { product: updatedProduct }
      });

    } catch (error) {
      console.error('Toggle sold status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Delete product
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;

      // Check if product exists and belongs to user
      const existingProduct = await productQueries.getById(id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      if (existingProduct.seller_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own products'
        });
      }

      await productQueries.deleteProduct(id);

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });

    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get categories
  getCategories: async (req, res) => {
    try {
      const categories = await productQueries.getCategories();

      res.json({
        success: true,
        data: { categories }
      });

    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get products by category
  getByCategory: async (req, res) => {
    try {
      const { categoryId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const products = await productQueries.getByCategory(categoryId);

      // Apply pagination
      const startIndex = (parseInt(page) - 1) * parseInt(limit);
      const endIndex = startIndex + parseInt(limit);
      const paginatedProducts = products.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: {
          products: paginatedProducts,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: products.length,
            hasMore: endIndex < products.length
          }
        }
      });

    } catch (error) {
      console.error('Get products by category error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Search products
  searchProducts: async (req, res) => {
    try {
      const { q, page = 1, limit = 20 } = req.query;

      if (!q || q.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const products = await productQueries.searchProducts(q.trim(), parseInt(limit), offset);

      res.json({
        success: true,
        data: {
          products,
          query: q.trim(),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            hasMore: products.length === parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Search products error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};
