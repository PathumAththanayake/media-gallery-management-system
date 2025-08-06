import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiUsers, FiImage, FiMessageSquare, FiTrendingUp, FiEye, FiDownload, FiHeart } from 'react-icons/fi';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to access admin dashboard');
        setLoading(false);
        return;
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      console.log('Fetching admin dashboard data...');
      console.log('API URL:', process.env.REACT_APP_API_URL);

      const [statsResponse, activityResponse] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/stats`, config),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/recent-activity`, config)
      ]);

      console.log('Stats response:', statsResponse.data);
      console.log('Activity response:', activityResponse.data);

      setStats(statsResponse.data.stats);
      setRecentActivity(activityResponse.data.activities || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else if (error.response?.status === 404) {
        setError('Admin dashboard not found. Please check the API configuration.');
      } else {
        setError(`Failed to load dashboard data: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 mb-4 text-lg font-medium">{error}</div>
          <div className="space-y-3">
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
            <div className="text-sm text-gray-600">
              <p>If the problem persists, please:</p>
              <ul className="list-disc list-inside mt-2">
                <li>Check if you're logged in as an admin user</li>
                <li>Verify the backend server is running</li>
                <li>Check the browser console for more details</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Overview of your media gallery platform
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <FiUsers className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600">
                +{stats?.newUsersThisMonth || 0} this month
              </span>
            </div>
          </div>

          {/* Total Images */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  <FiImage className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Images</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalImages || 0}</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600">
                +{stats?.newImagesThisMonth || 0} this month
              </span>
            </div>
          </div>

          {/* Total Messages */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                  <FiMessageSquare className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalMessages || 0}</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-yellow-600">
                {stats?.pendingMessages || 0} pending
              </span>
            </div>
          </div>

          {/* Platform Growth */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                  <FiTrendingUp className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.growthRate ? `${stats.growthRate}%` : '0%'}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-purple-600">
                vs last month
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            to="/admin/users"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiUsers className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                <p className="text-sm text-gray-600">Manage users and permissions</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/contacts"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FiMessageSquare className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Contact Messages</h3>
                <p className="text-sm text-gray-600">View and respond to messages</p>
              </div>
            </div>
          </Link>

          <Link
            to="/gallery"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FiImage className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Media Gallery</h3>
                <p className="text-sm text-gray-600">Browse and manage images</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        {activity.type === 'user' && <FiUsers className="w-4 h-4 text-gray-600" />}
                        {activity.type === 'image' && <FiImage className="w-4 h-4 text-gray-600" />}
                        {activity.type === 'message' && <FiMessageSquare className="w-4 h-4 text-gray-600" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Platform Metrics */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Statistics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Image Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Views</span>
                <div className="flex items-center">
                  <FiEye className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="font-medium">{stats?.totalViews || 0}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Downloads</span>
                <div className="flex items-center">
                  <FiDownload className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="font-medium">{stats?.totalDownloads || 0}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Likes</span>
                <div className="flex items-center">
                  <FiHeart className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="font-medium">{stats?.totalLikes || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* User Statistics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="font-medium">{stats?.activeUsers || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Verified Users</span>
                <span className="font-medium">{stats?.verifiedUsers || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Admin Users</span>
                <span className="font-medium">{stats?.adminUsers || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 