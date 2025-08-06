const User = require('../models/User');
const Media = require('../models/Media');
const Contact = require('../models/Contact');

// Get admin dashboard statistics
const getAdminStats = async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const googleUsers = await User.countDocuments({ googleId: { $exists: true, $ne: null } });
    const emailUsers = totalUsers - googleUsers;

    // Media statistics
    const totalImages = await Media.countDocuments({ isActive: true });
    const publicImages = await Media.countDocuments({ isPublic: true, isActive: true });
    const totalViews = await Media.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$viewCount' } } }
    ]);
    const totalDownloads = await Media.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$downloadCount' } } }
    ]);
    const totalLikes = await Media.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: { $size: '$likes' } } } }
    ]);

    // Contact statistics
    const totalMessages = await Contact.countDocuments({ isActive: true });
    const pendingMessages = await Contact.countDocuments({ status: 'unread', isActive: true });
    const repliedMessages = await Contact.countDocuments({ status: 'replied', isActive: true });
    const resolvedMessages = await Contact.countDocuments({ status: 'resolved', isActive: true });

    // Monthly growth
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    const newImagesThisMonth = await Media.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      isActive: true
    });

    // Calculate growth rate (simplified)
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const previousMonthUsers = await User.countDocuments({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    });
    const growthRate = previousMonthUsers > 0 
      ? Math.round(((newUsersThisMonth - previousMonthUsers) / previousMonthUsers) * 100)
      : 0;

    res.status(200).json({
      success: true,
      stats: {
        // User stats
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        verifiedUsers,
        unverifiedUsers: totalUsers - verifiedUsers,
        adminUsers,
        regularUsers: totalUsers - adminUsers,
        googleUsers,
        emailUsers,
        newUsersThisMonth,
        
        // Media stats
        totalImages,
        publicImages,
        privateImages: totalImages - publicImages,
        totalViews: totalViews[0]?.total || 0,
        totalDownloads: totalDownloads[0]?.total || 0,
        totalLikes: totalLikes[0]?.total || 0,
        newImagesThisMonth,
        
        // Contact stats
        totalMessages,
        pendingMessages,
        repliedMessages,
        resolvedMessages,
        
        // Growth stats
        growthRate
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin statistics'
    });
  }
};

// Get recent activity
const getRecentActivity = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const activities = [];

    // Get recent user registrations
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');

    recentUsers.forEach(user => {
      activities.push({
        type: 'user',
        description: `${user.name} (${user.email}) registered as ${user.role}`,
        timestamp: user.createdAt,
        user: {
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    });

    // Get recent media uploads
    const recentMedia = await Media.find({ isActive: true })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    recentMedia.forEach(media => {
      activities.push({
        type: 'image',
        description: `${media.uploadedBy?.name || 'Unknown user'} uploaded "${media.title}"`,
        timestamp: media.createdAt,
        media: {
          title: media.title,
          uploadedBy: media.uploadedBy?.name
        }
      });
    });

    // Get recent contact messages
    const recentMessages = await Contact.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5);

    recentMessages.forEach(message => {
      activities.push({
        type: 'message',
        description: `New message from ${message.name} (${message.email})`,
        timestamp: message.createdAt,
        message: {
          name: message.name,
          email: message.email,
          status: message.status
        }
      });
    });

    // Sort all activities by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const limitedActivities = activities.slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      activities: limitedActivities
    });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity'
    });
  }
};

module.exports = {
  getAdminStats,
  getRecentActivity
}; 