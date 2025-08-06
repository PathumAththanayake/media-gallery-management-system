const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/mediaController');
const {
  authenticateToken,
  optionalAuth,
  requireAdminOrOwner
} = require('../middlewares/auth');
const {
  uploadSingle,
  uploadMultiple,
  handleUploadError
} = require('../utils/upload');

// Public routes (with optional auth)
router.get('/', optionalAuth, getAllMedia);
router.get('/popular', getPopularMedia);
router.get('/recent', getRecentMedia);
router.get('/user/:userId', optionalAuth, getUserMedia);

// Protected routes
router.post('/upload', authenticateToken, uploadSingle, handleUploadError, uploadImage);
router.post('/upload-multiple', authenticateToken, uploadMultiple, handleUploadError, uploadMultipleImages);
router.get('/:id', optionalAuth, getMediaById);
router.put('/:id', authenticateToken, updateMedia);
router.delete('/:id', authenticateToken, deleteMedia);
router.post('/:id/like', authenticateToken, toggleLike);
router.get('/:id/download', optionalAuth, downloadImage);
router.post('/download-zip', authenticateToken, downloadMultipleAsZip);

module.exports = router;
