import React, { useState } from 'react';
import { FaHeart, FaShare, FaDownload, FaEye, FaEllipsisV, FaEdit } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './MediaCard.css';

const MediaCard = ({ 
  media, 
  onLike, 
  onShare, 
  onDownload, 
  onDelete,
  onEdit,
  showActions = true,
  showUser = true,
  className = "",
  viewMode = 'grid',
  isSelected = false,
  onSelect,
  user
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onLike && onLike(media._id);
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onShare && onShare(media);
  };

  const handleDownload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Download clicked for media ID:', media._id);
    onDownload && onDownload(media._id);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete && onDelete(media._id);
    setShowMenu(false);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit && onEdit(media);
    setShowMenu(false);
  };

  const getMediaPreview = () => {
    // Default to image since we're only handling images for now
    const mediaType = media.type || 'image';
    const imageUrl = media.originalUrl || media.url;
    
    // Construct full URL for images
    const fullImageUrl = imageUrl && imageUrl.startsWith('/') 
      ? `${process.env.REACT_APP_API_URL}${imageUrl}`
      : imageUrl;
    
    if (mediaType === 'image' || !mediaType) {
      return (
        <img 
          src={fullImageUrl} 
          alt={media.title || 'Media'} 
          className="media-preview"
          loading="lazy"
          onError={(e) => {
            console.error('Image failed to load:', fullImageUrl);
            e.target.style.display = 'none';
          }}
        />
      );
    } else if (mediaType === 'video') {
      return (
        <video 
          src={fullImageUrl} 
          className="media-preview"
          muted
          preload="metadata"
        >
          <source src={fullImageUrl} type={media.mimeType} />
        </video>
      );
    } else if (mediaType === 'audio') {
      return (
        <div className="audio-preview">
          <div className="audio-icon">🎵</div>
          <span className="audio-title">{media.title}</span>
        </div>
      );
    } else {
      return (
        <div className="document-preview">
          <div className="document-icon">📄</div>
          <span className="document-title">{media.title}</span>
        </div>
      );
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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSelect = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Checkbox clicked for media:', media._id, 'Current selected state:', isSelected);
    onSelect && onSelect();
  };

  return (
    <div 
      className={`media-card ${className} ${isSelected ? 'selected' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Selection checkbox - outside the link */}
      {onSelect && (
        <div className="selection-checkbox">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelect}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            style={{ 
              width: '18px', 
              height: '18px',
              cursor: 'pointer',
              pointerEvents: 'auto'
            }}
          />
        </div>
      )}
      
      <Link to={`/media/${media._id}`} className="media-link">
        <div className="media-preview-container">
          {getMediaPreview()}
          
          {/* Overlay with actions */}
          {isHovered && showActions && (
            <div className="media-overlay">
              <div className="media-actions">
                <button 
                  className="action-button"
                  onClick={handleLike}
                  title="Like"
                >
                  <FaHeart className={media.isLiked || (media.likes && media.likes.includes(media.uploadedBy?._id)) ? 'liked' : ''} />
                </button>
                <button 
                  className="action-button"
                  onClick={handleShare}
                  title="Share"
                >
                  <FaShare />
                </button>
                <button 
                  className="action-button"
                  onClick={handleDownload}
                  title="Download"
                >
                  <FaDownload />
                </button>
                <button 
                  className="action-button"
                  title="View"
                >
                  <FaEye />
                </button>
              </div>
            </div>
          )}

          {/* Media type badge */}
          <div className="media-type-badge">
            {media.type ? media.type.toUpperCase() : 'IMAGE'}
          </div>

          {/* Like count */}
          {((media.likes && media.likes.length > 0) || media.likeCount > 0) && (
            <div className="like-count">
              <FaHeart className="liked" />
              <span>{media.likes ? media.likes.length : media.likeCount}</span>
            </div>
          )}
        </div>

        <div className="media-info">
          <h3 className="media-title" title={media.title}>
            {media.title || 'Untitled'}
          </h3>
          
          {media.description && (
            <p className="media-description" title={media.description}>
              {media.description.length > 100 
                ? `${media.description.substring(0, 100)}...` 
                : media.description
              }
            </p>
          )}

          <div className="media-meta">
            {showUser && (media.user || media.uploadedBy) && (
              <div className="media-user">
                <img 
                  src={(media.user || media.uploadedBy)?.avatar || '/default-avatar.png'} 
                  alt={(media.user || media.uploadedBy)?.name || (media.user || media.uploadedBy)?.username}
                  className="user-avatar"
                />
                <span className="username">{(media.user || media.uploadedBy)?.name || (media.user || media.uploadedBy)?.username}</span>
              </div>
            )}
            
            <div className="media-stats">
              <span className="file-size">{formatFileSize(media.fileSize || media.size)}</span>
              <span className="upload-date">{formatDate(media.createdAt)}</span>
            </div>
          </div>

          {/* Tags */}
          {media.tags && media.tags.length > 0 && (
            <div className="media-tags">
              {media.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="tag">
                  #{tag}
                </span>
              ))}
              {media.tags.length > 3 && (
                <span className="tag-more">+{media.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Menu button for additional actions */}
      {showActions && (
        <div className="media-menu">
          <button 
            className="menu-button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            title="More options"
          >
            <FaEllipsisV />
          </button>
          
          {showMenu && (
            <div className="menu-dropdown">
              <button onClick={handleDownload} className="menu-item">
                <FaDownload /> Download
              </button>
              <button onClick={handleShare} className="menu-item">
                <FaShare /> Share
              </button>
              {onEdit && (
                <button onClick={handleEdit} className="menu-item">
                  <FaEdit /> Edit
                </button>
              )}
              {onDelete && (
                <button onClick={handleDelete} className="menu-item delete">
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaCard; 