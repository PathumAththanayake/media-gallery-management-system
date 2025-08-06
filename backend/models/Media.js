const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  originalUrl: {
    type: String,
    required: [true, 'Original image URL is required']
  },
  thumbnailUrl: {
    type: String,
    required: [true, 'Thumbnail URL is required']
  },
  publicId: {
    type: String,
    required: [true, 'Cloudinary public ID is required']
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required']
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required']
  },
  dimensions: {
    width: {
      type: Number,
      required: [true, 'Image width is required']
    },
    height: {
      type: Number,
      required: [true, 'Image height is required']
    }
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader is required']
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  collections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection'
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
mediaSchema.index({ uploadedBy: 1 });
mediaSchema.index({ tags: 1 });
mediaSchema.index({ isPublic: 1 });
mediaSchema.index({ isActive: 1 });
mediaSchema.index({ createdAt: -1 });
mediaSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for like count
mediaSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for collection count
mediaSchema.virtual('collectionCount').get(function() {
  return this.collections.length;
});

// Method to increment download count
mediaSchema.methods.incrementDownloadCount = function() {
  this.downloadCount += 1;
  return this.save();
};

// Method to increment view count
mediaSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Instance method to toggle like
mediaSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.indexOf(userId);
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
  } else {
    this.likes.push(userId);
  }
  return this.save();
};

// Static method to find public media
mediaSchema.statics.findPublic = function() {
  return this.find({ isPublic: true, isActive: true });
};

// Static method to find by user
mediaSchema.statics.findByUser = function(userId) {
  return this.find({ uploadedBy: userId, isActive: true });
};

// Static method to find by tags
mediaSchema.statics.findByTags = function(tags) {
  return this.find({
    tags: { $in: tags },
    isPublic: true,
    isActive: true
  });
};

// Static method to search media
mediaSchema.statics.search = function(query) {
  return this.find({
    $and: [
      { isPublic: true, isActive: true },
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      }
    ]
  });
};

// Static method to get popular media
mediaSchema.statics.findPopular = function(limit = 10) {
  return this.find({ isPublic: true, isActive: true })
    .sort({ viewCount: -1, likeCount: -1 })
    .limit(limit);
};

// Static method to get recent media
mediaSchema.statics.findRecent = function(limit = 10) {
  return this.find({ isPublic: true, isActive: true })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Pre-save middleware to ensure tags are unique and lowercase
mediaSchema.pre('save', function(next) {
  if (this.tags) {
    // Remove duplicates and convert to lowercase
    this.tags = [...new Set(this.tags.map(tag => tag.toLowerCase().trim()))];
  }
  next();
});

// JSON transform to include virtuals
mediaSchema.set('toJSON', { virtuals: true });
mediaSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Media', mediaSchema);
