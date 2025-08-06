import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up axios defaults
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`);
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        email,
        password
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, userData);
      
      // If registration includes token and user data, log them in immediately
      if (response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        setUser(response.data.user);
      }
      
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      setError(null);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/verify-otp`, {
        email,
        otp
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'OTP verification failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const resendOTP = async (email) => {
    try {
      setError(null);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/resend-otp`, {
        email
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend OTP';
      setError(message);
      return { success: false, error: message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      setError(null);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/forgot-password`, {
        email
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset request failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      setError(null);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/reset-password`, {
        email,
        otp,
        newPassword
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const googleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/google`;
  };

  const logout = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/auth/profile`, profileData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setUser(response.data.user);
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const setUserData = (userData) => {
    setUser(userData);
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/auth/change-password`, {
        currentPassword,
        newPassword
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    verifyOTP,
    resendOTP,
    forgotPassword,
    resetPassword,
    googleLogin,
    logout,
    updateProfile,
    setUser: setUserData,
    changePassword,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 