# eBuy Backend - E-commerce API

A comprehensive backend API for an electronic products e-commerce platform built with Node.js, Express, PostgreSQL, and Socket.IO.

## 🚀 Features

### Core Features
- **User Authentication & Authorization** - JWT-based auth system
- **Product Management** - CRUD operations for electronic products
- **Categories** - Laptops, Graphic Cards, Monitors, CPUs, RAM, Motherboards
- **Real-time Chat** - Socket.IO powered messaging between users
- **Shopping Cart** - Add, remove, update cart items
- **Wishlist** - Save favorite products
- **File Upload** - Product images and profile pictures
- **Search & Filter** - Advanced product search and filtering

### Product Features
- Product listing and browsing
- Category-based filtering
- Price range filtering
- Condition-based filtering (new, like new, good, fair, poor)
- Mark products as sold/available
- Edit product details
- Image upload (up to 6 images per product)

### Chat Features
- Real-time messaging between users
- Chat rooms creation
- Message read status
- Typing indicators
- Message notifications

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JSON Web Tokens (JWT)
- **Real-time**: Socket.IO
- **File Upload**: Multer
- **Validation**: express-validator
- **Password Hashing**: bcryptjs

## 📁 Project Structure

```
backend/
├── controllers/           # Request handlers
│   ├── authController.js
│   ├── productController.js
│   ├── chatController.js
│   └── cartWishlistController.js
├── db/                   # Database related files
│   ├── config.js         # Database connection
│   ├── init.js          # Database initialization
│   └── query/           # Database queries
│       ├── Userquery.js
│       ├── Productquery.js
│       ├── Chatquery.js
│       └── CartWishlistquery.js
├── middleware/          # Express middlewares
│   ├── auth.js         # Authentication middleware
│   ├── validation.js   # Input validation
│   └── upload.js       # File upload handling
├── routes/             # API routes
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── chatRoutes.js
│   └── userRoutes.js
├── uploads/            # Uploaded files storage
├── socket.js          # Socket.IO configuration
├── index.js           # Main application file
├── package.json
└── .env
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env` and update the values:
   ```env
   PORT=5000
   
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=ebuy_db
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   
   # JWT Configuration
   JWT_SECRET=your_very_secure_jwt_secret_key_here
   JWT_EXPIRES_IN=7d
   
   # File Upload Configuration
   UPLOAD_PATH=uploads/
   MAX_FILE_SIZE=5242880
   
   # Server Configuration
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Set up PostgreSQL database**
   
   Create a new PostgreSQL database:
   ```sql
   CREATE DATABASE ebuy_db;
   ```

5. **Initialize database tables**
   ```bash
   npm run db:init
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on http://localhost:5000

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/profile` | Get current user profile | Yes |
| PUT | `/api/auth/profile` | Update user profile | Yes |
| PUT | `/api/auth/password` | Change password | Yes |
| GET | `/api/auth/user/:id` | Get user by ID | No |

### Product Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/products` | Get all products with filters | No |
| GET | `/api/products/categories` | Get all categories | No |
| GET | `/api/products/search` | Search products | No |
| GET | `/api/products/:id` | Get product by ID | No |
| GET | `/api/products/seller/:sellerId` | Get products by seller | No |
| GET | `/api/products/category/:categoryId` | Get products by category | No |
| POST | `/api/products` | Create new product | Yes |
| GET | `/api/products/my/products` | Get current user's products | Yes |
| PUT | `/api/products/:id` | Update product | Yes |
| PATCH | `/api/products/:id/sold` | Mark product as sold/available | Yes |
| DELETE | `/api/products/:id` | Delete product | Yes |

### Chat Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/chat/rooms` | Create or get chat room | Yes |
| GET | `/api/chat/rooms` | Get user's chat rooms | Yes |
| POST | `/api/chat/rooms/:roomId/messages` | Send message | Yes |
| GET | `/api/chat/rooms/:roomId/messages` | Get room messages | Yes |
| PATCH | `/api/chat/rooms/:roomId/read` | Mark messages as read | Yes |
| GET | `/api/chat/unread-count` | Get unread message count | Yes |
| DELETE | `/api/chat/messages/:messageId` | Delete message | Yes |

### User Endpoints (Cart & Wishlist)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/user/cart` | Add to cart | Yes |
| GET | `/api/user/cart` | Get user's cart | Yes |
| PUT | `/api/user/cart/:productId` | Update cart quantity | Yes |
| DELETE | `/api/user/cart/:productId` | Remove from cart | Yes |
| DELETE | `/api/user/cart` | Clear cart | Yes |
| GET | `/api/user/cart/count` | Get cart count | Yes |
| POST | `/api/user/wishlist` | Add to wishlist | Yes |
| GET | `/api/user/wishlist` | Get user's wishlist | Yes |
| DELETE | `/api/user/wishlist/:productId` | Remove from wishlist | Yes |
| GET | `/api/user/wishlist/:productId/check` | Check if in wishlist | Yes |
| GET | `/api/user/wishlist/count` | Get wishlist count | Yes |

## 🔌 Socket.IO Events

### Client to Server Events
- `join_room` - Join a chat room
- `leave_room` - Leave a chat room
- `send_message` - Send a message
- `typing` - Send typing indicator
- `mark_read` - Mark messages as read

### Server to Client Events
- `new_message` - Receive new message
- `message_notification` - Receive message notification
- `user_typing` - Receive typing indicator
- `messages_read` - Messages marked as read
- `error` - Error notification

## 🗄️ Database Schema

### Tables
- **users** - User accounts and profiles
- **categories** - Product categories
- **products** - Product listings
- **cart** - Shopping cart items
- **wishlist** - User wishlists
- **chat_rooms** - Chat rooms between users
- **messages** - Chat messages
- **orders** - Order records (future feature)
- **order_items** - Order item details (future feature)

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run db:init` - Initialize database tables

### File Upload
- Images are stored in the `uploads/` directory
- Supported formats: JPEG, PNG, GIF
- Maximum file size: 5MB
- Maximum files per product: 6

### Error Handling
- Global error handler for unhandled errors
- Validation middleware for input validation
- Authentication middleware for protected routes
- Custom error messages for better debugging

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use strong JWT secret
3. Configure PostgreSQL connection
4. Set up file storage (local or cloud)
5. Configure CORS origins

### Database Migration
Run database initialization in production:
```bash
npm run db:init
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 📞 Support

For support, email [your-email@example.com] or create an issue in the repository.
