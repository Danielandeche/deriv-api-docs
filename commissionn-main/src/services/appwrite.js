import { Client, Account, Databases, ID, Query } from 'appwrite';

// Check if Appwrite is configured
const isAppwriteConfigured = () => {
  return !!(
    process.env.REACT_APP_APPWRITE_ENDPOINT &&
    process.env.REACT_APP_APPWRITE_PROJECT_ID
  );
};

// Initialize Appwrite Client only if configured
let client = null;
let account = null;
let databases = null;

if (isAppwriteConfigured()) {
  client = new Client();
  client
    .setEndpoint(process.env.REACT_APP_APPWRITE_ENDPOINT)
    .setProject(process.env.REACT_APP_APPWRITE_PROJECT_ID);
  
  account = new Account(client);
  databases = new Databases(client);
}

export { account, databases };

// Database and Collection IDs
const DATABASE_ID = process.env.REACT_APP_APPWRITE_DATABASE_ID || 'deriv_commission_db';
// eslint-disable-next-line no-unused-vars
const USERS_COLLECTION_ID = process.env.REACT_APP_APPWRITE_USERS_COLLECTION_ID || 'users';
const TOKENS_COLLECTION_ID = process.env.REACT_APP_APPWRITE_TOKENS_COLLECTION_ID || 'tokens';
const APPS_COLLECTION_ID = process.env.REACT_APP_APPWRITE_APPS_COLLECTION_ID || 'apps';

// ============================================
// AUTHENTICATION
// ============================================

/**
 * Create anonymous session for guest users
 */
export const createAnonymousSession = async () => {
  if (!isAppwriteConfigured() || !account) {
    console.log('Appwrite not configured, skipping session creation');
    return null;
  }
  
  try {
    // Try to get current session first
    const session = await account.getSession('current');
    return session; // Session exists
  } catch (error) {
    // No session exists, try to create one
    try {
      return await account.createAnonymousSession();
    } catch (createError) {
      console.log('Could not create session:', createError.message);
      return null;
    }
  }
};

/**
 * Get current user session
 */
export const getCurrentUser = async () => {
  try {
    return await account.get();
  } catch (error) {
    return null;
  }
};

/**
 * Logout current user
 */
export const logout = async () => {
  try {
    await account.deleteSession('current');
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

// ============================================
// TOKEN MANAGEMENT
// ============================================

/**
 * Save or update token for a user
 * @param {string} loginId - Deriv login ID
 * @param {string} token - API token
 * @param {array} apps - Array of app objects with domains
 */
export const saveToken = async (loginId, token, apps = []) => {
  if (!isAppwriteConfigured() || !databases) {
    console.log('Appwrite not configured, skipping token save');
    return null;
  }
  
  try {
    // Check if token already exists for this loginId
    const existing = await databases.listDocuments(
      DATABASE_ID,
      TOKENS_COLLECTION_ID,
      [Query.equal('loginId', loginId)]
    );

    const tokenData = {
      loginId,
      token,
      apps: JSON.stringify(apps)
    };

    if (existing.documents.length > 0) {
      // Update existing token
      return await databases.updateDocument(
        DATABASE_ID,
        TOKENS_COLLECTION_ID,
        existing.documents[0].$id,
        tokenData
      );
    } else {
      // Create new token
      return await databases.createDocument(
        DATABASE_ID,
        TOKENS_COLLECTION_ID,
        ID.unique(),
        tokenData
      );
    }
  } catch (error) {
    console.error('Error saving token:', error);
    return null;
  }
};

/**
 * Get token by loginId
 * @param {string} loginId - Deriv login ID
 */
export const getTokenByLoginId = async (loginId) => {
  if (!isAppwriteConfigured() || !databases) {
    console.log('Appwrite not configured, skipping token retrieval');
    return null;
  }
  
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      TOKENS_COLLECTION_ID,
      [Query.equal('loginId', loginId)]
    );

    if (response.documents.length > 0) {
      const doc = response.documents[0];
      return {
        ...doc,
        apps: doc.apps ? JSON.parse(doc.apps) : []
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

/**
 * Get all tokens for current user
 */
export const getAllTokens = async () => {
  if (!isAppwriteConfigured() || !databases) {
    console.log('Appwrite not configured, skipping tokens retrieval');
    return [];
  }
  
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      TOKENS_COLLECTION_ID
    );

    return response.documents.map(doc => ({
      ...doc,
      apps: doc.apps ? JSON.parse(doc.apps) : []
    }));
  } catch (error) {
    console.error('Error getting all tokens:', error);
    return [];
  }
};

/**
 * Delete token by loginId
 * @param {string} loginId - Deriv login ID
 */
export const deleteToken = async (loginId) => {
  if (!isAppwriteConfigured() || !databases) {
    console.log('Appwrite not configured, skipping token deletion');
    return false;
  }
  
  try {
    const existing = await databases.listDocuments(
      DATABASE_ID,
      TOKENS_COLLECTION_ID,
      [Query.equal('loginId', loginId)]
    );

    if (existing.documents.length > 0) {
      await databases.deleteDocument(
        DATABASE_ID,
        TOKENS_COLLECTION_ID,
        existing.documents[0].$id
      );
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting token:', error);
    return false;
  }
};

// ============================================
// APP DOMAINS MANAGEMENT
// ============================================

/**
 * Save app domains
 * @param {string} loginId - Deriv login ID
 * @param {array} apps - Array of app objects
 */
export const saveAppDomains = async (loginId, apps) => {
  if (!isAppwriteConfigured() || !databases) {
    console.log('Appwrite not configured, skipping app domains save');
    return null;
  }
  
  try {
    const appData = {
      loginId,
      apps: JSON.stringify(apps)
    };

    // Check if apps already exist for this loginId
    const existing = await databases.listDocuments(
      DATABASE_ID,
      APPS_COLLECTION_ID,
      [Query.equal('loginId', loginId)]
    );

    if (existing.documents.length > 0) {
      // Update existing
      return await databases.updateDocument(
        DATABASE_ID,
        APPS_COLLECTION_ID,
        existing.documents[0].$id,
        appData
      );
    } else {
      // Create new
      return await databases.createDocument(
        DATABASE_ID,
        APPS_COLLECTION_ID,
        ID.unique(),
        appData
      );
    }
  } catch (error) {
    console.error('Error saving app domains:', error);
    return null;
  }
};

/**
 * Get app domains by loginId
 * @param {string} loginId - Deriv login ID
 */
export const getAppDomains = async (loginId) => {
  if (!isAppwriteConfigured() || !databases) {
    console.log('Appwrite not configured, skipping app domains retrieval');
    return [];
  }
  
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      APPS_COLLECTION_ID,
      [Query.equal('loginId', loginId)]
    );

    if (response.documents.length > 0) {
      const doc = response.documents[0];
      return doc.apps ? JSON.parse(doc.apps) : [];
    }
    return [];
  } catch (error) {
    console.error('Error getting app domains:', error);
    return [];
  }
};
