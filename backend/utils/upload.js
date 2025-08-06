const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only JPG, JPEG, and PNG files are allowed'), false);
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return cb(new Error('File size must be less than 5MB'), false);
  }

  cb(null, true);
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10 // Max 10 files at once
  }
});

// Single file upload
const uploadSingle = upload.single('image');

// Multiple files upload
const uploadMultiple = upload.array('images', 10);

// Upload to local storage with custom options
const uploadToLocal = async (file, options = {}) => {
  try {
    // For now, just return the file info
    return {
      original: {
        url: `/uploads/${file.filename}`,
        public_id: file.filename,
        secure_url: `/uploads/${file.filename}`,
        width: 0,
        height: 0,
        format: path.extname(file.originalname).substring(1),
        resource_type: 'image',
        created_at: new Date().toISOString(),
        bytes: file.size
      },
      thumbnail: {
        url: `/uploads/${file.filename}`,
        public_id: file.filename,
        secure_url: `/uploads/${file.filename}`,
        width: 300,
        height: 300,
        format: path.extname(file.originalname).substring(1),
        resource_type: 'image',
        created_at: new Date().toISOString(),
        bytes: file.size
      }
    };
  } catch (error) {
    console.error('Local upload error:', error);
    throw new Error('Failed to upload image');
  }
};

// Delete from local storage
const deleteFromLocal = async (filename) => {
  try {
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { result: 'ok' };
    }
    return { result: 'not_found' };
  } catch (error) {
    console.error('Local delete error:', error);
    throw new Error('Failed to delete image');
  }
};

// Get image info from local storage
const getImageInfo = async (filename) => {
  try {
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      return {
        public_id: filename,
        format: path.extname(filename).substring(1),
        resource_type: 'image',
        created_at: stats.birthtime.toISOString(),
        bytes: stats.size,
        width: 0,
        height: 0
      };
    }
    throw new Error('File not found');
  } catch (error) {
    console.error('Local get info error:', error);
    throw new Error('Failed to get image info');
  }
};

// Generate different sizes for responsive images (placeholder for now)
const generateResponsiveImages = async (filename) => {
  try {
    const baseUrl = `/uploads/${filename}`;
    return {
      '300x300': baseUrl,
      '600x600': baseUrl,
      '1200x1200': baseUrl
    };
  } catch (error) {
    console.error('Generate responsive images error:', error);
    throw new Error('Failed to generate responsive images');
  }
};

// Middleware to handle upload errors
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size must be less than 5MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 files can be uploaded at once'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field'
      });
    }
  }

  if (error.message.includes('Only JPG, JPEG, and PNG files are allowed')) {
    return res.status(400).json({
      success: false,
      message: 'Only JPG, JPEG, and PNG files are allowed'
    });
  }

  if (error.message.includes('File size must be less than 5MB')) {
    return res.status(400).json({
      success: false,
      message: 'File size must be less than 5MB'
    });
  }

  console.error('Upload error:', error);
  res.status(500).json({
    success: false,
    message: 'File upload failed'
  });
};

// Validate file before upload
const validateFile = (file) => {
  const errors = [];

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.mimetype)) {
    errors.push('Only JPG, JPEG, and PNG files are allowed');
  }

  // Check file size
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    errors.push('File size must be less than 5MB');
  }

  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(fileExtension)) {
    errors.push('Invalid file extension');
  }

  return errors;
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadToCloudinary: uploadToLocal, // Alias for compatibility
  deleteFromCloudinary: deleteFromLocal, // Alias for compatibility
  getImageInfo,
  generateResponsiveImages,
  handleUploadError,
  validateFile
};
