export default function AppCard({ app, stats }) {
  const formatNumber = (num) => {
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const formatCount = (num) => {
    return num.toLocaleString('en-US');
  };

  const getDomainUrl = () => {
    const domain = app.homepage || app.redirect_uri;
    if (!domain) return null;
    
    // Add https:// if not present
    if (domain.startsWith('http://') || domain.startsWith('https://')) {
      return domain;
    }
    return `https://${domain}`;
  };

  const domainUrl = getDomainUrl();
  
  // App is active only if it has commission this month
  const isActive = stats.thisMonth > 0;
  
  // Calculate trend percentage
  const getTrend = () => {
    if (stats.lastMonth === 0) return null;
    const change = ((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100;
    return change.toFixed(1);
  };
  
  const trend = getTrend();
  const isPositive = trend && parseFloat(trend) > 0;
  const isNegative = trend && parseFloat(trend) < 0;
  
  // Progress bar color based on share percentage
  const getProgressColor = () => {
    const share = parseFloat(stats.sharePercent);
    if (share >= 50) return '#059669';
    if (share >= 25) return '#2ecc71';
    if (share >= 10) return '#f59e0b';
    return '#64748b';
  };

  return (
    <div className="all-app-card">
      <div className="all-app-card-header">
        <div className="all-app-id-section">
          <h3>#{app.app_id}</h3>
          <span className={`all-app-status-badge ${isActive ? 'active' : 'inactive'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="all-app-domain">
          {domainUrl ? (
            <a href={domainUrl} target="_blank" rel="noopener noreferrer" className="all-app-domain-link">
              {app.homepage || app.redirect_uri}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '4px', display: 'inline' }}>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          ) : (
            'No domain'
          )}
        </div>
      </div>

      <div className="all-app-stats">
        <div className="all-app-stat-item">
          <span className="all-app-stat-label">This Month</span>
          <span className={`all-app-stat-value ${isPositive ? 'positive' : ''} ${isNegative ? 'negative' : ''}`}>
            ${formatNumber(stats.thisMonth)}
            {trend && (
              <span className={`all-app-trend-badge ${isPositive ? 'up' : 'down'}`}>
                {isPositive ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
            )}
          </span>
        </div>
        <div className="all-app-stat-item">
          <span className="all-app-stat-label">Last Month</span>
          <span className="all-app-stat-value">${formatNumber(stats.lastMonth)}</span>
        </div>
        <div className="all-app-stat-item">
          <span className="all-app-stat-label">Transactions</span>
          <span className="all-app-stat-value">{formatCount(stats.transactions)}</span>
        </div>
        <div className="all-app-stat-item all-app-stat-share">
          <div className="all-app-stat-label-row">
            <span className="all-app-stat-label">Share of Total</span>
            <span className="all-app-stat-label-value">{stats.sharePercent}%</span>
          </div>
          <div className="all-app-progress-bar-container">
            <div 
              className="all-app-progress-bar-fill" 
              style={{ 
                width: `${Math.min(stats.sharePercent, 100)}%`,
                background: getProgressColor()
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
