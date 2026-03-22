import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTokens } from '../services/appwrite';
import { connectDeriv, getCommission } from '../services/deriv';
import dayjs from 'dayjs';

export default function AdminDashboard() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [loadingCommissions, setLoadingCommissions] = useState({});
  const [commissions, setCommissions] = useState({});
  const [selectedDomain, setSelectedDomain] = useState(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadTokens();
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadTokens = async () => {
    setLoading(true);
    try {
      const data = await getAllTokens();
      setTokens(data);
    } catch (error) {
      console.error('Error loading tokens:', error);
    }
    setLoading(false);
  };

  const copyToken = async (token, id) => {
    try {
      await navigator.clipboard.writeText(token);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const loadCommission = async (tokenData) => {
    setLoadingCommissions(prev => ({ ...prev, [tokenData.$id]: true }));
    
    try {
      // Connect to Deriv with this token
      await connectDeriv(tokenData.token);
      
      // Get this month's commission
      const thisMonthFrom = dayjs().startOf('month').format('YYYY-MM-DD HH:mm:ss');
      const thisMonthTo = dayjs().endOf('month').format('YYYY-MM-DD HH:mm:ss');
      const thisMonthRes = await getCommission(thisMonthFrom, thisMonthTo);
      
      // Get last month's commission
      const lastMonthFrom = dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD HH:mm:ss');
      const lastMonthTo = dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD HH:mm:ss');
      const lastMonthRes = await getCommission(lastMonthFrom, lastMonthTo);
      
      // Get this month app breakdown (for top sites)
      const thisMonthBreakdown = thisMonthRes?.app_markup_statistics?.breakdown || [];
      
      // Get last month app breakdown (for top sites)
      const lastMonthBreakdown = lastMonthRes?.app_markup_statistics?.breakdown || [];
      
      // Combine apps from both months to find top active sites
      const allApps = {};
      [...thisMonthBreakdown, ...lastMonthBreakdown].forEach(app => {
        const appId = app.app_id;
        if (!allApps[appId]) {
          allApps[appId] = {
            appId,
            commission: 0,
            transactions: 0,
          };
        }
        allApps[appId].commission += app.app_markup_usd || 0;
        allApps[appId].transactions += app.transactions_count || 0;
      });
      
      // Sort by transactions and get top 3 (excluding CR5321054)
      const topApps = Object.values(allApps)
        .filter(app => app.appId !== 'CR5321054')
        .sort((a, b) => b.transactions - a.transactions)
        .slice(0, 3);
      
      const thisMonthCommission = thisMonthRes?.app_markup_statistics?.total_app_markup_usd || 0;
      const thisMonthTransactions = thisMonthRes?.app_markup_statistics?.total_transactions_count || 0;
      const lastMonthCommission = lastMonthRes?.app_markup_statistics?.total_app_markup_usd || 0;
      const lastMonthTransactions = lastMonthRes?.app_markup_statistics?.total_transactions_count || 0;
      
      setCommissions(prev => ({ 
        ...prev, 
        [tokenData.$id]: { 
          thisMonth: { commission: thisMonthCommission, transactions: thisMonthTransactions },
          lastMonth: { commission: lastMonthCommission, transactions: lastMonthTransactions },
          topApps
        }
      }));
    } catch (error) {
      console.error('Error loading commission:', error);
    } finally {
      setLoadingCommissions(prev => ({ ...prev, [tokenData.$id]: false }));
    }
  };

  // Build suggestions from all login IDs and domains
  const buildSuggestions = (term) => {
    if (!term || term.length < 1) return [];
    
    const search = term.toLowerCase();
    const allSuggestions = [];
    const seen = new Set();
    
    tokens.forEach(token => {
      // Add login ID as suggestion
      if (token.loginId?.toLowerCase().includes(search)) {
        const key = `login-${token.loginId}`;
        if (!seen.has(key)) {
          seen.add(key);
          allSuggestions.push({
            type: 'login',
            display: token.loginId,
            tokenId: token.$id,
          });
        }
      }
      
      // Add each domain as suggestion
      if (token.apps && Array.isArray(token.apps)) {
        token.apps.forEach(app => {
          const domain = app.homepage || app.redirect_uri;
          if (domain && domain.toLowerCase().includes(search)) {
            const key = `domain-${domain}`;
            if (!seen.has(key)) {
              seen.add(key);
              allSuggestions.push({
                type: 'domain',
                display: domain,
                owner: token.loginId,
                tokenId: token.$id,
              });
            }
          }
        });
      }
    });
    
    return allSuggestions.slice(0, 10);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedDomain(null);
    
    if (value.length > 0) {
      const newSuggestions = buildSuggestions(value);
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.display);
    setShowSuggestions(false);
    setSelectedDomain(suggestion);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedDomain(null);
  };

  // Filter tokens - exclude CR5321054
  const filteredTokens = selectedDomain 
    ? tokens.filter(t => t.$id === selectedDomain.tokenId)
    : tokens.filter(t => t.loginId !== 'CR5321054');

  const formatCurrency = (num) => {
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  if (loading) {
    return (
      <div className="all-apps-loading">
        <div className="spinner"></div>
        <p>Loading tokens...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
        <h1>Token Manager</h1>
        <p className="subtitle">Manage and switch between your Deriv accounts</p>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <span className="stat-number">{tokens.length}</span>
          <span className="stat-label">Total Accounts</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{Object.keys(commissions).length}</span>
          <span className="stat-label">Accounts Loaded</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{Object.values(commissions).reduce((acc, c) => acc + (c?.thisMonth?.commission || 0), 0).toFixed(2)}</span>
          <span className="stat-label">Total Commission</span>
        </div>
      </div>

      <div className="admin-search" ref={searchRef}>
        <div className="search-wrapper">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search by Login ID or Domain..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => searchTerm.length > 0 && setShowSuggestions(true)}
            className="admin-search-input"
          />
          {searchTerm && (
            <button className="clear-search" onClick={clearSearch}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
        
        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {suggestions.map((suggestion, idx) => (
              <div 
                key={idx} 
                className="suggestion-item"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion.type === 'domain' ? (
                  <>
                    <span className="suggestion-icon">🌐</span>
                    <span className="suggestion-domain">{suggestion.display}</span>
                    <span className="suggestion-owner">→ {suggestion.owner}</span>
                  </>
                ) : (
                  <>
                    <span className="suggestion-icon">👤</span>
                    <span className="suggestion-login">{suggestion.display}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="tokens-grid">
        {filteredTokens.length === 0 ? (
          <div className="no-results">
            <p>No tokens found</p>
          </div>
        ) : (
          filteredTokens.map((token) => (
            <div key={token.$id} className="token-admin-card">
              <div className="token-admin-header">
                <span className="login-id">{token.loginId}</span>
              </div>

              <div className="token-admin-field">
                <label>Token</label>
                <div className="token-copy-row">
                  <span className="token-text">
                    {token.token.substring(0, 20)}...
                  </span>
                  <button 
                    className="copy-btn"
                    onClick={() => copyToken(token.token, token.$id)}
                  >
                    {copiedId === token.$id ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="commission-section">
                {commissions[token.$id] ? (
                  <div className="commission-display">
                    <div className="commission-row">
                      <span className="comm-label">This Month</span>
                      <span className="comm-value">${formatCurrency(commissions[token.$id].thisMonth.commission)}</span>
                    </div>
                    <div className="commission-row">
                      <span className="comm-label">Transactions</span>
                      <span className="comm-value">{commissions[token.$id].thisMonth.transactions}</span>
                    </div>
                    <div className="commission-row">
                      <span className="comm-label">Last Month</span>
                      <span className="comm-value">${formatCurrency(commissions[token.$id].lastMonth.commission)}</span>
                    </div>
                    {commissions[token.$id].topApps && commissions[token.$id].topApps.length > 0 && (
                      <div className="top-apps-section">
                        <div className="comm-label" style={{ marginTop: '12px', marginBottom: '8px' }}>Top Active Sites</div>
                        {commissions[token.$id].topApps.map((app, idx) => {
                          // Find the URL for this app_id from the token's apps
                          const appUrl = token.apps?.find(a => a.app_id === app.appId)?.homepage || 
                                        token.apps?.find(a => a.app_id === app.appId)?.redirect_uri || 
                                        null;
                          if (!appUrl) return null;
                          return (
                            <div 
                              key={idx} 
                              className="top-app-item"
                            >
                              <a 
                                href={appUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="top-app-url"
                              >
                                {appUrl}
                              </a>
                              <svg className="top-app-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                <polyline points="15 3 21 3 21 9"/>
                                <line x1="10" y1="14" x2="21" y2="3"/>
                              </svg>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <button 
                    className="load-comm-btn"
                    onClick={() => loadCommission(token)}
                    disabled={loadingCommissions[token.$id]}
                  >
                    {loadingCommissions[token.$id] ? (
                      <>
                        <div className="spinner-small"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="20" x2="18" y2="10"/>
                          <line x1="12" y1="20" x2="12" y2="4"/>
                          <line x1="6" y1="20" x2="6" y2="14"/>
                        </svg>
                        Load Commission
                      </>
                    )}
                  </button>
                )}
              </div>

              <button 
                className="switch-btn"
                onClick={() => {
                  localStorage.setItem('deriv_token', token.token);
                  localStorage.setItem('deriv_loginid', token.loginId);
                  window.location.href = '/';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="17 1 21 5 17 9"/>
                  <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                  <polyline points="7 23 3 19 7 15"/>
                  <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                </svg>
                Switch to This Account
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
