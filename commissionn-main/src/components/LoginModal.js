import { useState, useEffect } from 'react';
import { connectDeriv } from '../services/deriv';
import { getAppList } from '../services/deriv';
import { createAnonymousSession, saveToken } from '../services/appwrite';

export default function LoginModal({ onSuccess }) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    // Initialize Appwrite session
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      await createAnonymousSession();
    } catch (error) {
      // Session already exists or error
    }
  };

  const login = async () => {
    if (!token.trim()) {
      setError('Please enter your API token');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Connect to Deriv
      const authResponse = await connectDeriv(token);
      
      // Get loginId from authorize response - handle both response formats
      // The official API may return: { authorize: { loginid: ... } } or { loginid: ... }
      let loginId = authResponse?.authorize?.loginid || authResponse?.loginid;
      
      if (!loginId) {
        throw new Error('Failed to get login ID from Deriv');
      }

      // Get app list with domains - handle both response formats
      const appListResponse = await getAppList();
      const apps = appListResponse?.app_list || [];
      
      // Save token and apps to Appwrite
      await saveToken(loginId, token, apps);
      
      // Also save apps to apps collection
      if (apps.length > 0) {
        const { saveAppDomains } = await import('../services/appwrite');
        await saveAppDomains(loginId, apps);
      }
      
      // Store in localStorage for quick access
      localStorage.setItem('deriv_token', token);
      localStorage.setItem('deriv_loginid', loginId);
      
      onSuccess();
    } catch (err) {
      const errorMsg = err.message || 'Failed to connect. Please check your token and try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = () => {
    // Deriv OAuth URL
    const appId = process.env.REACT_APP_DERIV_APP_ID || '105603';
    const redirectUri = `${window.location.origin}/oauth/callback`;
    const oauthUrl = `https://oauth.deriv.com/oauth2/authorize?app_id=${appId}&l=EN&brand=deriv&redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    // Redirect to Deriv OAuth
    window.location.href = oauthUrl;
  };

  return (
    <div className="modal">
      <div className="modal-card">
        <div className="modal-icon">
          ✨
        </div>
        
        <h2>Welcome Back</h2>
        <p className="subtitle">Access your Deriv commission dashboard</p>

        <div className="input-group">
          <label>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            API Token
          </label>
          <div className="input-wrapper">
            <input
              type={showToken ? 'text' : 'password'}
              placeholder="Enter your Deriv API token"
              value={token}
              onChange={e => setToken(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && !loading && login()}
            />
            <button 
              className="toggle-password" 
              onClick={() => setShowToken(!showToken)}
              type="button"
            >
              {showToken ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>

        <button className="btn-primary" onClick={login} disabled={loading || !token.trim()}>
          {loading ? (
            <>
              <div className="spinner"></div>
              Connecting...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Sign In with Token
            </>
          )}
        </button>

        <div className="divider">OR CONTINUE WITH</div>

        <button className="btn-secondary" onClick={handleOAuthLogin} disabled={loading}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10"/>
          </svg>
          Sign In with Deriv OAuth
        </button>

        <div className="modal-footer">
          Developed by <span>TRADERSHUB.SITE</span>
        </div>
      </div>
    </div>
  );
}
