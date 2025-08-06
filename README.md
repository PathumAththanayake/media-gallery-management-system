# Media Gallery Management System

A full-stack Media Gallery Web Application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring secure authentication, media management, and contact form integration.

## 🚀 Features

### 🔐 Authentication System
- **Google OAuth 2.0** - Login with Google account
- **Email/Password Registration** - Traditional registration with email verification
- **OTP Verification** - Email-based OTP for account verification and password reset
- **JWT Authentication** - Stateless authentication with JSON Web Tokens
- **Role-based Access Control** - Admin and user roles with different permissions
- **Account Security** - Login attempt limiting, account lockout, and soft delete

### 🖼️ Media Gallery Management
- **Drag & Drop Upload** - Support for JPG, PNG, GIF, WebP formats (max 5MB)
- **File Preview & Metadata** - Title, description, tags, and image dimensions
- **Gallery Management** - Personal/shared galleries with search and filtering
- **CRUD Operations** - Add, edit, delete media with metadata
- **Full-screen View** - Image viewer with slider navigation
- **ZIP Download** - Download multiple selected images as ZIP files
- **Like System** - Users can like and interact with media

### 📬 Contact Form System
- **Public Contact Form** - Accessible to all users without authentication
- **Message Management** - Users can view, edit, and delete their own messages
- **Admin Interface** - Admins can view all messages, update status, and reply
- **Message Status** - Track message status (unread, read, replied, resolved)

### 👤 User Management (Admin Only)
- **User Profiles** - View and edit user information (name, email, role)
- **Account Management** - Soft-delete/deactivate users
- **User Statistics** - View user activity and media uploads
- **Bulk Operations** - Bulk deactivate/reactivate users

### 📊 Admin Dashboard
- **Platform Statistics** - User counts, media uploads, message statistics
- **Recent Activity** - Track user registrations, uploads, and messages
- **Growth Metrics** - Monitor platform growth and engagement
- **Quick Actions** - Direct access to user and media management

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **Tailwind CSS** - Styling and responsive design
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Dropzone** - Drag & drop file uploads
- **JSZip** - ZIP file generation
- **React Icons** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Passport.js** - Google OAuth authentication
- **Multer** - File upload handling
- **Archiver** - ZIP file creation
- **Nodemailer** - Email sending (OTP)
- **Sharp** - Image processing
- **bcryptjs** - Password hashing

### Storage
- **Local File System** - Image storage (configurable for Cloudinary)

## 📁 Project Structure

```
media-gallery-project/
├── backend/
│   ├── controllers/
│   │   ├── authController.js      # Authentication logic
│   │   ├── mediaController.js     # Media management
│   │   ├── contactController.js   # Contact form handling
│   │   ├── userController.js      # User management
│   │   └── adminController.js     # Admin dashboard
│   ├── middlewares/
│   │   └── auth.js               # Authentication middleware
│   ├── models/
│   │   ├── User.js               # User model
│   │   ├── Media.js              # Media model
│   │   └── Contact.js            # Contact model
│   ├── routes/
│   │   ├── authRoutes.js         # Authentication routes
│   │   ├── mediaRoutes.js        # Media routes
│   │   ├── contactRoutes.js      # Contact routes
│   │   ├── userRoutes.js         # User management routes
│   │   └── adminRoutes.js        # Admin routes
│   ├── utils/
│   │   ├── otp.js                # OTP generation and email
│   │   ├── upload.js             # File upload handling
│   │   ├── validation.js         # Input validation
│   │   └── errorHandler.js       # Error handling
│   ├── uploads/                  # Image storage
│   ├── server.js                 # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Reusable components
│   │   │   ├── layout/           # Layout components
│   │   │   └── media/            # Media-specific components
│   │   ├── contexts/
│   │   │   └── AuthContext.js    # Authentication context
│   │   ├── pages/
│   │   │   ├── HomePage.js       # Landing page
│   │   │   ├── LoginPage.js      # Login page
│   │   │   ├── RegisterPage.js   # Registration page
│   │   │   ├── GalleryPage.js    # Media gallery
│   │   │   ├── UploadPage.js     # File upload
│   │   │   ├── ContactPage.js    # Contact form (authenticated)
│   │   │   ├── PublicContactPage.js # Public contact form
│   │   │   ├── AdminDashboard.js # Admin dashboard
│   │   │   ├── UserManagementPage.js # User management
│   │   │   ├── ContactManagementPage.js # Contact management
│   │   │   ├── NotFoundPage.js   # 404 page
│   │   │   └── UnauthorizedPage.js # 401 page
│   │   └── App.js                # Main app component
│   └── package.json
├── env_files/
│   ├── backend.env               # Backend environment variables
│   └── frontend.env              # Frontend environment variables
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Gmail account for OTP emails
- Google OAuth credentials (optional)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd media-gallery-project
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   cp ../env_files/backend.env .env
   # Configure your .env file with your credentials
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   cp ../env_files/frontend.env .env
   # Configure your .env file
   ```

