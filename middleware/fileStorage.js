// Utility for handling local file copies for profile and product images
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

// ES modules setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base path for uploads
const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  console.log(`Created uploads directory at ${UPLOADS_DIR}`);
}

// Create subdirectories if they don't exist
const USER_UPLOADS_DIR = path.join(UPLOADS_DIR, 'users');
const PRODUCT_UPLOADS_DIR = path.join(UPLOADS_DIR, 'products');

if (!fs.existsSync(USER_UPLOADS_DIR)) {
  fs.mkdirSync(USER_UPLOADS_DIR, { recursive: true });
}

if (!fs.existsSync(PRODUCT_UPLOADS_DIR)) {
  fs.mkdirSync(PRODUCT_UPLOADS_DIR, { recursive: true });
}

/**
 * Copy a file from a source path to the uploads directory with a unique name
 * @param {string} sourcePath - Original file path
 * @param {string} type - Type of upload ('user' or 'product')
 * @returns {string} - The relative path to the copied file (for storing in DB)
 */
export const saveLocalImageCopy = (sourcePath, type = 'user') => {
  try {
    // Get file extension
    const ext = path.extname(sourcePath);
    
    // Generate unique filename
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const fileName = `${Date.now()}_${uniqueId}${ext}`;
    
    // Determine target directory
    const targetDir = type === 'user' ? USER_UPLOADS_DIR : PRODUCT_UPLOADS_DIR;
    const targetPath = path.join(targetDir, fileName);
    
    // For testing purposes, if the source path starts with a URL-like format,
    // we'll just return the path as is (simulating the copy)
    if (sourcePath.startsWith('http://') || sourcePath.startsWith('https://') || sourcePath.startsWith('blob:')) {
      return sourcePath;
    }
    
    // Check if source file exists
    if (!fs.existsSync(sourcePath)) {
      console.error(`Source file does not exist: ${sourcePath}`);
      return null;
    }
    
    // Copy the file
    fs.copyFileSync(sourcePath, targetPath);
    
    // Return the relative path (for storing in DB and serving via static middleware)
    return `/uploads/${type}s/${fileName}`;
  } catch (error) {
    console.error('Error saving local image copy:', error);
    return null;
  }
};

/**
 * Save multiple images
 * @param {Array<string>} sourcePaths - Array of file paths
 * @param {string} type - Type of upload ('user' or 'product')
 * @returns {Array<string>} - Array of relative paths
 */
export const saveMultipleLocalImageCopies = (sourcePaths, type = 'product') => {
  if (!Array.isArray(sourcePaths)) {
    return [];
  }
  
  return sourcePaths
    .map(path => saveLocalImageCopy(path, type))
    .filter(path => path !== null); // Filter out failed copies
};

export default {
  saveLocalImageCopy,
  saveMultipleLocalImageCopies
};
