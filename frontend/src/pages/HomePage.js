import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiUpload, 
  FiImage, 
  FiUsers, 
  FiShield, 
  FiSearch, 
  FiDownload, 
  FiEye, 
  FiMessageSquare, 
  FiSettings, 
  FiGrid,
  FiFolder,
  FiArchive,
  FiUserCheck,
  FiMail,
  FiBarChart3,
  FiZap
} from 'react-icons/fi';
import FeatureCard from '../components/common/FeatureCard';
import StatsCard from '../components/common/StatsCard';
import TechnologyCard from '../components/common/TechnologyCard';

const HomePage = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <FiUpload className="w-8 h-8" />,
      title: 'Upload Images',
      description: 'Drag & drop JPG/PNG images up to 5MB. Batch upload support with progress tracking.',
      color: 'bg-blue-500'
    },
    {
      icon: <FiGrid className="w-8 h-8" />,
      title: 'Manage Gallery',
      description: 'Search, edit, delete, and organize your images with tags and categories.',
      color: 'bg-green-500'
    },
    {
      icon: <FiEye className="w-8 h-8" />,
      title: 'Fullscreen Viewer',
      description: 'View images in high-resolution with zoom, pan, and slideshow features.',
      color: 'bg-purple-500'
    },
    {
      icon: <FiArchive className="w-8 h-8" />,
      title: 'ZIP Download',
      description: 'Select multiple images and download as ZIP files for easy sharing.',
      color: 'bg-orange-500'
    },
    {
      icon: <FiMessageSquare className="w-8 h-8" />,
      title: 'Contact Form',
      description: 'Submit messages and manage communications with admin response system.',
      color: 'bg-pink-500'
    },
    {
      icon: <FiSettings className="w-8 h-8" />,
      title: 'Admin Tools',
      description: 'User management, message handling, and system administration features.',
      color: 'bg-indigo-500'
    }
  ];

  const stats = [
    { label: 'Images Uploaded', value: '2,847', icon: <FiImage /> },
    { label: 'Active Users', value: '1,234', icon: <FiUsers /> },
    { label: 'Total Downloads', value: '5,692', icon: <FiDownload /> },
    { label: 'System Uptime', value: '99.9%', icon: <FiZap /> }
  ];

  const technologies = [
    { letter: 'R', name: 'React', description: 'Frontend Framework', color: 'bg-blue-500' },
    { letter: 'N', name: 'Node.js', description: 'Backend Runtime', color: 'bg-green-500' },
    { letter: 'M', name: 'MongoDB', description: 'Database', color: 'bg-yellow-500' },
    { letter: 'E', name: 'Express', description: 'Web Framework', color: 'bg-purple-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
                <FiImage className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Your Personal Media Gallery
              <br />
              <span className="text-blue-200 text-3xl md:text-4xl mt-2 block">
                Upload, Organize, and Download Your Images Securely
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              A comprehensive media management system built with modern technologies. 
              <br className="hidden md:block" />
              Store, organize, and share your images with advanced features and security.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Link
                    to="/upload"
                    className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <FiUpload className="inline w-5 h-5 mr-2" />
                    Upload Images
                  </Link>
                  <Link
                    to="/gallery"
                    className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200"
                  >
                    <FiGrid className="inline w-5 h-5 mr-2" />
                    View Gallery
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <FiUserCheck className="inline w-5 h-5 mr-2" />
                    Get Started Free
                  </Link>
                  <Link
                    to="/login"
                    className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200"
                  >
                    <FiShield className="inline w-5 h-5 mr-2" />
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <StatsCard
                key={index}
                icon={stat.icon}
                value={stat.value}
                label={stat.label}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Media Management
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage your digital media collection effectively and securely
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                color={feature.color}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple steps to get started with your media gallery
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Create Account</h3>
              <p className="text-gray-600">Sign up for free and verify your email to get started</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Upload Images</h3>
              <p className="text-gray-600">Drag and drop your images or use the upload interface</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Manage & Share</h3>
              <p className="text-gray-600">Organize, search, and download your media collection</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Organize Your Media?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of users who trust our platform for their image management needs.
          </p>
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <FiUserCheck className="inline w-5 h-5 mr-2" />
                Create Free Account
              </Link>
              <Link
                to="/gallery"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200"
              >
                <FiGrid className="inline w-5 h-5 mr-2" />
                Browse Gallery
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/upload"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <FiUpload className="inline w-5 h-5 mr-2" />
                Upload Images
              </Link>
              <Link
                to="/gallery"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200"
              >
                <FiGrid className="inline w-5 h-5 mr-2" />
                View Gallery
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built with Modern Technologies
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Our platform is built using the latest web technologies for performance and security
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {technologies.map((tech, index) => (
              <TechnologyCard
                key={index}
                letter={tech.letter}
                name={tech.name}
                description={tech.description}
                color={tech.color}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 