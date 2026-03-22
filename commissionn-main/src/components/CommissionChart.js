import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function CommissionChart({ data, title, activeTab, onTabChange, loading }) {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#718096', marginBottom: '4px' }}>
            {payload[0].payload.label}
          </p>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#2ecc71' }}>
            ${payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-section">
      <div className="chart-header">
        <div className="chart-title">
          <span className="chart-title-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </span>
          {title}
        </div>
        
        <div className="chart-tabs">
          <button 
            className={`chart-tab ${activeTab === 'monthly' ? 'active' : ''}`}
            onClick={() => onTabChange('monthly')}
            disabled={loading}
          >
            Monthly
          </button>
          <button 
            className={`chart-tab ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => onTabChange('daily')}
            disabled={loading}
          >
            Daily
          </button>
          <button 
            className={`chart-tab ${activeTab === 'hourly' ? 'active' : ''}`}
            onClick={() => onTabChange('hourly')}
            disabled={loading}
          >
            Hourly
          </button>
        </div>
      </div>

      <div className="chart-container">
        {loading ? (
          <div style={{
            height: '350px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px'
          }}>
            <div className="loading-spinner"></div>
            <p style={{ color: '#718096', fontSize: '14px' }}>
              Loading {activeTab} commission data...
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="label" 
                stroke="#718096"
                style={{ fontSize: '13px' }}
              />
              <YAxis 
                stroke="#718096"
                style={{ fontSize: '13px' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(46, 204, 113, 0.1)' }} />
              <Bar 
                dataKey="value" 
                fill="#2ecc71"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