4. **Environment Configuration:**

   **Backend (.env):**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/media-gallery
   JWT_SECRET=your-super-secret-jwt-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-gmail-app-password
   FRONTEND_URL=http://localhost:3000
   ```

   **Frontend (.env):**
   ```env
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
   ```

5. **Create Admin and Test Users:**
   ```bash
   # Create admin user
   cd backend
   node scripts/createAdmin.js
   
   # Create test user (optional)
   node scripts/createUser.js
   ```

6. **Start the Application:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

7. **Access the Application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### 🔐 Default Login Credentials

#### **Admin Account:**
- **Email:** `admin@mediagallery.com`
- **Password:** `admin123`
- **Role:** Admin
- **Features:** Full access to all features including user management, admin dashboard, and all media operations

#### **Test User Account:**
- **Email:** `user@mediagallery.com`
- **Password:** `user123`
- **Role:** User
- **Features:** Upload, edit own media, download, like, and basic features

### 🎯 User Roles & Permissions

| Feature | Admin | User |
|---------|-------|------|
| **Upload Media** | ✅ All media | ✅ Own media only |
| **Edit Media** | ✅ All media | ✅ Own media only |
| **Delete Media** | ✅ All media | ✅ Own media only |
| **User Management** | ✅ Full access | ❌ No access |
| **Admin Dashboard** | ✅ Full access | ❌ No access |
| **Contact Management** | ✅ All messages | ✅ Own messages only |
| **Download** | ✅ All media | ✅ All media |
| **Bulk Operations** | ✅ All features | ❌ No access |

## 🔧 Configuration

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)

### Gmail App Password Setup
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use this password in your `.env` file as `EMAIL_PASSWORD`

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - OTP verification
- `GET /api/auth/google` - Google OAuth
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Media Management
- `POST /api/media/upload` - Upload single image
- `POST /api/media/upload-multiple` - Upload multiple images
- `GET /api/media` - Get all media (with filters)
- `GET /api/media/:id` - Get single media
- `PUT /api/media/:id` - Update media
- `DELETE /api/media/:id` - Delete media
- `POST /api/media/:id/like` - Toggle like
- `GET /api/media/:id/download` - Download image
- `POST /api/media/download-zip` - Download multiple as ZIP

### Contact Management
- `POST /api/contact/submit` - Submit contact form (public)
- `GET /api/contact/my-messages` - Get user's messages
- `PUT /api/contact/my-messages/:id` - Update user's message
- `DELETE /api/contact/my-messages/:id` - Delete user's message
- `GET /api/contact/admin/all` - Get all messages (admin)
- `PUT /api/contact/admin/:id/status` - Update message status (admin)
- `DELETE /api/contact/admin/:id` - Delete message (admin)

### User Management (Admin)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/bulk-deactivate` - Bulk deactivate users
- `POST /api/users/bulk-reactivate` - Bulk reactivate users

