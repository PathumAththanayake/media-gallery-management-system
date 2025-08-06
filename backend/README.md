# Media Gallery Backend - Authentication System

This is the backend API for the Media Gallery application, featuring a comprehensive authentication system with Google OAuth, email/password registration, OTP verification, and role-based access control.

## Features

### Authentication
- **Google OAuth 2.0** - Login with Google account
- **Email/Password Registration** - Traditional registration with email verification
- **OTP Verification** - Email-based OTP for account verification and password reset
- **JWT Authentication** - Stateless authentication with JSON Web Tokens
- **Role-based Access Control** - Admin and user roles with different permissions
- **Account Security** - Login attempt limiting, account lockout, and soft delete

### Security Features
- Password hashing with bcrypt
- JWT token expiration
- Rate limiting for auth routes
- Input validation and sanitization
- CORS configuration
- Error handling and logging

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Gmail account for OTP emails
- Google OAuth credentials

### Installation

1. **Clone the repository and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Copy the environment file and configure your variables:
   ```bash
   cp ../env_files/backend.env .env
   ```

4. **Configure environment variables in `.env`:**
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/media-gallery

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

   # Email Configuration (Gmail)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-gmail-app-password

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000
   ```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)
6. Copy Client ID and Client Secret to your `.env` file

### Gmail App Password Setup

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use this password in your `.env` file as `EMAIL_PASSWORD`

### Running the Application

1. **Development mode:**
   ```bash
   npm run dev
   ```

2. **Production mode:**
   ```bash
   npm start
   ```

The server will start on `http://localhost:5000`

## API Documentation

### Authentication Endpoints

#### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for OTP verification."
}
```

#### 2. Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### 3. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "avatar": "avatar_url"
  }
}
```

#### 4. Google OAuth
```http
GET /api/auth/google
```

**Callback URL:** `GET /api/auth/google/callback`

#### 5. Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### 6. Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePass123"
}
```

#### 7. Get Current User
```http
GET /api/auth/me
Authorization: Bearer jwt_token_here
```

#### 8. Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "name": "John Smith",
  "avatar": "https://example.com/avatar.jpg"
}
```

#### 9. Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "currentPassword": "SecurePass123",
  "newPassword": "NewSecurePass123"
}
```

#### 10. Logout
```http
POST /api/auth/logout
Authorization: Bearer jwt_token_here
```

### Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Please enter a valid email address"
    }
  ]
}
```

## Middleware

### Authentication Middleware

- `authenticateToken` - Verifies JWT token and adds user to request
- `requireAdmin` - Ensures user has admin role
- `requireAdminOrOwner` - Allows admin or resource owner access
- `optionalAuth` - Optional authentication for public routes
- `authRateLimit` - Rate limiting for authentication routes

### Usage Example

```javascript
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

// Protected route
router.get('/protected', authenticateToken, (req, res) => {
  // req.user contains user information
  res.json({ user: req.user });
});

// Admin only route
router.get('/admin', authenticateToken, requireAdmin, (req, res) => {
  res.json({ message: 'Admin access granted' });
});
```

## Models

### User Model

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required unless Google OAuth),
  googleId: String (unique, sparse),
  avatar: String,
  role: String (enum: ['user', 'admin'], default: 'user'),
  isEmailVerified: Boolean (default: false),
  isActive: Boolean (default: true),
  otp: String,
  otpExpiry: Date,
  lastLogin: Date,
  loginAttempts: Number,
  lockUntil: Date
}
```

## Security Features

### Password Requirements
- Minimum 6 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Account Protection
- Login attempt limiting (5 attempts)
- Account lockout (2 hours)
- Soft delete via `isActive` flag
- Email verification required for login

### Rate Limiting
- 5 attempts per 15 minutes for auth routes
- Configurable limits in environment variables

## File Structure

```
backend/
├── controllers/
│   └── authController.js      # Authentication logic
├── middlewares/
│   └── auth.js               # Authentication middleware
├── models/
│   └── User.js               # User model
├── routes/
│   └── authRoutes.js         # Authentication routes
├── utils/
│   ├── otp.js                # OTP generation and email
│   ├── validation.js         # Input validation
│   └── errorHandler.js       # Error handling
├── server.js                 # Main server file
├── package.json              # Dependencies
└── .env                      # Environment variables
```

## Testing

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "Media Gallery API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Production Deployment

### Environment Variables
- Use strong JWT secrets
- Configure production MongoDB URI
- Set up production Google OAuth credentials
- Use environment-specific email settings
- Configure proper CORS origins

### Security Considerations
- Use HTTPS in production
- Implement proper logging
- Set up monitoring and alerting
- Regular security updates
- Database backups

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check MongoDB service is running
   - Verify connection string in `.env`

2. **Google OAuth Error**
   - Verify Google OAuth credentials
   - Check redirect URI configuration

3. **Email Not Sending**
   - Verify Gmail app password
   - Check email configuration in `.env`

4. **JWT Token Issues**
   - Ensure JWT_SECRET is set
   - Check token expiration settings

### Logs
Check console logs for detailed error information. In production, implement proper logging to a file or service.

## Contributing

1. Follow the existing code style
2. Add validation for new endpoints
3. Include error handling
4. Update documentation
5. Test thoroughly

## License

This project is licensed under the ISC License. 