// Simple test for local image path validation

import { validateImagePaths } from '../middleware/upload.js';

// Mock request and response objects
const mockRequest = (body) => ({
  body
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe('Local Image Path Validation Tests', () => {
  test('should validate correct image paths', () => {
    // Setup
    const req = mockRequest({
      profileImage: '/home/user/pictures/profile.jpg'
    });
    const res = mockResponse();
    
    // Execute middleware
    const middleware = validateImagePaths('profileImage');
    middleware(req, res, mockNext);
    
    // Assert
    expect(mockNext).toHaveBeenCalled();
    expect(req.validatedImagePaths).toEqual(['/home/user/pictures/profile.jpg']);
  });
  
  test('should reject invalid image paths', () => {
    // Setup
    const req = mockRequest({
      profileImage: '/home/user/documents/file.txt'
    });
    const res = mockResponse();
    
    // Execute middleware
    const middleware = validateImagePaths('profileImage');
    middleware(req, res, mockNext);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Invalid image paths provided'
    }));
  });
});
