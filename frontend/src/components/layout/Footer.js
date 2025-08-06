import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiGithub, FiMail, FiUpload, FiGrid, FiUsers, FiShield } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="ml-2 text-xl font-bold">MediaGallery</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              A comprehensive Media Gallery Management System built with the MERN stack. 
              Upload, organize, and manage your images with advanced features including 
              drag & drop uploads, fullscreen viewing, ZIP downloads, and admin tools.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors p-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                title="GitHub"
              >
                <FiGithub className="w-5 h-5" />
              </a>
              <a 
                href="mailto:contact@mediagallery.com" 
                className="text-gray-400 hover:text-white transition-colors p-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                title="Contact Us"
              >
                <FiMail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FiGrid className="w-5 h-5 mr-2" />
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  Media Gallery
                </Link>
              </li>
              <li>
                <Link to="/upload" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <FiUpload className="w-4 h-4 mr-2" />
                  Upload Images
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FiShield className="w-5 h-5 mr-2" />
              Features
            </h3>
            <ul className="space-y-3">
              <li className="text-gray-400 flex items-center">
                <FiUpload className="w-4 h-4 mr-2 text-blue-400" />
                Drag & Drop Upload
              </li>
              <li className="text-gray-400 flex items-center">
                <FiGrid className="w-4 h-4 mr-2 text-green-400" />
                Gallery Management
              </li>
              <li className="text-gray-400 flex items-center">
                <FiUsers className="w-4 h-4 mr-2 text-purple-400" />
                User Management
              </li>
              <li className="text-gray-400 flex items-center">
                <FiShield className="w-4 h-4 mr-2 text-yellow-400" />
                Admin Panel
              </li>
              <li className="text-gray-400 flex items-center">
                <span className="w-4 h-4 mr-2 text-orange-400">📦</span>
                ZIP Downloads
              </li>
              <li className="text-gray-400 flex items-center">
                <span className="w-4 h-4 mr-2 text-pink-400">👁️</span>
                Fullscreen Viewer
              </li>
            </ul>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="text-center mb-6">
            <h4 className="text-lg font-semibold mb-4">Built with Modern Technologies</h4>
            <div className="flex justify-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">R</span>
                </div>
                <span className="text-gray-400 text-sm">React</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">N</span>
                </div>
                <span className="text-gray-400 text-sm">Node.js</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">M</span>
                </div>
                <span className="text-gray-400 text-sm">MongoDB</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">E</span>
                </div>
                <span className="text-gray-400 text-sm">Express</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 MediaGallery Management System. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm flex items-center mt-2 md:mt-0">
            Made with <FiHeart className="w-4 h-4 mx-1 text-red-500" /> using React & Node.js
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 