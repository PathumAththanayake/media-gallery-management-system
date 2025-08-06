# Login Test Guide

This guide provides test credentials and instructions for testing all authentication methods in the Media Gallery application.

## Test Credentials

### Admin User
- **Email**: `admin@mediagallery.com`
- **Password**: `admin123`
- **Role**: Admin
- **Access**: Full admin privileges

### Regular User
- **Email**: `user@mediagallery.com`
- **Password**: `user123`
- **Role**: User
- **Access**: Standard user privileges

## Testing Steps

### 1. Email/Password Login

1. **Go to**: `http://localhost:3000/login`
2. **Test Admin Login**:
   - Email: `admin@mediagallery.com`
   - Password: `admin123`
   - Expected: Redirect to admin dashboard

3. **Test User Login**:
   - Email: `user@mediagallery.com`
   - Password: `user123`
   - Expected: Redirect to home page

### 2. Google OAuth Login

1. **Go to**: `http://localhost:3000/login`
2. **Click**: "Sign in with Google" button
3. **Expected**: Redirect to Google OAuth consent screen
4. **After authorization**: Redirect back to application with automatic login

### 3. Registration (New User)

1. **Go to**: `http://localhost:3000/register`
2. **Fill in**:
   - Name: Any name
   - Email: New email address
   - Password: Any password (min 6 characters)
3. **Expected**: Account created and automatically logged in

## Fixed Issues

### ✅ Admin User Creation
- Admin user created with credentials: `admin@mediagallery.com` / `admin123`

### ✅ Regular User Creation
- Test user created with credentials: `user@mediagallery.com` / `user123`

### ✅ Google OAuth Fix
- Updated callback to properly redirect to frontend
- Added proper error handling
- Fixed token and user data passing

### ✅ Email Verification Bypass
- Temporarily disabled email verification requirement for testing
- Users can now login immediately after registration

### ✅ Frontend Integration
- Updated LoginPage to handle Google OAuth callbacks
- Added proper error handling for OAuth failures
- Fixed user context management

## Troubleshooting

### If Login Still Fails:

1. **Check Server Status**:
   - Backend: `http://localhost:5000/health`
   - Frontend: `http://localhost:3000`

2. **Check Environment Variables**:
   - Ensure `.env` files are properly configured
   - Verify Google OAuth credentials are correct

3. **Check Browser Console**:
   - Look for any JavaScript errors
   - Check network requests for API errors

4. **Check Server Logs**:
   - Backend console for authentication errors
   - Frontend console for React errors

### Common Issues:

1. **"Invalid credentials"**:
   - Verify email and password are correct
   - Check if user exists in database

2. **"Account deactivated"**:
   - User account may be inactive
   - Check database for user status

3. **Google OAuth errors**:
   - Verify Google OAuth credentials
   - Check authorized redirect URIs
   - Ensure APIs are enabled in Google Cloud Console

## Database Verification

To verify users exist in the database:

```bash
# Connect to MongoDB
mongosh

# Switch to database
use media-gallery

# Check users
db.users.find({}, {email: 1, role: 1, isActive: 1, isEmailVerified: 1})
```

## Security Notes

⚠️ **Important**: These are test credentials for development only. In production:

1. Use strong, unique passwords
2. Enable email verification
3. Implement proper security measures
4. Remove test users
5. Use environment-specific credentials

## Next Steps

After successful testing:

1. **Re-enable email verification** in production
2. **Remove test users** from production database
3. **Update Google OAuth** for production domain
4. **Implement proper security** measures
5. **Add rate limiting** and other protections 