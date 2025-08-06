import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { FiHeart, FiDownload, FiEdit, FiTrash2, FiEye, FiShare, FiArrowLeft, FiUser, FiCalendar, FiTag } from 'react-icons/fi';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MediaDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullscreen, setShowFullscreen] = useState(false);

  useEffect(() => {
    fetchMediaDetails();
  }, [id]);

  const fetchMediaDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/media/${id}`);
      setMedia(response.data.media);
    } catch (error) {
      setError('Failed to load media details');
      console.error('Error fetching media details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/media/${id}/like`);
      fetchMediaDetails(); // Refresh to get updated like count
    } catch (error) {
      console.error('Error liking media:', error);
    }
  };

  const handleDownload = async () => {
    try {
      // Use the ZIP download endpoint for individual download
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/media/download-zip`,
        { mediaIds: [id] },
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${media.title || 'image'}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/media/${id}`);
      navigate('/gallery');
    } catch (error) {
      console.error('Delete error:', error);
      setError(error.response?.data?.message || 'Failed to delete image');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <LoadingSpinner text="Loading image details..." />;
  }

  if (error || !media) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error || 'Image not found'}</div>
          <button
            onClick={() => navigate('/gallery')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Gallery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/gallery')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Gallery
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{media.title || 'Untitled'}</h1>
          <p className="text-gray-600">
            Uploaded by {media.uploadedBy?.name || 'Unknown'} on {formatDate(media.createdAt)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Image */}
              <div className="relative">
                <img
                  src={media.originalUrl.startsWith('/') 
                    ? `${process.env.REACT_APP_API_URL}${media.originalUrl}`
                    : media.originalUrl}
                  alt={media.title}
                  className="w-full h-auto cursor-pointer"
                  onClick={() => setShowFullscreen(true)}
                  onError={(e) => {
                    console.error('Image failed to load:', media.originalUrl);
                    e.target.style.display = 'none';
                  }}
                />
                
                {/* Image Overlay Actions */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    onClick={() => setShowFullscreen(true)}
                    className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
                    title="View fullscreen"
                  >
                    <FiEye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
                    title="Download"
                  >
                    <FiDownload className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleLike}
                    className={`p-2 rounded-full ${
                      media.likes?.includes(user?._id)
                        ? 'bg-red-500 text-white'
                        : 'bg-black bg-opacity-50 text-white hover:bg-opacity-70'
                    }`}
                    title={media.likes?.includes(user?._id) ? 'Unlike' : 'Like'}
                  >
                    <FiHeart className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Image Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <FiEye className="w-4 h-4" />
                      <span>{media.viewCount || 0} views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiHeart className="w-4 h-4" />
                      <span>{media.likes?.length || 0} likes</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiDownload className="w-4 h-4" />
                      <span>{media.downloadCount || 0} downloads</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    {(user?._id === media.uploadedBy?._id || user?.role === 'admin') && (
                      <>
                        <button
                          onClick={() => navigate(`/media/${id}/edit`)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          <FiEdit className="w-4 h-4 inline mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={handleDelete}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          <FiTrash2 className="w-4 h-4 inline mr-1" />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Description */}
                {media.description && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700">{media.description}</p>
                  </div>
                )}

                {/* Tags */}
                {media.tags && media.tags.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {media.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          <FiTag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Uploader Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Uploader</h3>
              <div className="flex items-center space-x-3">
                {media.uploadedBy?.avatar ? (
                  <img
                    src={media.uploadedBy.avatar}
                    alt={media.uploadedBy.name}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <FiUser className="w-6 h-6 text-gray-600" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{media.uploadedBy?.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-500">{media.uploadedBy?.email}</p>
                </div>
              </div>
            </div>

            {/* Image Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Image Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">File Size</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatFileSize(media.fileSize)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Dimensions</span>
                  <span className="text-sm font-medium text-gray-900">
                    {media.dimensions?.width} × {media.dimensions?.height}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Format</span>
                  <span className="text-sm font-medium text-gray-900">
                    {media.mimeType?.split('/')[1]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Upload Date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(media.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Visibility</span>
                  <span className={`text-sm font-medium ${
                    media.isPublic ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {media.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <FiDownload className="w-4 h-4 mr-2" />
                  Download Image
                </button>
                <button
                  onClick={handleLike}
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-md ${
                    media.likes?.includes(user?._id)
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FiHeart className="w-4 h-4 mr-2" />
                  {media.likes?.includes(user?._id) ? 'Unlike' : 'Like'}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  <FiShare className="w-4 h-4 mr-2" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-7xl max-h-full">
            <button
              onClick={() => setShowFullscreen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
            >
              <FiArrowLeft className="w-6 h-6" />
            </button>
                         <img
               src={media.originalUrl.startsWith('/') 
                 ? `${process.env.REACT_APP_API_URL}${media.originalUrl}`
                 : media.originalUrl}
               alt={media.title}
               className="max-w-full max-h-full object-contain"
             />
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaDetailPage; 