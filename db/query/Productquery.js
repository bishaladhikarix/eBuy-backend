import pool from '../config.js';
import { fuzzyBrandSearch } from '../../utils/fuzzySearch.js';

export const productQueries = {
  // Create product
  createProduct: async (productData) => {
    const { title, description, price, categoryId, sellerId, condition, brand, model, images } = productData;
    const result = await pool.query(
      `INSERT INTO products (title, description, price, category_id, seller_id, condition, brand, model, images) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [title, description, price, categoryId, sellerId, condition, brand, model, images]
    );
    return result.rows[0];
  },

  // Get all products with filters
  getAllProducts: async (filters = {}) => {
    let query = `
      SELECT p.*, c.name as category_name, u.username as seller_name, u.first_name, u.last_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 0;

    if (filters.category) {
      paramCount++;
      query += ` AND c.name ILIKE $${paramCount}`;
      values.push(`%${filters.category}%`);
    }

    if (filters.minPrice) {
      paramCount++;
      query += ` AND p.price >= $${paramCount}`;
      values.push(filters.minPrice);
    }

    if (filters.maxPrice) {
      paramCount++;
      query += ` AND p.price <= $${paramCount}`;
      values.push(filters.maxPrice);
    }

    if (filters.condition) {
      paramCount++;
      query += ` AND p.condition = $${paramCount}`;
      values.push(filters.condition);
    }

    if (filters.search) {
      paramCount++;
      query += ` AND (p.title ILIKE $${paramCount} OR p.description ILIKE $${paramCount} OR p.brand ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
    }

    if (filters.isSold !== undefined) {
      paramCount++;
      query += ` AND p.is_sold = $${paramCount}`;
      values.push(filters.isSold);
    }

    // Handle fuzzy brand search
    if (filters.brand_search && filters.fuzzy) {
      console.log(`🔍 Fuzzy brand search requested for: "${filters.brand_search}"`);
      
      // For fuzzy search, get all products first (with other filters applied)
      query += ' ORDER BY p.created_at DESC';
      
      const result = await pool.query(query, values);
      const allProducts = result.rows;
      console.log(`📦 Found ${allProducts.length} total products to search through`);
      
      // Apply fuzzy brand search
      const fuzzyResults = fuzzyBrandSearch(allProducts, filters.brand_search, {
        threshold: 0.25, // Lower threshold for more inclusive results
        includeScore: true
      });
      
      console.log(`✨ Fuzzy search found ${fuzzyResults.length} matching products`);
      if (fuzzyResults.length > 0) {
        console.log(`🏆 Top matches:`, fuzzyResults.slice(0, 3).map(p => `${p.brand} (${p.searchScore}%)`));
      }
      
      // Apply pagination to fuzzy results
      let products = fuzzyResults;
      if (filters.offset || filters.limit) {
        const startIndex = filters.offset || 0;
        const endIndex = filters.limit ? startIndex + filters.limit : products.length;
        products = products.slice(startIndex, endIndex);
        console.log(`📄 Paginated to ${products.length} products (offset: ${startIndex}, limit: ${filters.limit})`);
      }
      
      return products;
    } else if (filters.brand_search && !filters.fuzzy) {
      console.log(`🔍 Regular brand search for: "${filters.brand_search}"`);
      // Regular brand search (partial match)
      paramCount++;
      query += ` AND p.brand ILIKE $${paramCount}`;
      values.push(`%${filters.brand_search}%`);
    }

    query += ' ORDER BY p.created_at DESC';

    if (filters.limit) {
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
    }

    if (filters.offset) {
      paramCount++;
      query += ` OFFSET $${paramCount}`;
      values.push(filters.offset);
    }

    const result = await pool.query(query, values);
    return result.rows;
  },

  // Get product by ID
  getById: async (id) => {
    const result = await pool.query(
      `SELECT p.*, c.name as category_name, u.username as seller_name, u.first_name, u.last_name, u.email as seller_email
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN users u ON p.seller_id = u.id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Get products by seller
  getBySeller: async (sellerId) => {
    const result = await pool.query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.seller_id = $1
       ORDER BY p.created_at DESC`,
      [sellerId]
    );
    return result.rows;
  },

  // Update product
  updateProduct: async (id, productData) => {
    const { title, description, price, categoryId, condition, brand, model, images } = productData;
    
    console.log('Updating product with data:', productData);
    console.log('SQL parameters:', [id, title, description, price, categoryId, condition, brand, model, images]);
    
    const result = await pool.query(
      `UPDATE products SET 
        title = $2, 
        description = $3, 
        price = $4, 
        category_id = $5, 
        condition = $6, 
        brand = $7, 
        model = $8, 
        images = $9, 
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 RETURNING *`,
      [id, title, description, price, categoryId, condition, brand, model, images]
    );
    return result.rows[0];
  },

  // Mark product as sold
  markAsSold: async (id, isSold = true) => {
    const result = await pool.query(
      'UPDATE products SET is_sold = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id, isSold]
    );
    return result.rows[0];
  },

  // Delete product
  deleteProduct: async (id) => {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },

  // Get categories
  getCategories: async () => {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    return result.rows;
  },

  // Get products by category
  getByCategory: async (categoryId) => {
    const result = await pool.query(
      `SELECT p.*, c.name as category_name, u.username as seller_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN users u ON p.seller_id = u.id
       WHERE p.category_id = $1 AND p.is_sold = false
       ORDER BY p.created_at DESC`,
      [categoryId]
    );
    return result.rows;
  },

  // Search products
  searchProducts: async (searchTerm, limit = 20, offset = 0) => {
    const result = await pool.query(
      `SELECT p.*, c.name as category_name, u.username as seller_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN users u ON p.seller_id = u.id
       WHERE (p.title ILIKE $1 OR p.description ILIKE $1 OR p.brand ILIKE $1 OR c.name ILIKE $1)
       AND p.is_sold = false
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [`%${searchTerm}%`, limit, offset]
    );
    return result.rows;
  }
};