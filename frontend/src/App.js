import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GalleryPage from './pages/GalleryPage';
import UploadPage from './pages/UploadPage';
import MediaDetailPage from './pages/MediaDetailPage';
import EditMediaPage from './pages/EditMediaPage';
import ContactPage from './pages/ContactPage';
import PublicContactPage from './pages/PublicContactPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import UserManagementPage from './pages/UserManagementPage';
import ContactManagementPage from './pages/ContactManagementPage';
import UserContactPage from './pages/UserContactPage';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import LoadingSpinner from './components/common/LoadingSpinner';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Public Route Component (redirects to home if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/media/:id" element={<MediaDetailPage />} />
            <Route path="/contact" element={<PublicContactPage />} />
            <Route 
              path="/media/:id/edit" 
              element={
                <ProtectedRoute>
                  <EditMediaPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Auth Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/upload" 
              element={
                <ProtectedRoute>
                  <UploadPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/contact/manage" 
              element={
                <ProtectedRoute>
                  <ContactPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-messages" 
              element={
                <ProtectedRoute>
                  <UserContactPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute requireAdmin>
                  <UserManagementPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/contacts" 
              element={
                <ProtectedRoute requireAdmin>
                  <ContactManagementPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Error Routes */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
