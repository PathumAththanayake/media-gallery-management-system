const User = require('../models/User');
const Media = require('../models/Media');
const Contact = require('../models/Contact');

// Admin: Get all users
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, isActive } = req.query;
    const skip = (page - 1) * limit;

    const query = {};

    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Add role filter
    if (role) {
      query.role = role;
    }

    // Add active status filter
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const users = await User.find(query)
      .select('-password -otp -otpExpiry')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// Admin: Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select('-password -otp -otpExpiry');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user statistics
    const mediaCount = await Media.countDocuments({ uploadedBy: id, isActive: true });
    const contactCount = await Contact.countDocuments({ submittedBy: id, isActive: true });

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        stats: {
          mediaCount,
          contactCount
        }
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
};

// Admin: Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive, isEmailVerified } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deactivating themselves
    if (id === req.user.userId && isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    // Update fields
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (isEmailVerified !== undefined) user.isEmailVerified = isEmailVerified;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};

// Admin: Deactivate user (soft delete)
const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deactivating themselves
    if (id === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate user'
    });
  }
};

// Admin: Reactivate user
const reactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User reactivated successfully'
    });
  } catch (error) {
    console.error('Reactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reactivate user'
    });
  }
};

// Admin: Delete user (hard delete - use with caution)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (id === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Delete user's media (soft delete)
    await Media.updateMany(
      { uploadedBy: id },
      { isActive: false }
    );

    // Delete user's contact messages (soft delete)
    await Contact.updateMany(
      { submittedBy: id },
      { isActive: false }
    );

    // Delete user
    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'User and associated data deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

// Admin: Get user statistics
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });

    // Get users by registration method
    const googleUsers = await User.countDocuments({ googleId: { $exists: true, $ne: null } });
    const emailUsers = totalUsers - googleUsers;

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        verifiedUsers,
        unverifiedUsers: totalUsers - verifiedUsers,
        adminUsers,
        regularUsers: totalUsers - adminUsers,
        googleUsers,
        emailUsers,
        recentRegistrations
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    });
  }
};

// Admin: Bulk deactivate users
const bulkDeactivateUsers = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid user IDs'
      });
    }

    // Remove current admin from the list
    const filteredIds = ids.filter(id => id !== req.user.userId);

    const result = await User.updateMany(
      { _id: { $in: filteredIds } },
      { isActive: false }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} users deactivated successfully`
    });
  } catch (error) {
    console.error('Bulk deactivate users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate users'
    });
  }
};

// Admin: Bulk reactivate users
const bulkReactivateUsers = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid user IDs'
      });
    }

    const result = await User.updateMany(
      { _id: { $in: ids } },
      { isActive: true }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} users reactivated successfully`
    });
  } catch (error) {
    console.error('Bulk reactivate users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reactivate users'
    });
  }
};

// Admin: Get user's media
const getUserMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    const media = await Media.find({ uploadedBy: id, isActive: true })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Media.countDocuments({ uploadedBy: id, isActive: true });

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

// Admin: Get user's contact messages
const getUserContacts = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const messages = await Contact.find({ submittedBy: id, isActive: true })
      .populate('repliedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments({ submittedBy: id, isActive: true });

    res.status(200).json({
      success: true,
      messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get user contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user contact messages'
    });
  }
};

module.exports = {
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
}; 