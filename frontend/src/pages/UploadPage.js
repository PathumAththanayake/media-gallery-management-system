import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { FiUpload, FiX, FiImage, FiTag, FiEye, FiEyeOff } from 'react-icons/fi';
import LoadingSpinner from '../components/common/LoadingSpinner';

const UploadPage = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    isPublic: true
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      preview: URL.createObjectURL(file),
      status: 'pending' // pending, uploading, success, error
    }));
    setFiles(prev => [...prev, ...newFiles]);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: true
  });

  const removeFile = (fileId) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (files.length === 0) {
      setError('Please select at least one image to upload');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please enter a title for your images');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formDataToSend = new FormData();
      
      // Add files
      files.forEach((fileObj, index) => {
        formDataToSend.append('images', fileObj.file);
      });

      // Add metadata
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('tags', formData.tags);
      formDataToSend.append('isPublic', formData.isPublic);

      // Update file status to uploading
      setFiles(prev => prev.map(f => ({ ...f, status: 'uploading' })));

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/media/upload-multiple`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        }
      );

      setSuccess(`Successfully uploaded ${response.data.media.length} images!`);
      
      // Update file status to success
      setFiles(prev => prev.map(f => ({ ...f, status: 'success' })));

      // Reset form after a delay
      setTimeout(() => {
        setFiles([]);
        setFormData({
          title: '',
          description: '',
          tags: '',
          isPublic: true
        });
        setUploadProgress({});
        navigate('/gallery');
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.message || 'Failed to upload images');
      
      // Update file status to error
      setFiles(prev => prev.map(f => ({ ...f, status: 'error' })));
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (uploading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" text="Uploading images..." />
          {uploadProgress > 0 && (
            <div className="mt-4">
              <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="mt-2 text-sm text-gray-600">{uploadProgress}% complete</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Images</h1>
          <p className="text-gray-600">
            Upload your images with drag & drop support. Maximum file size: 5MB per image.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* File Upload Area */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-lg text-blue-600">Drop the images here...</p>
              ) : (
                <div>
                  <p className="text-lg text-gray-900 mb-2">
                    Drag & drop images here, or click to select
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports JPG and PNG files up to 5MB each
                  </p>
                </div>
              )}
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Selected Files ({files.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {files.map((fileObj) => (
                    <div
                      key={fileObj.id}
                      className="relative bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <img
                        src={fileObj.preview}
                        alt={fileObj.file.name}
                        className="w-full h-32 object-cover rounded-md mb-2"
                      />
                      <div className="text-sm">
                        <p className="font-medium text-gray-900 truncate">
                          {fileObj.file.name}
                        </p>
                        <p className="text-gray-500">
                          {formatFileSize(fileObj.file.size)}
                        </p>
                        {fileObj.status === 'error' && (
                          <p className="text-red-500 text-xs">Upload failed</p>
                        )}
                        {fileObj.status === 'success' && (
                          <p className="text-green-500 text-xs">Uploaded successfully</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(fileObj.id)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Image Details</h3>
            
            <div className="space-y-6">
              {/* Title */}
              <div>
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
                  placeholder="Enter a title for your images"
                />
              </div>

              {/* Description */}
              <div>
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
                  placeholder="Describe your images (optional)"
                />
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  <FiTag className="inline w-4 h-4 mr-1" />
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter tags separated by commas (e.g., nature, landscape, sunset)"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Tags help others discover your images
                </p>
              </div>

              {/* Visibility */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    <FiEye className="inline w-4 h-4 mr-1" />
                    Make images public
                  </span>
                </label>
                <p className="mt-1 text-sm text-gray-500">
                  Public images are visible to everyone. Uncheck to make them private.
                </p>
              </div>
            </div>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              {success}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/gallery')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={files.length === 0 || uploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : `Upload ${files.length} Image${files.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadPage; 