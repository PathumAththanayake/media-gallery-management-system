import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { FiSave, FiX, FiImage, FiTag } from 'react-icons/fi';
import LoadingSpinner from '../components/common/LoadingSpinner';

const EditMediaPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: ''
  });

  useEffect(() => {
    fetchMediaDetails();
  }, [id]);

  const fetchMediaDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/media/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const mediaData = response.data.media;
      
      // Check if user can edit this media
      if (!mediaData.uploadedBy || (mediaData.uploadedBy._id !== user?._id && user?.role !== 'admin')) {
        setError('You do not have permission to edit this media');
        return;
      }

      setMedia(mediaData);
      setFormData({
        title: mediaData.title || '',
        description: mediaData.description || '',
        tags: mediaData.tags ? mediaData.tags.join(', ') : ''
      });
    } catch (error) {
      setError('Failed to load media details');
      console.error('Error fetching media details:', error);
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
    
    try {
      setSaving(true);
      setError(null);

      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        tags: formData.tags.trim() ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : []
      };

      console.log('Sending update data:', updateData);
      console.log('API URL:', `${process.env.REACT_APP_API_URL}/api/media/${id}`);

      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/media/${id}`, updateData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Update response:', response.data);
      
      // Navigate back to media detail page
      navigate(`/media/${id}`);
    } catch (error) {
      console.error('Error updating media:', error);
      console.error('Error response:', error.response);
      setError(error.response?.data?.message || 'Failed to update media');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/media/${id}`);
  };

  if (loading) {
    return <LoadingSpinner text="Loading media details..." />;
  }

  if (error && !media) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/gallery')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Gallery
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Media</h1>
              <p className="text-gray-600">
                Update the details of your media
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              <FiX className="w-5 h-5 mr-2" />
              Cancel
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6">
            {/* Media Preview */}
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src={`${process.env.REACT_APP_API_URL}${media.originalUrl}`}
                    alt={media.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-full h-full items-center justify-center">
                    <FiImage className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{media.title}</h3>
                  <p className="text-sm text-gray-500">
                    {media.dimensions?.width} × {media.dimensions?.height} • {media.fileSize} bytes
                  </p>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter media title"
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter media description"
              />
            </div>

            {/* Tags */}
            <div className="mb-6">
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter tags separated by commas"
                />
                <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Separate tags with commas (e.g., nature, landscape, sunset)
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSave className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMediaPage; 