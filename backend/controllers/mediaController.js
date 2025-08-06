const Media = require('../models/Media');
const User = require('../models/User');
const archiver = require('archiver');
const sharp = require('sharp');
const path = require('path');
const {
  uploadSingle,
  uploadMultiple,
  deleteFromCloudinary,
  handleUploadError
} = require('../utils/upload');

// Helper function to get image dimensions
const getImageDimensions = async (filePath) => {
  try {
    const metadata = await sharp(filePath).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0
    };
  } catch (error) {
    console.error('Error getting image dimensions:', error);
    return { width: 0, height: 0 };
  }
};

// Upload single image
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const { title, description, tags } = req.body;
    const userId = req.user.userId;

    // Get image dimensions
    const dimensions = await getImageDimensions(req.file.path);

    // Create media entry
    const media = new Media({
      title: title || req.file.originalname,
      description: description || '',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      originalUrl: `/uploads/${req.file.filename}`,
      thumbnailUrl: `/uploads/${req.file.filename}`,
      publicId: req.file.filename,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      dimensions,
      uploadedBy: userId
    });

    await media.save();

    // Populate user info
    await media.populate('uploadedBy', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      media
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image'
    });
  }
};

// Upload multiple images
const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    const { title, description, tags } = req.body;
    const userId = req.user.userId;
    const uploadedMedia = [];

    for (const file of req.files) {
      // Get image dimensions
      const dimensions = await getImageDimensions(file.path);

      const media = new Media({
        title: title || file.originalname,
        description: description || '',
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        originalUrl: `/uploads/${file.filename}`,
        thumbnailUrl: `/uploads/${file.filename}`,
        publicId: file.filename,
        fileSize: file.size,
        mimeType: file.mimetype,
        dimensions,
        uploadedBy: userId
      });

      await media.save();
      await media.populate('uploadedBy', 'name email avatar');
      uploadedMedia.push(media);
    }

    res.status(201).json({
      success: true,
      message: `${uploadedMedia.length} images uploaded successfully`,
      media: uploadedMedia
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images'
    });
  }
};

// Get all media (with pagination and filters)
const getAllMedia = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      userId
    } = req.query;

    const skip = (page - 1) * limit;
    const query = { isActive: true };

    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Add tags filter
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Add user filter
    if (userId) {
      query.uploadedBy = userId;
    }

    // Add public filter for non-admin users
    if (!req.user || req.user.role !== 'admin') {
      query.isPublic = true;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const media = await Media.find(query)
      .populate('uploadedBy', 'name email avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Media.countDocuments(query);

    res.status(200).json({
      success: true,
      media,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch media'
    });
  }
};

// Get single media by ID
const getMediaById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const media = await Media.findById(id)
      .populate('uploadedBy', 'name email avatar');

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Check if user can access this media
    if (!media.isPublic && media.uploadedBy._id.toString() !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Increment view count
    await media.incrementViewCount();

    res.status(200).json({
      success: true,
      media
    });
  } catch (error) {
    console.error('Get media by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch media'
    });
  }
};

// Update media
const updateMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, tags, isPublic } = req.body;
    const userId = req.user.userId;

    console.log('Update media request:', { id, title, description, tags, isPublic, userId });

    const media = await Media.findById(id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Check if user can update this media
    // If media has no uploadedBy, only admins can edit
    // If media has uploadedBy, owner or admin can edit
    if (media.uploadedBy) {
      if (media.uploadedBy.toString() !== userId.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    } else {
      // Media has no uploadedBy, only admins can edit
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Update fields
    if (title !== undefined) media.title = title;
    if (description !== undefined) media.description = description;
    if (tags !== undefined) {
      // Handle tags as either string or array
      if (typeof tags === 'string') {
        media.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      } else if (Array.isArray(tags)) {
        media.tags = tags.filter(tag => tag && tag.trim().length > 0);
      }
    }
    if (isPublic !== undefined && req.user.role === 'admin') media.isPublic = isPublic;

    await media.save();
    await media.populate('uploadedBy', 'name email avatar');

    console.log('Media updated successfully:', media);

    res.status(200).json({
      success: true,
      message: 'Media updated successfully',
      media
    });
  } catch (error) {
    console.error('Update media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update media'
    });
  }
};

// Delete media
const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const media = await Media.findById(id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Check if user can delete this media
    if (media.uploadedBy.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete file from local storage
    try {
      const fs = require('fs');
      const filePath = path.join(__dirname, '..', media.originalUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      // Continue with database deletion even if file deletion fails
    }

    // Soft delete from database
    media.isActive = false;
    await media.save();

    res.status(200).json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete media'
    });
  }
};

// Toggle like
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const media = await Media.findById(id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    await media.toggleLike(userId);
    await media.populate('uploadedBy', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Like toggled successfully',
      media
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like'
    });
  }
};

