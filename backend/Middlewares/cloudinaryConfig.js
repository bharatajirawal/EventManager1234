require('dotenv').config(); // Add this at the top

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Enhanced logging with environment check
const isDevelopment = process.env.NODE_ENV !== 'production';

if (isDevelopment) {
  console.log('Cloudinary Config - Cloud Name:', process.env.CLOUD_NAME);
  console.log('Cloudinary Config - API Key exists:', !!process.env.CLOUD_API_KEY);
  console.log('Cloudinary Config - API Secret exists:', !!process.env.CLOUD_API_SECRET);
}

// Validate required environment variables
const requiredEnvVars = ['CLOUD_NAME', 'CLOUD_API_KEY', 'CLOUD_API_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required Cloudinary environment variables:', missingEnvVars);
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true, // Always use HTTPS
  timeout: 60000, // 60 seconds timeout
});

// Test Cloudinary connection (optional)
const testCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    if (isDevelopment) {
      console.log('Cloudinary connection successful:', result.status);
    }
  } catch (error) {
    console.error('Cloudinary connection failed:', error.message);
  }
};

// Enhanced storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'eventhub_events',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff'], // Extended formats
    transformation: [
      { 
        width: 1000, 
        height: 800, 
        crop: 'limit', // Maintains aspect ratio
        quality: 'auto:good', // Automatic quality optimization
        format: 'auto' // Automatic format selection for best performance
      }
    ],
    // Generate unique filename with timestamp
    public_id: (req, file) => {
      const timestamp = Date.now();
      const originalName = file.originalname.split('.')[0];
      return `event_${timestamp}_${originalName}`;
    }
  }
});

// Helper function to delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (isDevelopment) {
      console.log('Image deleted successfully:', result);
    }
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error.message);
    throw error;
  }
};

// Helper function to get optimized image URL
const getOptimizedImageUrl = (publicId, options = {}) => {
  const defaultOptions = {
    width: 400,
    height: 300,
    crop: 'fill',
    quality: 'auto:good',
    format: 'auto'
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  return cloudinary.url(publicId, mergedOptions);
};

// Helper function to validate image before upload
const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.mimetype)) {
    const fileExtension = file.originalname.split('.').pop().toUpperCase();
    throw new Error(`${fileExtension} format is not supported. Please use JPEG, PNG, GIF, WEBP, BMP, or TIFF images.`);
  }
  
  if (file.size > maxSize) {
    throw new Error('File too large. Please choose an image smaller than 5MB.');
  }
  
  return true;
};

// Error handling middleware for Cloudinary uploads
const handleCloudinaryError = (error) => {
  if (error.message.includes('Invalid image file')) {
    return 'Invalid image file. Please upload a valid image format.';
  } else if (error.message.includes('File size too large')) {
    return 'File too large. Please choose a smaller image.';
  } else if (error.message.includes('Unsupported format')) {
    return 'Unsupported image format. Please use JPEG, PNG, GIF, WEBP, BMP, or TIFF.';
  } else if (error.message.includes('timeout')) {
    return 'Upload timed out. Please try again with a smaller image.';
  } else if (error.message.includes('network')) {
    return 'Network error during upload. Please check your connection and try again.';
  } else {
    return 'Image upload failed. Please try again.';
  }
};

// Initialize connection test in development
if (isDevelopment) {
  testCloudinaryConnection();
}

module.exports = { 
  storage, 
  cloudinary, 
  deleteImage, 
  getOptimizedImageUrl, 
  validateImageFile,
  handleCloudinaryError 
};