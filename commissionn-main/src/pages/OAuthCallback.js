import { useEffect, useState } from 'react';
import { connectDeriv, getAppList } from '../services/deriv';
import { saveToken } from '../services/appwrite';

export default function OAuthCallback() {
  const [status, setStatus] = useState('Processing...');
  const [error, setError] = useState('');

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      // Get URL parameters
      const params = new URLSearchParams(window.location.search);
      
      // Handle multiple accounts from OAuth (acct1, acct2, acct3, etc.)
      const accounts = [];
      let i = 1;
      while (params.has(`acct${i}`)) {
        accounts.push({
          loginId: params.get(`acct${i}`),
          token: params.get(`token${i}`),
          currency: params.get(`cur${i}`)
        });
        i++;
      }

      if (accounts.length === 0) {
        throw new Error('No accounts received from Deriv OAuth');
      }

      // Use the first account's token to connect
      const firstAccount = accounts[0];
      const token = firstAccount.token;
      
      if (!token) {
        throw new Error('No valid token received from Deriv OAuth');
      }

      // Connect to Deriv with the OAuth token
      const authResponse = await connectDeriv(token);
      // Handle both response formats for loginId
      const loginId = authResponse?.authorize?.loginid || authResponse?.loginid || firstAccount.loginId;

      // Get app list with domains
      const appListResponse = await getAppList();
      const apps = appListResponse?.app_list || [];

      // Save token and apps to Appwrite
      await saveToken(loginId, token, apps);

      // Store in localStorage
      localStorage.setItem('deriv_token', token);
      localStorage.setItem('deriv_loginid', loginId);
      
      // Store all accounts
      localStorage.setItem('deriv_accounts', JSON.stringify(accounts));

      setStatus('Success!');

      // Redirect to dashboard
      window.location.href = '/';

    } catch (err) {
      setError(err.message || 'Failed to complete OAuth login');
      setStatus('Error');
    }
  };

  return (
    <div className="oauth-callback">
      <div className="oauth-callback-card">
        {error ? (
          <>
            <div className="oauth-icon error">❌</div>
            <h2>Authentication Failed</h2>
            <p className="error-message">{error}</p>
            <button 
              className="btn-primary" 
              onClick={() => window.location.href = '/'}
            >
              Return to Login
            </button>
          </>
        ) : (
          <>
            <div className="oauth-icon">
              <div className="spinner-large"></div>
            </div>
            <h2>{status}</h2>
            <p className="subtitle">Please wait while we set up your account...</p>
          </>
        )}
      </div>
    </div>
  );
}