// Download single image
const downloadImage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    console.log('Single download request for media ID:', id);
    console.log('User ID:', userId);

    const media = await Media.findById(id);

    if (!media) {
      console.log('Media not found for ID:', id);
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    console.log('Found media:', media.title);

    // Check if user can access this media
    if (!media.isPublic && media.uploadedBy.toString() !== userId && req.user?.role !== 'admin') {
      console.log('Access denied for media:', media._id);
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Increment download count
    await media.incrementDownloadCount();

    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${media.title}.jpg"`);
    res.setHeader('Content-Type', media.mimeType);

    // Serve the file directly
    const filePath = path.join(__dirname, '..', media.originalUrl.substring(1));
    
    console.log('Serving file from path:', filePath);
    
    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      console.log('File does not exist:', filePath);
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }
    
    res.sendFile(filePath);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download image'
    });
  }
};

// Download multiple images as ZIP
const downloadMultipleAsZip = async (req, res) => {
  try {
    console.log('=== DOWNLOAD ZIP REQUEST START ===');
    console.log('Download ZIP request received:', req.body);
    console.log('User:', req.user);
    console.log('Headers:', req.headers);
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    
    const { mediaIds } = req.body;
    const userId = req.user?.userId;
    
    console.log('Media IDs:', mediaIds);
    console.log('User ID:', userId);

    if (!mediaIds || !Array.isArray(mediaIds) || mediaIds.length === 0) {
      console.log('Invalid mediaIds:', mediaIds);
      return res.status(400).json({
        success: false,
        message: 'Please provide valid image IDs'
      });
    }

    console.log('Looking for media with IDs:', mediaIds);

    // Get media items
    const mediaItems = await Media.find({
      _id: { $in: mediaIds },
      isActive: true
    });

    console.log('Found media items:', mediaItems.length);

    if (mediaItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No media found'
      });
    }

    // Check access permissions - for now, allow all public media
    for (const media of mediaItems) {
      if (!media.isPublic && media.uploadedBy && media.uploadedBy.toString() !== userId && req.user?.role !== 'admin') {
        console.log('Access denied for media:', media._id);
        return res.status(403).json({
          success: false,
          message: 'Access denied to some images'
        });
      }
    }

    console.log('Creating ZIP archive...');

    // Create ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Handle archive errors
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to create ZIP file'
      });
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="media-gallery-${Date.now()}.zip"`);

    // Pipe archive to response
    archive.pipe(res);

    // Add files to archive
    let filesAdded = 0;
    for (const media of mediaItems) {
      const fileName = `${media.title.replace(/[^a-z0-9]/gi, '_')}.jpg`;
      // Fix the file path construction - media.originalUrl starts with /uploads/
      const filePath = path.join(__dirname, '..', media.originalUrl.substring(1));
      
      console.log('Processing media:', media._id);
      console.log('Media title:', media.title);
      console.log('Media originalUrl:', media.originalUrl);
      console.log('Adding file to archive:', fileName, 'from path:', filePath);
      
      // Check if file exists
      const fs = require('fs');
      if (!fs.existsSync(filePath)) {
        console.log('File does not exist:', filePath);
        console.log('Current directory:', __dirname);
        console.log('Parent directory:', path.join(__dirname, '..'));
        continue;
      }
      
      try {
        archive.file(filePath, { name: fileName });
        filesAdded++;
        console.log('Successfully added file to archive:', fileName);
        
        // Increment download count
        await Media.findByIdAndUpdate(media._id, { $inc: { downloadCount: 1 } });
      } catch (error) {
        console.error('Error adding file to archive:', fileName, error);
      }
    }
    
    console.log('Total files added to archive:', filesAdded);
    
    if (filesAdded === 0) {
      return res.status(404).json({
        success: false,
        message: 'No files found to download'
      });
    }

    console.log('Finalizing archive...');
    // Finalize archive
    try {
      await archive.finalize();
      console.log('Archive finalized successfully');
      console.log('=== DOWNLOAD ZIP REQUEST END ===');
    } catch (error) {
      console.error('Error finalizing archive:', error);
      // Don't send response here as it might already be sent
    }

  } catch (error) {
    console.error('=== DOWNLOAD ZIP ERROR ===');
    console.error('ZIP download error:', error);
    console.error('Error stack:', error.stack);
    
    // Check if response has already been sent
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to create ZIP file'
      });
    }
  }
};

// Get popular media
const getPopularMedia = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const media = await Media.find({ isPublic: true, isActive: true })
      .populate('uploadedBy', 'name email avatar')
      .sort({ viewCount: -1, likeCount: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      media
    });
  } catch (error) {
    console.error('Get popular media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular media'
    });
  }
};

// Get recent media
const getRecentMedia = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const media = await Media.find({ isPublic: true, isActive: true })
      .populate('uploadedBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      media
    });
  } catch (error) {
    console.error('Get recent media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent media'
    });
  }
};

// Get user's media
const getUserMedia = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    const query = { uploadedBy: userId, isActive: true };

    // If not admin and not own media, only show public
    if (req.user.role !== 'admin' && req.user.userId !== userId) {
      query.isPublic = true;
    }

    const media = await Media.find(query)
      .populate('uploadedBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Media.countDocuments(query);

    res.status(200).json({
      success: true,
      media,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get user media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user media'
    });
  }
};

module.exports = {
  uploadImage,
  uploadMultipleImages,
  getAllMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
  toggleLike,
  downloadImage,
  downloadMultipleAsZip,
  getPopularMedia,
  getRecentMedia,
  getUserMedia
};