### Admin Dashboard
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/recent-activity` - Get recent activity

## 🔒 Security Features

- **Password Requirements**: Minimum 6 characters with complexity
- **Account Protection**: Login attempt limiting (5 attempts), account lockout (2 hours)
- **Soft Delete**: Users and media are soft-deleted (isActive flag)
- **Email Verification**: Required for login
- **Rate Limiting**: Configurable limits for authentication routes
- **Input Validation**: Server-side validation for all inputs
- **CORS Configuration**: Proper CORS setup for security

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern Interface**: Clean, intuitive design with smooth animations
- **Loading States**: Proper loading indicators and skeleton screens
- **Error Handling**: User-friendly error messages and validation
- **Accessibility**: ARIA labels and keyboard navigation support
- **Dark Mode Ready**: CSS structure supports dark mode implementation

## 🚀 Deployment

### Backend Deployment (Render/Railway)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy with Node.js buildpack

### Frontend Deployment (Vercel/Netlify)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy with React buildpack

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/media-gallery
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=https://yourdomain.com
```

## 🔧 Troubleshooting

### Common Issues

#### 1. **Circular JSON Error in Download**
- **Issue:** "Converting circular structure to JSON" error when downloading
- **Solution:** Fixed in the latest version. The error was caused by logging response objects with circular references.

#### 2. **Admin Dashboard User Count Not Showing**
- **Issue:** User count displays as 0 or incorrect number
- **Solution:** Ensure MongoDB is running and the admin routes are properly configured.

#### 3. **User Management Not Working**
- **Issue:** Admin can't see or manage users
- **Solution:** The user management routes have been added to the admin controller.

#### 4. **Edit Buttons Missing**
- **Issue:** Edit buttons not appearing on media cards
- **Solution:** Edit functionality is now available in the dropdown menu (three dots) for media you own or if you're admin.

#### 5. **Download Button Styling Issues**
- **Issue:** Inconsistent download button appearance
- **Solution:** Download button styling has been standardized across all components.

### Getting Help

If you encounter any issues:

1. **Check the console** for error messages
2. **Verify MongoDB** is running and accessible
3. **Ensure all environment variables** are properly set
4. **Check network connectivity** between frontend and backend
5. **Verify user authentication** and role permissions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Email: support@mediagallery.com
- Create an issue in the GitHub repository
- Use the contact form in the application

## 🔄 Version History

- **v1.0.0** - Initial release with core features
  - Authentication system (Google OAuth + Email/Password)
  - Media gallery with CRUD operations
  - Contact form system
  - Admin dashboard and user management
  - ZIP download functionality
  - Responsive design with Tailwind CSS

## 🙏 Acknowledgments

- React.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- MongoDB team for the flexible database
- Express.js team for the web framework
- All contributors and testers

## 🤖 AI Usage Notes

This project was developed with assistance from AI tools for debugging and code optimization. The following AI tools were used:

### ChatGPT (OpenAI)
- **Purpose**: Code debugging, error resolution, and feature implementation
- **Usage**: 
  - Fixed circular JSON errors in download functionality
  - Optimized database queries and aggregation pipelines
  - Implemented proper error handling and validation
  - Assisted with responsive design and UI improvements
  - Helped with authentication flow and security implementation

### GitHub Copilot
- **Purpose**: Code completion and suggestions
- **Usage**:
  - Assisted with React component development
  - Provided suggestions for API endpoint implementations
  - Helped with TypeScript-like type checking in JavaScript
  - Suggested best practices for file structure and naming conventions

### AI-Assisted Development Benefits
- **Faster Development**: AI tools helped identify and fix bugs quickly
- **Code Quality**: Improved code structure and best practices
- **Documentation**: Assisted with comprehensive README and API documentation
- **Testing**: Helped create test scenarios and edge cases
- **Security**: Identified potential security vulnerabilities and suggested fixes

### Development Process
1. **Initial Setup**: Manual project structure and basic configuration
2. **Core Features**: AI-assisted implementation of authentication and media management
3. **UI/UX**: AI suggestions for responsive design and user experience
4. **Testing**: AI-assisted debugging and error resolution
5. **Documentation**: AI help with comprehensive documentation
6. **Deployment**: AI guidance for production deployment considerations

### Ethical Considerations
- All AI-generated code was reviewed and tested thoroughly
- Human oversight maintained throughout the development process
- Code quality and security standards were prioritized
- Original project requirements and specifications were strictly followed

---

**Note**: This project demonstrates the effective use of AI tools in modern web development while maintaining high code quality and user experience standards.

