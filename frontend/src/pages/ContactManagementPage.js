import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiMessageSquare, FiSearch, FiFilter, FiSend, FiTrash2, FiClock, FiCheck, FiUser, FiMail } from 'react-icons/fi';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ContactManagementPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [pagination.page, filters, searchTerm]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to view messages');
        setLoading(false);
        return;
      }

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        ...filters
      };

      console.log('Fetching admin messages...', params);
      console.log('API URL:', process.env.REACT_APP_API_URL);

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/contact/admin/all`, { 
        params,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Messages response:', response.data);
      
      setMessages(response.data.messages || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination?.totalItems || 0,
        totalPages: response.data.pagination?.totalPages || 0
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else if (error.response?.status === 404) {
        setError('Messages endpoint not found. Please check the API configuration.');
      } else {
        setError(`Failed to load messages: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleSelectMessage = (messageId) => {
    setSelectedMessages(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMessages.length === messages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(messages.map(message => message._id));
    }
  };

  const handleReply = (message) => {
    setReplyingTo(message);
    setReplyText('');
    setShowReplyModal(true);
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    
    if (!replyText.trim()) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/contact/admin/${replyingTo._id}/reply`, {
        reply: replyText
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setShowReplyModal(false);
      setReplyingTo(null);
      setReplyText('');
      fetchMessages();
    } catch (error) {
      setError('Failed to send reply');
    }
  };

  const handleUpdateStatus = async (messageId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.REACT_APP_API_URL}/api/contact/admin/${messageId}/status`, {
        status
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchMessages();
    } catch (error) {
      setError('Failed to update status');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/contact/admin/${messageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchMessages();
    } catch (error) {
      setError('Failed to delete message');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMessages.length === 0) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedMessages.length} messages?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/contact/admin/bulk-delete`, {
        messageIds: selectedMessages
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setSelectedMessages([]);
      fetchMessages();
    } catch (error) {
      setError('Failed to delete messages');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      unread: { color: 'bg-yellow-100 text-yellow-800', icon: FiClock },
      read: { color: 'bg-blue-100 text-blue-800', icon: FiMessageSquare },
      replied: { color: 'bg-green-100 text-green-800', icon: FiCheck },
      resolved: { color: 'bg-gray-100 text-gray-800', icon: FiCheck }
    };

    const config = statusConfig[status] || statusConfig.unread;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <LoadingSpinner text="Loading messages..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Management</h1>
          <p className="text-gray-600">
            Manage and respond to user contact messages
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search messages by subject, content, or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </form>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Messages Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Messages ({pagination.total})
              </h2>
              
              {/* Bulk Actions */}
              {selectedMessages.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedMessages.length} selected
                  </span>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete Selected
                  </button>
                </div>
              )}
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="text-center py-12">
              <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
              <p className="text-gray-600">
                {searchTerm || Object.values(filters).some(f => f) 
                  ? 'Try adjusting your search or filters'
                  : 'No contact messages have been submitted yet'
                }
              </p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedMessages.length === messages.length && messages.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {messages.map((message) => (
                      <tr key={message._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedMessages.includes(message._id)}
                            onChange={() => handleSelectMessage(message._id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                              <FiUser className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {message.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {message.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 font-medium">
                            {message.subject}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {message.message}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(message.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(message.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleReply(message)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Reply"
                            >
                              <FiSend className="w-4 h-4" />
                            </button>
                            <select
                              value={message.status}
                              onChange={(e) => handleUpdateStatus(message._id, e.target.value)}
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="unread">Unread</option>
                              <option value="read">Read</option>
                              <option value="replied">Replied</option>
                              <option value="resolved">Resolved</option>
                            </select>
                            <button
                              onClick={() => handleDeleteMessage(message._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                      {pagination.total} results
                    </div>
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 border rounded-md ${
                            page === pagination.page
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && replyingTo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Reply to Message</h2>
            </div>
            
            <div className="p-6">
              {/* Original Message */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <FiUser className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-900">{replyingTo.name}</span>
                    <span className="text-gray-500">({replyingTo.email})</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(replyingTo.createdAt)}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">Subject:</span>
                  <span className="text-sm text-gray-900 ml-2">{replyingTo.subject}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Message:</span>
                  <p className="text-sm text-gray-900 mt-1">{replyingTo.message}</p>
                </div>
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Reply
                  </label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Type your reply here..."
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Send Reply
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReplyModal(false);
                      setReplyingTo(null);
                      setReplyText('');
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactManagementPage; 