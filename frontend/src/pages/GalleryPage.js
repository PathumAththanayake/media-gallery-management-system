import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { FiSearch, FiFilter, FiDownload, FiHeart, FiEye, FiGrid, FiList } from 'react-icons/fi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MediaCard from '../components/media/MediaCard';
import FilterModal from '../components/media/FilterModal';

const GalleryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    tags: [],
    uploadedBy: '',
    sortBy: 'newest',
    isPublic: true
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showFilters, setShowFilters] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchMedia();
  }, [pagination.page, filters, searchTerm]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        ...filters
      };

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/media`, { params });
      
      setMedia(response.data.media);
      setPagination(prev => ({
        ...prev,
        total: response.data.total,
        totalPages: Math.ceil(response.data.total / pagination.limit)
      }));
    } catch (error) {
      setError('Failed to load media');
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleSelectItem = (mediaId) => {
    console.log('Selecting item:', mediaId);
    setSelectedItems(prev => {
      const newSelection = prev.includes(mediaId) 
        ? prev.filter(id => id !== mediaId)
        : [...prev, mediaId];
      console.log('New selection:', newSelection);
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    console.log('Select all clicked');
    console.log('Current selected items:', selectedItems);
    console.log('Total media items:', media.length);
    
    if (selectedItems.length === media.length) {
      console.log('Deselecting all items');
      setSelectedItems([]);
    } else {
      console.log('Selecting all items');
      const allIds = media.map(item => item._id);
      console.log('All media IDs:', allIds);
      setSelectedItems(allIds);
    }
  };

  const handleDownloadSelected = async (mediaIds = selectedItems) => {
    console.log('handleDownloadSelected called with mediaIds:', mediaIds);
    if (mediaIds.length === 0) return;

    // Check if user is authenticated
    if (!user) {
      setError('Please log in to download files');
      return;
    }

    // Check if token is present
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      return;
    }

    try {
      setDownloading(true);
      console.log('Making download request with:', { 
        mediaIds, 
        token: token ? 'present' : 'missing',
        apiUrl: process.env.REACT_APP_API_URL 
      });
      
      // Always use ZIP endpoint for all downloads
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/media/download-zip`,
        { mediaIds },
        { 
          responseType: 'blob',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Response received:', response.status, response.headers);
      
      // Check if response is actually a blob
      console.log('Response type:', typeof response.data);
      console.log('Response data:', response.data);
      console.log('Is Blob:', response.data instanceof Blob);
      
      if (response.data instanceof Blob) {
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        
        // Always use ZIP filename
        link.setAttribute('download', 'media-gallery.zip');
        
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        console.log('Download completed successfully');
      } else {
        console.error('Invalid response format:', response.data);
        setError('Invalid response format');
      }

      // Clear selected items if we're downloading the selected items (not individual items)
      // Check if the mediaIds array contains the same items as selectedItems
      const isDownloadingSelectedItems = mediaIds.length === selectedItems.length && 
        mediaIds.every(id => selectedItems.includes(id));
      
      if (isDownloadingSelectedItems) {
        setSelectedItems([]);
      }
    } catch (error) {
      console.error('Download error:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = 'Failed to download files';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied to some files.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Files not found.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setDownloading(false);
    }
  };

  const handleLike = async (mediaId) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/media/${mediaId}/like`);
      fetchMedia(); // Refresh to get updated like count
    } catch (error) {
      console.error('Error liking media:', error);
    }
  };

  const handleEdit = (media) => {
    navigate(`/edit-media/${media._id}`);
  };

  const handleDelete = async (mediaId) => {
    if (window.confirm('Are you sure you want to delete this media?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/media/${mediaId}`);
        fetchMedia(); // Refresh the list
      } catch (error) {
        console.error('Error deleting media:', error);
        setError('Failed to delete media');
      }
    }
  };

  if (loading && media.length === 0) {
    return <LoadingSpinner text="Loading gallery..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Media Gallery</h1>
          <p className="text-gray-600">
            Discover and explore our collection of images
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
                  placeholder="Search images by title, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </form>
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              <FiFilter className="w-4 h-4 mr-2" />
              Filters
            </button>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <FiGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <FiList className="w-4 h-4" />
              </button>
            </div>

            {/* Bulk Actions */}
            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedItems.length} selected
                </span>
                <button
                  onClick={() => {
                    console.log('Bulk download button clicked');
                    console.log('Selected items:', selectedItems);
                    handleDownloadSelected();
                  }}
                  disabled={downloading}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
                >
                  <FiDownload className="w-4 h-4 mr-2" />
                  {downloading ? 'Downloading...' : `Download ${selectedItems.length} items`}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Media Grid/List */}
        {media.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FiEye className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || Object.values(filters).some(f => f) 
                ? 'Try adjusting your search or filters'
                : 'No images have been uploaded yet'
              }
            </p>
            {user && (
              <Link
                to="/upload"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Upload Images
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Select All */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedItems.length === media.length && media.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">
                  Select all ({media.length})
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {pagination.total} total images
              </div>
            </div>

            {/* Media Display */}
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
            }>
              {media.map((item) => (
                <MediaCard
                  key={item._id}
                  media={item}
                  viewMode={viewMode}
                  isSelected={selectedItems.includes(item._id)}
                  onSelect={() => handleSelectItem(item._id)}
                  onLike={() => handleLike(item._id)}
                  onDownload={(mediaId) => handleDownloadSelected([mediaId])}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  showActions={true}
                  showUser={true}
                  user={user}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
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
            )}
          </>
        )}
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApply={handleFilterChange}
      />
    </div>
  );
};

export default GalleryPage; 