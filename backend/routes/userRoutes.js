const express = require('express');
const router = express.Router();
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
const {
  authenticateToken,
  requireAdmin
} = require('../middlewares/auth');

// All routes require admin access
router.use(authenticateToken, requireAdmin);

// User management routes
router.get('/', getAllUsers);
router.get('/stats', getUserStats);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

// User activation/deactivation
router.patch('/:id/deactivate', deactivateUser);
router.patch('/:id/reactivate', reactivateUser);

// Bulk operations
router.post('/bulk-deactivate', bulkDeactivateUsers);
router.post('/bulk-reactivate', bulkReactivateUsers);

// User data
router.get('/:id/media', getUserMedia);
router.get('/:id/contacts', getUserContacts);

module.exports = router;
