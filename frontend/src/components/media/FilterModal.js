import React, { useState, useEffect } from 'react';
import { FiX, FiTag, FiUser, FiCalendar, FiEye } from 'react-icons/fi';
import axios from 'axios';

const FilterModal = ({ isOpen, onClose, filters, onApply }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [availableTags, setAvailableTags] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
      fetchFilterOptions();
    }
  }, [isOpen, filters]);

  const fetchFilterOptions = async () => {
    try {
      setLoading(true);
      const [tagsResponse, usersResponse] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/media/tags`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/media/users`)
      ]);
      
      setAvailableTags(tagsResponse.data.tags || []);
      setAvailableUsers(usersResponse.data.users || []);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTagToggle = (tag) => {
    setLocalFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      tags: [],
      uploadedBy: '',
      sortBy: 'newest',
      isPublic: true
    };
    setLocalFilters(resetFilters);
    onApply(resetFilters);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Filter Gallery</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <FiCalendar className="inline w-4 h-4 mr-2" />
              Sort By
            </label>
            <select
              value={localFilters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
              <option value="popular">Most Popular</option>
              <option value="views">Most Views</option>
              <option value="likes">Most Likes</option>
            </select>
          </div>

          {/* Uploaded By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <FiUser className="inline w-4 h-4 mr-2" />
              Uploaded By
            </label>
            <select
              value={localFilters.uploadedBy}
              onChange={(e) => handleFilterChange('uploadedBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Users</option>
              {availableUsers.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <FiEye className="inline w-4 h-4 mr-2" />
              Visibility
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="visibility"
                  value="true"
                  checked={localFilters.isPublic === true}
                  onChange={(e) => handleFilterChange('isPublic', e.target.value === 'true')}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                Public Images
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="visibility"
                  value="false"
                  checked={localFilters.isPublic === false}
                  onChange={(e) => handleFilterChange('isPublic', e.target.value === 'true')}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                Private Images
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="visibility"
                  value="all"
                  checked={localFilters.isPublic === null}
                  onChange={() => handleFilterChange('isPublic', null)}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                All Images
              </label>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <FiTag className="inline w-4 h-4 mr-2" />
              Tags
            </label>
            {loading ? (
              <div className="text-sm text-gray-500">Loading tags...</div>
            ) : (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availableTags.map((tag) => (
                  <label key={tag} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localFilters.tags.includes(tag)}
                      onChange={() => handleTagToggle(tag)}
                      className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{tag}</span>
                  </label>
                ))}
                {availableTags.length === 0 && (
                  <div className="text-sm text-gray-500">No tags available</div>
                )}
              </div>
            )}
          </div>

          {/* Selected Tags Display */}
          {localFilters.tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Tags ({localFilters.tags.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {localFilters.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      onClick={() => handleTagToggle(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Reset
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModal; 