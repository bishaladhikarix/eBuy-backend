# Image URL Storage Guide

## Overview
The eBuy backend has been updated to **store image URLs instead of files**. This eliminates the need for local file storage and provides better scalability.

## How It Works

### 🔗 Image URLs Instead of File Uploads
- **Products**: Send `productImages` as an array of URLs in the request body
- **Profile**: Send `profileImage` as a single URL in the request body
- **Validation**: URLs are automatically validated for security and format

### 📝 API Changes

#### Creating a Product
```json
POST /api/products
{
  "title": "Gaming Laptop",
  "description": "High-performance gaming laptop",
  "price": 1500,
  "categoryId": 1,
  "condition": "new",
  "brand": "ASUS",
  "productImages": [
    "https://images.unsplash.com/photo-1603302576837-37561b2e2302",
    "https://images.unsplash.com/photo-1541807084-5b52b4515c63"
  ]
}
```

#### Updating Profile
```json
PUT /api/auth/profile
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "profileImage": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
}
```

### ✅ Supported Image Sources
- **Direct image URLs**: URLs ending with .jpg, .jpeg, .png, .gif, .webp, .svg
- **Image hosting services**: 
  - Imgur (imgur.com)
  - Cloudinary (cloudinary.com)
  - Amazon S3 (amazonaws.com)
  - Google Images (googleusercontent.com)
  - Unsplash (unsplash.com)
  - Pixabay (pixabay.com)
- **HTTPS URLs**: Any valid HTTPS URL is accepted

### 🔒 URL Validation
- Maximum 6 images for products
- Maximum 1 image for profiles
- Only valid URLs are accepted
- Security validation prevents malicious URLs

### 🚀 Benefits
- **No file storage**: Eliminates server storage requirements
- **Faster uploads**: No file processing needed
- **Scalability**: Better performance for high-traffic scenarios
- **CDN support**: Direct integration with image CDNs
- **Cost effective**: Reduces server storage costs

### 📋 Migration Notes
- Existing file-based uploads are no longer supported
- Frontend applications should be updated to send URLs instead of files
- Consider using image hosting services like Cloudinary or Imgur for optimal performance

### 🛡️ Security Features
- URL format validation
- HTTPS requirement for security
- Whitelist of trusted image hosting domains
- Prevention of malicious URL injection

## Example Frontend Integration

### React/JavaScript Example
```javascript
// Instead of file upload
const formData = new FormData();
formData.append('productImages', file);

// Use URL submission
const productData = {
  title: "Product Name",
  productImages: [
    "https://your-image-host.com/image1.jpg",
    "https://your-image-host.com/image2.jpg"
  ]
};

fetch('/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(productData)
});
```

This change provides a more modern, scalable approach to image management in the eBuy e-commerce platform.
