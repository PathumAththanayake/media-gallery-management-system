const express = require('express');
const router = express.Router();
const {
  submitContact,
  getUserMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
  getAllMessages,
  updateMessageStatus,
  getMessageStats,
  bulkDeleteMessages,
  replyToMessage
} = require('../controllers/contactController');
const {
  authenticateToken,
  requireAdmin
} = require('../middlewares/auth');

// Public routes (no authentication required)
router.post('/submit', submitContact);

// User routes (authenticated)
router.get('/my-messages', authenticateToken, getUserMessages);
router.get('/my-messages/:id', authenticateToken, getMessageById);
router.put('/my-messages/:id', authenticateToken, updateMessage);
router.delete('/my-messages/:id', authenticateToken, deleteMessage);

// Admin routes
router.get('/admin/all', authenticateToken, requireAdmin, getAllMessages);
router.get('/admin/stats', authenticateToken, requireAdmin, getMessageStats);
router.put('/admin/:id/status', authenticateToken, requireAdmin, updateMessageStatus);
router.post('/admin/:id/reply', authenticateToken, requireAdmin, replyToMessage);
router.delete('/admin/:id', authenticateToken, requireAdmin, deleteMessage);
router.delete('/admin/bulk-delete', authenticateToken, requireAdmin, bulkDeleteMessages);

module.exports = router; 