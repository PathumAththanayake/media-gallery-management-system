const Contact = require('../models/Contact');

// Submit contact form (public - no authentication required)
const submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const userId = req.user?.userId; // Optional - user might not be logged in

    const contact = new Contact({
      name,
      email,
      message,
      userId // Will be undefined for anonymous submissions
    });

    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      contact
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

// Get user's own messages (for authenticated users)
const getUserMessages = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    // If user is admin, show all messages. Otherwise, show only their own messages
    let baseQuery = { isActive: true };
    
    if (req.user.role !== 'admin') {
      baseQuery = { 
        $or: [
          { userId: userId },
          { email: req.user.email }
        ],
        isActive: true 
      };
    }

    // Add search functionality
    if (search) {
      const searchQuery = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { message: { $regex: search, $options: 'i' } }
        ]
      };

      if (req.user.role === 'admin') {
        // For admin, combine baseQuery with search
        baseQuery = { ...baseQuery, ...searchQuery };
      } else {
        // For regular users, use $and to combine baseQuery with search
        baseQuery.$and = [
          baseQuery,
          searchQuery
        ];
      }
    }

    const messages = await Contact.find(baseQuery)
      .populate('reply.repliedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments(baseQuery);

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
    console.error('Get user messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

// Get all messages (admin only)
const getAllMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (page - 1) * limit;

    const query = { isActive: true };
    if (status) {
      query.status = status;
    }
    
    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const messages = await Contact.find(query)
      .populate('reply.repliedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments(query);

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
    console.error('Get all messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

// Get message by ID
const getMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const message = await Contact.findById(id).populate('reply.repliedBy', 'name email');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user can access this message
    if (req.user.role !== 'admin' && message.email !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Get message by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message'
    });
  }
};

// Update message status (admin only)
const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const message = await Contact.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    message.status = status;
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message status updated successfully',
      contact: message
    });
  } catch (error) {
    console.error('Update message status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message status'
    });
  }
};

// Update message (user can update their own messages)
const updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message: newMessage } = req.body;
    const userId = req.user.userId;

    const contactMessage = await Contact.findById(id);

    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user can update this message
    if (contactMessage.email !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    contactMessage.message = newMessage;
    await contactMessage.save();

    res.status(200).json({
      success: true,
      message: 'Message updated successfully',
      contact: contactMessage
    });
  } catch (error) {
    console.error('Update message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message'
    });
  }
};

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const message = await Contact.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user can delete this message
    if (req.user.role !== 'admin' && message.email !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    message.isActive = false;
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
};

// Reply to message (admin only)
const replyToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    const adminId = req.user.userId;

    const message = await Contact.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Update the message with reply
    message.reply = {
      message: reply,
      repliedBy: adminId,
      repliedAt: new Date()
    };
    message.status = 'replied';
    await message.save();

    // TODO: Send email notification to user about the reply
    // This would require email service setup

    res.status(200).json({
      success: true,
      message: 'Reply sent successfully',
      contact: message
    });
  } catch (error) {
    console.error('Reply to message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reply'
    });
  }
};

// Bulk delete messages (admin only)
const bulkDeleteMessages = async (req, res) => {
  try {
    const { messageIds } = req.body;

    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({
        success: false,
        message: 'Message IDs array is required'
      });
    }

    await Contact.updateMany(
      { _id: { $in: messageIds } },
      { isActive: false }
    );

    res.status(200).json({
      success: true,
      message: 'Messages deleted successfully'
    });
  } catch (error) {
    console.error('Bulk delete messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete messages'
    });
  }
};

// Get message statistics (admin only)
const getMessageStats = async (req, res) => {
  try {
    const stats = await Contact.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Contact.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      stats: {
        total,
        byStatus: stats
      }
    });
  } catch (error) {
    console.error('Get message stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message statistics'
    });
  }
};

module.exports = {
  submitContact,
  getUserMessages,
  getAllMessages,
  getMessageById,
  updateMessage,
  updateMessageStatus,
  deleteMessage,
  getMessageStats,
  replyToMessage,
  bulkDeleteMessages
}; 