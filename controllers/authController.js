import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userQueries } from '../db/query/Userquery.js';

export const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { username, email, password, firstName, lastName, phone, address } = req.body;

      // Check if user already exists
      const existingUser = await userQueries.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      const existingUsername = await userQueries.findByUsername(username);
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const userData = {
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        address
      };

      const newUser = await userQueries.createUser(userData);

      // Generate JWT token
      const token = jwt.sign(
        { userId: newUser.id, email: newUser.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Transform snake_case fields to camelCase
      const transformedUser = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        phone: newUser.phone,
        address: newUser.address,
        profileImage: newUser.profile_image,
        createdAt: newUser.created_at,
        updatedAt: newUser.updated_at
      };

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: transformedUser,
          token
        }
      });

    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await userQueries.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Remove password and transform field names to camelCase for frontend
      const { password: _, ...userData } = user;
      
      // Transform snake_case fields to camelCase
      const transformedUser = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        phone: userData.phone,
        address: userData.address,
        profileImage: userData.profile_image,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at
      };

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: transformedUser,
          token
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get current user profile
  getProfile: async (req, res) => {
    try {
      const userData = await userQueries.getUserWithStats(req.user.id);
      
      // Transform snake_case fields to camelCase
      const transformedUser = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        phone: userData.phone,
        address: userData.address,
        profileImage: userData.profile_image,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
        // Include any stats that are returned
        productCount: userData.product_count,
        soldCount: userData.sold_count
      };
      
      res.json({
        success: true,
        data: { user: transformedUser }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Update user profile with file upload
  updateProfile: async (req, res) => {
    try {
      console.log('=== UPDATE PROFILE REQUEST ===');
      console.log('Request body:', req.body);
      console.log('Request file:', req.file);
      console.log('User:', req.user?.id);
      console.log('Request headers:', req.headers);
      
      const { firstName, lastName, phone, address } = req.body;
      let profileImagePath = null;

      // Handle uploaded file
      if (req.file) {
        // Generate the URL path that will be stored in database and used by frontend
        profileImagePath = `/uploads/profiles/${req.file.filename}`;
        console.log('Profile image uploaded:', {
          originalName: req.file.originalname,
          filename: req.file.filename,
          path: profileImagePath,
          size: req.file.size,
          destination: req.file.destination
        });
      } else {
        console.log('No file uploaded in this request');
      }

      // Build userData object with only provided fields
      const userData = {};
      
      if (firstName !== undefined) userData.firstName = firstName;
      if (lastName !== undefined) userData.lastName = lastName;
      if (phone !== undefined) userData.phone = phone;
      if (address !== undefined) userData.address = address;
      if (profileImagePath !== null) userData.profileImage = profileImagePath;

      console.log('Data to update:', userData);

      const updatedUser = await userQueries.updateProfile(req.user.id, userData);

      // Transform snake_case fields to camelCase for consistent response
      const transformedUser = {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        phone: updatedUser.phone,
        address: updatedUser.address,
        profileImage: updatedUser.profile_image,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at
      };

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: transformedUser }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Update name fields only
  updateName: async (req, res) => {
    try {
      console.log('Update name request body:', req.body);
      const { firstName, lastName } = req.body;

      if (!firstName && !lastName) {
        return res.status(400).json({
          success: false,
          message: 'First name or last name is required for update'
        });
      }

      // Only update the name fields
      const userData = {
        firstName: firstName || req.user.first_name,
        lastName: lastName || req.user.last_name
      };

      const updatedUser = await userQueries.updateProfile(req.user.id, userData);

      // Transform snake_case fields to camelCase for consistent response
      const transformedUser = {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        phone: updatedUser.phone,
        address: updatedUser.address,
        profileImage: updatedUser.profile_image,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at
      };

      res.json({
        success: true,
        message: 'Name updated successfully',
        data: { user: transformedUser }
      });

    } catch (error) {
      console.error('Update name error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Change password
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      // Get user with password
      const user = await userQueries.findByEmail(req.user.email);
      
      // Check current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await userQueries.updatePassword(req.user.id, hashedNewPassword);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get user by ID (public profile)
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await userQueries.getUserWithStats(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: { user }
      });

    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};
