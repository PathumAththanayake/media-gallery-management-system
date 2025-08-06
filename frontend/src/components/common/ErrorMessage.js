import React from 'react';
import { FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import './ErrorMessage.css';

const ErrorMessage = ({ 
  message, 
  type = 'error', 
  onRetry, 
  onDismiss, 
  showIcon = true,
  className = "" 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <FaExclamationTriangle className="error-icon" />;
      case 'warning':
        return <FaExclamationTriangle className="warning-icon" />;
      case 'info':
        return <FaInfoCircle className="info-icon" />;
      default:
        return null;
    }
  };

  const getMessageClass = () => {
    switch (type) {
      case 'error':
        return 'error-message error';
      case 'warning':
        return 'error-message warning';
      case 'info':
        return 'error-message info';
      default:
        return 'error-message';
    }
  };

  return (
    <div className={`${getMessageClass()} ${className}`}>
      <div className="error-content">
        {showIcon && getIcon()}
        <div className="error-text">
          <h4 className="error-title">
            {type === 'error' && 'Error'}
            {type === 'warning' && 'Warning'}
            {type === 'info' && 'Information'}
          </h4>
          <p className="error-description">{message}</p>
        </div>
        {onDismiss && (
          <button 
            className="dismiss-button" 
            onClick={onDismiss}
            type="button"
            aria-label="Dismiss"
          >
            <FaTimes />
          </button>
        )}
      </div>
      
      {onRetry && (
        <div className="error-actions">
          <button 
            className="retry-button" 
            onClick={onRetry}
            type="button"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default ErrorMessage; 