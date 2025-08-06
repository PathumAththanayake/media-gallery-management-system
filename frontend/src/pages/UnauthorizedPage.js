import React from 'react';
import { Link } from 'react-router-dom';
import { FiLock, FiHome, FiLogIn, FiUserPlus } from 'react-icons/fi';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* Unauthorized Icon */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center">
            <FiLock className="w-12 h-12 text-yellow-600" />
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">401</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">
            You don't have permission to access this page. Please sign in with an account that has the required permissions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            to="/login"
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <FiLogIn className="w-4 h-4 mr-2" />
            Sign In
          </Link>
          
          <Link
            to="/register"
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            <FiUserPlus className="w-4 h-4 mr-2" />
            Create Account
          </Link>
        </div>

        {/* Additional Links */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4">Or you can:</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center"
            >
              <FiHome className="w-4 h-4 mr-1" />
              Go to Homepage
            </Link>
            <Link
              to="/gallery"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Browse Public Gallery
            </Link>
            <Link
              to="/contact"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Contact Support
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Need help?</strong> If you believe you should have access to this page, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage; 