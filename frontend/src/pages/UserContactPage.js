import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { FiMessageSquare, FiSearch, FiFilter, FiSend, FiTrash2, FiClock, FiCheck, FiUser, FiMail, FiCornerUpLeft } from 'react-icons/fi';
import LoadingSpinner from '../components/common/LoadingSpinner';

const UserContactPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchMessages();
  }, [pagination.page, filters, searchTerm]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to view your messages');
        return;
      }

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        ...filters
      };

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/contact/my-messages`, { 
        params,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setMessages(response.data.messages);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.totalItems,
        totalPages: response.data.pagination.totalPages
      }));
    } catch (error) {
      setError('Failed to load messages');
      console.error('Error fetching messages:', error);
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

  const handleViewMessage = async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/contact/my-messages/${messageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setSelectedMessage(response.data.message);
      setShowMessageModal(true);
    } catch (error) {
      setError('Failed to load message details');
      console.error('Error fetching message:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/contact/my-messages/${messageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchMessages();
    } catch (error) {
      setError('Failed to delete message');
      console.error('Error deleting message:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      unread: { color: 'bg-yellow-100 text-yellow-800', icon: FiClock },
      read: { color: 'bg-blue-100 text-blue-800', icon: FiMessageSquare },
      replied: { color: 'bg-green-100 text-green-800', icon: FiCheck }
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
    return <LoadingSpinner text="Loading your messages..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isAdmin ? 'All Contact Messages' : 'My Contact Messages'}
          </h1>
          <p className="text-gray-600">
            {isAdmin 
              ? 'View and manage all contact messages from users'
              : 'View your contact messages and admin replies'
            }
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
                  placeholder={isAdmin ? "Search all messages..." : "Search your messages..."}
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

        {/* Messages List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Messages ({pagination.total})
            </h2>
          </div>

          {messages.length === 0 ? (
            <div className="text-center py-12">
              <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
              <p className="text-gray-600">
                {searchTerm || Object.values(filters).some(f => f) 
                  ? 'Try adjusting your search or filters'
                  : isAdmin 
                    ? 'No contact messages have been submitted yet'
                    : 'You haven\'t sent any contact messages yet'
                }
              </p>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="divide-y divide-gray-200">
                {messages.map((message) => (
                  <div key={message._id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FiUser className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {message.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {message.email}
                            </div>
                          </div>
                          <div className="ml-auto">
                            {getStatusBadge(message.status)}
                          </div>
                        </div>
                        
                        <div className="ml-13">
                          <div className="text-sm text-gray-900 mb-2">
                            {message.message}
                          </div>
                          
                                                     {/* Show reply if exists */}
                           {message.reply && message.reply.message && (
                             <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                               <div className="flex items-center space-x-2 mb-2">
                                 <FiCornerUpLeft className="w-4 h-4 text-green-600" />
                                 <span className="text-sm font-medium text-green-800">Admin Reply</span>
                                 <span className="text-xs text-green-600">
                                   {formatDate(message.reply.repliedAt)}
                                 </span>
                               </div>
                               <div className="text-sm text-green-900">
                                 {message.reply.message}
                               </div>
                             </div>
                           )}
                          
                          <div className="flex items-center space-x-4 mt-3">
                            <span className="text-xs text-gray-500">
                              Sent: {formatDate(message.createdAt)}
                            </span>
                            <button
                              onClick={() => handleViewMessage(message._id)}
                              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(message._id)}
                              className="text-red-600 hover:text-red-900 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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

      {/* Message Detail Modal */}
      {showMessageModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Message Details</h2>
            </div>
            
            <div className="p-6">
              {/* Original Message */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <FiUser className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-900">{selectedMessage.name}</span>
                    <span className="text-gray-500">({selectedMessage.email})</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(selectedMessage.createdAt)}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className="ml-2">{getStatusBadge(selectedMessage.status)}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Message:</span>
                  <p className="text-sm text-gray-900 mt-1">{selectedMessage.message}</p>
                </div>
              </div>

                             {/* Admin Reply */}
               {selectedMessage.reply && selectedMessage.reply.message && (
                 <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                   <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center space-x-2">
                       <FiCornerUpLeft className="w-4 h-4 text-green-600" />
                       <span className="font-medium text-green-800">Admin Reply</span>
                       {selectedMessage.reply.repliedBy && (
                         <span className="text-sm text-green-600">
                           by {selectedMessage.reply.repliedBy.name}
                         </span>
                       )}
                     </div>
                     <span className="text-sm text-green-600">
                       {formatDate(selectedMessage.reply.repliedAt)}
                     </span>
                   </div>
                   <p className="text-sm text-green-900">{selectedMessage.reply.message}</p>
                 </div>
               )}

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowMessageModal(false);
                    setSelectedMessage(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserContactPage; 