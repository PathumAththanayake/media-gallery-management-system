import React, { useEffect, useState } from 'react';
import { FaCheck, FaExclamationTriangle, FaInfoCircle, FaTimes, FaBell } from 'react-icons/fa';
import './Notification.css';

const Notification = ({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose, 
  position = 'top-right',
  showIcon = true,
  className = ""
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose && onClose();
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheck className="notification-icon success" />;
      case 'error':
        return <FaExclamationTriangle className="notification-icon error" />;
      case 'warning':
        return <FaExclamationTriangle className="notification-icon warning" />;
      case 'info':
        return <FaInfoCircle className="notification-icon info" />;
      default:
        return <FaBell className="notification-icon" />;
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case 'success':
        return 'notification-success';
      case 'error':
        return 'notification-error';
      case 'warning':
        return 'notification-warning';
      case 'info':
        return 'notification-info';
      default:
        return '';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`notification notification-${position} ${getTypeClass()} ${isExiting ? 'exiting' : ''} ${className}`}>
      <div className="notification-content">
        {showIcon && getIcon()}
        <div className="notification-message">
          {message}
        </div>
        <button 
          className="notification-close" 
          onClick={handleClose}
          type="button"
          aria-label="Close notification"
        >
          <FaTimes />
        </button>
      </div>
      {duration > 0 && (
        <div className="notification-progress">
          <div 
            className="notification-progress-bar"
            style={{ animationDuration: `${duration}ms` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default Notification; 