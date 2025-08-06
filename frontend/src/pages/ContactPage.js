import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { FiSend, FiMessageSquare, FiClock, FiCheck, FiX } from 'react-icons/fi';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ContactPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/contact/my-messages`);
      setMessages(response.data.messages);
    } catch (error) {
      setError('Failed to load messages');
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/contact/submit`, {
        subject: formData.subject,
        message: formData.message
      });

      setSuccess('Message sent successfully!');
      setFormData({ subject: '', message: '' });
      setShowForm(false);
      fetchMessages(); // Refresh messages
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/contact/my-messages/${messageId}`);
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      setSuccess('Message deleted successfully');
    } catch (error) {
      setError('Failed to delete message');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: FiClock },
      read: { color: 'bg-blue-100 text-blue-800', icon: FiMessageSquare },
      replied: { color: 'bg-green-100 text-green-800', icon: FiCheck },
      resolved: { color: 'bg-gray-100 text-gray-800', icon: FiCheck }
    };

    const config = statusConfig[status] || statusConfig.pending;
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Support</h1>
          <p className="text-gray-600">
            Get in touch with our support team or view your message history
          </p>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Send Message</h2>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {showForm ? 'Cancel' : 'New Message'}
                </button>
              </div>

              {showForm ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter subject"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe your issue or question..."
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      <FiSend className="w-4 h-4 mr-2" />
                      {submitting ? 'Sending...' : 'Send Message'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8">
                  <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">
                    Need help? Send us a message and we'll get back to you as soon as possible.
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <FiSend className="w-4 h-4 mr-2" />
                    Send Message
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Message History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Message History</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {messages.length} message{messages.length !== 1 ? 's' : ''}
                </p>
              </div>

              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                  <p className="text-gray-600">
                    You haven't sent any messages yet. Start a conversation with our support team.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {messages.map((message) => (
                    <div key={message._id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {message.subject}
                            </h3>
                            {getStatusBadge(message.status)}
                          </div>
                          
                          <p className="text-gray-600 mb-3">
                            {message.message}
                          </p>

                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Sent: {formatDate(message.createdAt)}</span>
                            {message.repliedAt && (
                              <span>Replied: {formatDate(message.repliedAt)}</span>
                            )}
                          </div>

                          {message.adminReply && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-md">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-sm font-medium text-blue-900">Admin Reply:</span>
                                <span className="text-sm text-blue-600">
                                  {formatDate(message.repliedAt)}
                                </span>
                              </div>
                              <p className="text-blue-800">{message.adminReply}</p>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleDeleteMessage(message._id)}
                          className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                          title="Delete message"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Other Ways to Contact Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiMessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Email Support</h3>
              <p className="text-sm text-gray-600">support@mediagallery.com</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiClock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Response Time</h3>
              <p className="text-sm text-gray-600">Within 24 hours</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiCheck className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Support Hours</h3>
              <p className="text-sm text-gray-600">24/7 Available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
