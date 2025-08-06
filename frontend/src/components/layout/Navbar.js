import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiShield, FiGrid, FiUpload, FiMessageSquare } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">MediaGallery</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Home
            </Link>
            {user && (
              <Link 
                to="/dashboard" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
              >
                <FiGrid className="w-4 h-4 mr-1" />
                Dashboard
              </Link>
            )}
            <Link 
              to="/gallery" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Media Gallery
            </Link>
            {user && (
              <Link 
                to="/upload" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
              >
                <FiUpload className="w-4 h-4 mr-1" />
                Upload
              </Link>
            )}
            <Link 
              to="/contact" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
            >
              <FiMessageSquare className="w-4 h-4 mr-1" />
              Contact
            </Link>
            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
              >
                <FiSettings className="w-4 h-4 mr-1" />
                Admin
              </Link>
            )}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <FiUser className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                  <span>{user.name}</span>
                  {user.role === 'admin' && (
                    <FiShield className="w-4 h-4 text-yellow-500" />
                  )}
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiUser className="mr-3 w-4 h-4" />
                      Profile
                    </Link>
                    <Link
                      to="/user/contact"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiMessageSquare className="mr-3 w-4 h-4" />
                      My Messages
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FiSettings className="mr-3 w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiLogOut className="mr-3 w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 p-2 rounded-md"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                Home
              </Link>
              {user && (
                <Link
                  to="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium flex items-center"
                >
                  <FiGrid className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              )}
              <Link
                to="/gallery"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                Media Gallery
              </Link>
              {user && (
                <Link
                  to="/upload"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium flex items-center"
                >
                  <FiUpload className="w-4 h-4 mr-2" />
                  Upload
                </Link>
              )}
              <Link
                to="/contact"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium flex items-center"
              >
                <FiMessageSquare className="w-4 h-4 mr-2" />
                Contact
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium flex items-center"
                >
                  <FiSettings className="w-4 h-4 mr-2" />
                  Admin
                </Link>
              )}
              
              {/* Mobile Auth */}
              {user ? (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center px-3 py-2">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <FiUser className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                    <span className="ml-3 text-gray-700 font-medium">{user.name}</span>
                    {user.role === 'admin' && (
                      <FiShield className="ml-2 w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600"
                  >
                    <FiUser className="mr-3 w-4 h-4" />
                    Profile
                  </Link>
                  <Link
                    to="/user/contact"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600"
                  >
                    <FiMessageSquare className="mr-3 w-4 h-4" />
                    My Messages
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-gray-700 hover:text-blue-600"
                  >
                    <FiLogOut className="mr-3 w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="bg-blue-600 hover:bg-blue-700 text-white block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 