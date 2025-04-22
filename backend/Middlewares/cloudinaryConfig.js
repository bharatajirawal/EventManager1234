require('dotenv').config(); // Add this at the top

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');


console.log('Cloudinary Config - Cloud Name:', process.env.CLOUD_NAME);
console.log('Cloudinary Config - API Key exists:', !!process.env.CLOUD_API_KEY);
console.log('Cloudinary Config - API Secret exists:', !!process.env.CLOUD_API_SECRET);

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true // Always use HTTPS
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'eventhub_events',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }]
  }
});

module.exports = { storage, cloudinary };