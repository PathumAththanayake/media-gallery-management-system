# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the Media Gallery application.

## Prerequisites

- A Google account
- Access to Google Cloud Console

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top and click "New Project"
3. Enter a project name (e.g., "Media Gallery")
4. Click "Create"

## Step 2: Enable Required APIs

1. In your new project, go to "APIs & Services" → "Library"
2. Search for and enable these APIs:
   - **Google+ API** (or Google Identity API)
   - **Google OAuth2 API**

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" user type (unless you have a Google Workspace)
3. Fill in the required information:
   - **App name**: Media Gallery
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click "Save and Continue"
5. Skip "Scopes" section and click "Save and Continue"
6. Add test users if needed, then click "Save and Continue"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Fill in the details:
   - **Name**: Media Gallery Web Client
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     https://yourdomain.com (for production)
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:5000/api/auth/google/callback
     https://yourdomain.com/api/auth/google/callback (for production)
     ```
5. Click "Create"

## Step 5: Copy Credentials

After creating the OAuth client, you'll see:
- **Client ID** (looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
- **Client Secret** (looks like: `GOCSPX-abcdefghijklmnopqrstuvwxyz`)

## Step 6: Update Environment Files

### Backend Environment (`env_files/backend.env`)

Replace the placeholder values with your actual credentials:

```env
GOOGLE_CLIENT_ID=your-actual-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### Frontend Environment (`env_files/frontend.env`)

Replace the placeholder value with your actual client ID:

```env
REACT_APP_GOOGLE_CLIENT_ID=your-actual-client-id-here
```

## Step 7: Restart Servers

After updating the environment files:

1. **Backend**: Stop and restart the backend server
   ```bash
   cd backend
   npm run dev
   ```

2. **Frontend**: Stop and restart the frontend server
   ```bash
   cd frontend
   npm start
   ```

## Step 8: Test Google OAuth

1. Go to `http://localhost:3000`
2. Click "Sign in with Google"
3. You should be redirected to Google's OAuth consent screen
4. After authorization, you should be redirected back to the application

## Troubleshooting

### Common Issues:

1. **"OAuth client was not found"**
   - Check that your Client ID is correct in both environment files
   - Ensure the Client ID matches exactly (no extra spaces)

2. **"Redirect URI mismatch"**
   - Verify the redirect URI in Google Cloud Console matches exactly
   - Check for trailing slashes or protocol mismatches

3. **"Invalid client"**
   - Ensure the Client Secret is correct
   - Check that the Client ID and Secret are from the same OAuth client

4. **"Access blocked"**
   - Make sure you've added your email as a test user in the OAuth consent screen
   - Check that the required APIs are enabled

### For Production:

When deploying to production:

1. Update the authorized origins and redirect URIs in Google Cloud Console
2. Update the environment variables with production URLs
3. Ensure your domain is verified in Google Cloud Console

## Security Notes

- Never commit your actual OAuth credentials to version control
- Use environment variables for all sensitive information
- Regularly rotate your Client Secret
- Monitor OAuth usage in Google Cloud Console

## Support

If you encounter issues:
1. Check the Google Cloud Console for any error messages
2. Verify all environment variables are set correctly
3. Check the browser console and server logs for detailed error messages 