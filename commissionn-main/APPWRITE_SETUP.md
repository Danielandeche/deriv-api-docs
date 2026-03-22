# Appwrite Setup Guide

This guide will help you set up Appwrite for the Deriv Commission Dashboard.

## 1. Create Appwrite Project

1. Go to [Appwrite Cloud](https://cloud.appwrite.io/) or your self-hosted Appwrite instance
2. Create a new project
3. Copy your **Project ID**

## 2. Configure Environment Variables

Update the `.env` file with your Appwrite credentials:

```env
REACT_APP_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
REACT_APP_APPWRITE_PROJECT_ID=your_project_id_here
REACT_APP_APPWRITE_DATABASE_ID=deriv_commission_db
REACT_APP_APPWRITE_USERS_COLLECTION_ID=users
REACT_APP_APPWRITE_TOKENS_COLLECTION_ID=tokens
REACT_APP_APPWRITE_APPS_COLLECTION_ID=apps
```

## 3. Create Database

1. In your Appwrite project, go to **Databases**
2. Click **Create Database**
3. Name it: `deriv_commission_db`
4. Copy the **Database ID** and update `.env`

## 4. Create Collections

### Collection 1: Users
- **Collection ID**: `users`
- **Permissions**: 
  - Read: Anyone
  - Create: Anyone
  - Update: Anyone
  - Delete: Anyone

**Attributes:**
- `loginId` (String, 255, Required)
- `email` (Email, 255, Optional)
- `name` (String, 255, Optional)

**Indexes:**
- `loginId_unique` (Unique, ASC) on `loginId`

### Collection 2: Tokens
- **Collection ID**: `tokens`
- **Permissions**: 
  - Read: Anyone
  - Create: Anyone
  - Update: Anyone
  - Delete: Anyone

**Attributes:**
- `loginId` (String, 255, Required)
- `token` (String, 1000, Required)
- `apps` (String, **50000**, Optional) - JSON string of app array

**Indexes:**
- `loginId_index` (Key, ASC) on `loginId`

### Collection 3: Apps
- **Collection ID**: `apps`
- **Permissions**: 
  - Read: Anyone
  - Create: Anyone
  - Update: Anyone
  - Delete: Anyone

**Attributes:**
- `loginId` (String, 255, Required)
- `apps` (String, **50000**, Required) - JSON string of app array with domains

**Indexes:**
- `loginId_index` (Key, ASC) on `loginId`

**Note:** Do NOT add `createdAt` or `updatedAt` as custom attributes. Appwrite automatically provides `$createdAt` and `$updatedAt` system attributes for each document.

## 5. Configure Platform (for OAuth)

1. Go to **Settings** > **Platforms**
2. Click **Add Platform** > **Web App**
3. Add your app details:
   - **Name**: Deriv Commission Dashboard
   - **Hostname**: `localhost` (for development)
   - **Hostname**: `yourdomain.com` (for production)

## 6. Enable Anonymous Sessions (Optional)

1. Go to **Auth** > **Settings**
2. Enable **Anonymous Sessions** if you want to allow users without accounts

## 7. Deriv OAuth Setup

### Register OAuth App with Deriv

1. Go to [Deriv API Console](https://api.deriv.com/app-registration)
2. Register a new app:
   - **App Name**: Your Dashboard Name
   - **Redirect URL**: `http://localhost:3000/oauth/callback` (development)
   - **Redirect URL**: `https://yourdomain.com/oauth/callback` (production)
3. Copy your **App ID** and **Client ID**

### Configure OAuth in App

Update your `.env` with Deriv OAuth credentials:

```env
REACT_APP_DERIV_APP_ID=your_deriv_app_id
REACT_APP_DERIV_OAUTH_URL=https://oauth.deriv.com/oauth2/authorize
```

## 8. Test the Setup

1. Restart your development server:
   ```bash
   npm start
   ```

2. Try logging in with an API token
3. Check Appwrite Console to verify data is being saved

## 9. Security Best Practices

1. **Never commit `.env` file** - Add it to `.gitignore`
2. **Use environment-specific configs** for development/production
3. **Set proper permissions** on Appwrite collections
4. **Enable rate limiting** in Appwrite settings
5. **Use HTTPS** in production

## 10. Troubleshooting

### Connection Issues
- Verify your Appwrite endpoint URL
- Check if Project ID is correct
- Ensure your domain is added to Platforms

### Permission Errors
- Check collection permissions
- Verify user is authenticated
- Check if anonymous sessions are enabled (if using)

### Data Not Saving
- Verify Database ID and Collection IDs
- Check attribute types match the data
- Look for errors in browser console

## Database Schema Overview

```
deriv_commission_db/
├── users/
│   ├── loginId (unique)
│   ├── email
│   ├── name
│   ├── createdAt
│   └── updatedAt
├── tokens/
│   ├── loginId (indexed)
│   ├── token
│   ├── apps (JSON)
│   ├── createdAt
│   └── updatedAt
└── apps/
    ├── loginId (indexed)
    ├── apps (JSON)
    ├── createdAt
    └── updatedAt
```

## Support

For issues with:
- **Appwrite**: [Appwrite Documentation](https://appwrite.io/docs)
- **Deriv API**: [Deriv API Documentation](https://api.deriv.com/docs)
