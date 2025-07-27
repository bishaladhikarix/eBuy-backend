/**
 * eBuy Backend API - Postman Collection Examples
 * ==============================================
 */

// Base URL
const BASE_URL = 'http://localhost:5000/api';

/**
 * AUTHENTICATION ENDPOINTS
 */

// Register User
POST ${BASE_URL}/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "address": "123 Main St, City, State"
}

// Login User
POST ${BASE_URL}/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}

// Get Profile (Protected)
GET ${BASE_URL}/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN

// Update Profile (Protected)
PUT ${BASE_URL}/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

firstName: John
lastName: Smith
phone: +1234567891
address: 456 New St, City, State
profileImage: [file]

/**
 * PRODUCT ENDPOINTS
 */

// Get All Products
GET ${BASE_URL}/products?page=1&limit=20&category=Laptops&minPrice=100&maxPrice=2000

// Search Products
GET ${BASE_URL}/products/search?q=gaming laptop&page=1&limit=20

// Get Product by ID
GET ${BASE_URL}/products/1

// Create Product (Protected)
POST ${BASE_URL}/products
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

title: Gaming Laptop RTX 4070
description: High-performance gaming laptop with RTX 4070 graphics card
price: 1499.99
categoryId: 1
condition: new
brand: ASUS
model: ROG Strix G15
specifications: {"cpu": "Intel i7-12700H", "ram": "16GB DDR4", "storage": "1TB SSD"}
productImages: [file1, file2, file3, file4, file5, file6]

// Update Product (Protected)
PUT ${BASE_URL}/products/1
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

title: Updated Gaming Laptop
description: Updated description
price: 1399.99
categoryId: 1
condition: like new

// Mark Product as Sold (Protected)
PATCH ${BASE_URL}/products/1/sold
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "isSold": true
}

/**
 * CHAT ENDPOINTS
 */

// Create or Get Chat Room (Protected)
POST ${BASE_URL}/chat/rooms
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "otherUserId": 2
}

// Get User's Chat Rooms (Protected)
GET ${BASE_URL}/chat/rooms
Authorization: Bearer YOUR_JWT_TOKEN

// Send Message (Protected)
POST ${BASE_URL}/chat/rooms/1/messages
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "content": "Hello! Is this product still available?",
  "messageType": "text"
}

// Get Room Messages (Protected)
GET ${BASE_URL}/chat/rooms/1/messages?page=1&limit=50
Authorization: Bearer YOUR_JWT_TOKEN

/**
 * CART & WISHLIST ENDPOINTS
 */

// Add to Cart (Protected)
POST ${BASE_URL}/user/cart
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "productId": 1,
  "quantity": 1
}

// Get Cart (Protected)
GET ${BASE_URL}/user/cart
Authorization: Bearer YOUR_JWT_TOKEN

// Add to Wishlist (Protected)
POST ${BASE_URL}/user/wishlist
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "productId": 1
}

// Get Wishlist (Protected)
GET ${BASE_URL}/user/wishlist
Authorization: Bearer YOUR_JWT_TOKEN

/**
 * CATEGORIES
 */

// Get All Categories
GET ${BASE_URL}/products/categories

/**
 * SOCKET.IO EVENTS
 */

// Client Connection
const socket = io('http://localhost:5000', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});

// Join Room
socket.emit('join_room', roomId);

// Send Message
socket.emit('send_message', {
  roomId: 1,
  content: 'Hello!',
  messageType: 'text'
});

// Listen for New Messages
socket.on('new_message', (message) => {
  console.log('New message:', message);
});

// Typing Indicator
socket.emit('typing', {
  roomId: 1,
  isTyping: true
});

/**
 * ERROR RESPONSES
 */

// All API responses follow this format:

// Success Response
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}

// Error Response
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors array (if applicable)
  ]
}

/**
 * AUTHENTICATION
 */

// For protected routes, include the JWT token in the Authorization header:
// Authorization: Bearer YOUR_JWT_TOKEN

// The token is received when logging in or registering:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* user data */ },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
