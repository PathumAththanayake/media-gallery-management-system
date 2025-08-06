const express = require('express');
const router = express.Router();
const { getAdminStats, getRecentActivity } = require('../controllers/adminController');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
  reactivateUser,
  deleteUser,
  getUserStats,
  bulkDeactivateUsers,
  bulkReactivateUsers,
  getUserMedia,
  getUserContacts
} = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

// Admin dashboard statistics
router.get('/stats', authenticateToken, requireAdmin, getAdminStats);

// Recent activity
router.get('/recent-activity', authenticateToken, requireAdmin, getRecentActivity);

// User management routes - use proper controller functions
router.get('/users', authenticateToken, requireAdmin, getAllUsers);
router.get('/users/stats', authenticateToken, requireAdmin, getUserStats);
router.get('/users/:id', authenticateToken, requireAdmin, getUserById);
router.put('/users/:id', authenticateToken, requireAdmin, updateUser);
router.delete('/users/:id', authenticateToken, requireAdmin, deleteUser);

// User activation/deactivation
router.patch('/users/:id/deactivate', authenticateToken, requireAdmin, deactivateUser);
router.patch('/users/:id/reactivate', authenticateToken, requireAdmin, reactivateUser);

// Bulk operations
router.post('/users/bulk-deactivate', authenticateToken, requireAdmin, bulkDeactivateUsers);
router.post('/users/bulk-reactivate', authenticateToken, requireAdmin, bulkReactivateUsers);

// User data
router.get('/users/:id/media', authenticateToken, requireAdmin, getUserMedia);
router.get('/users/:id/contacts', authenticateToken, requireAdmin, getUserContacts);

module.exports = router; 