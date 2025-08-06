import React, { createContext, useContext, useState, useCallback } from 'react';
import Notification from '../components/common/Notification';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      ...notification,
      onClose: () => removeNotification(id)
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove if duration is set
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const showSuccess = useCallback((message, options = {}) => {
    addNotification({
      message,
      type: 'success',
      ...options
    });
  }, [addNotification]);

  const showError = useCallback((message, options = {}) => {
    addNotification({
      message,
      type: 'error',
      ...options
    });
  }, [addNotification]);

  const showWarning = useCallback((message, options = {}) => {
    addNotification({
      message,
      type: 'warning',
      ...options
    });
  }, [addNotification]);

  const showInfo = useCallback((message, options = {}) => {
    addNotification({
      message,
      type: 'info',
      ...options
    });
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="notification-container">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            {...notification}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}; 