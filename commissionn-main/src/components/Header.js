import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';

export default function Header({ onLogout, onDateRangeChange, activeApps, selectedAppId, onAppSelect }) {
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(7, 'days').toDate(),
    dayjs().toDate()
  ]);
  const [startDate, endDate] = dateRange;
  const [showCalendar, setShowCalendar] = useState(false);
  const [showAppFilter, setShowAppFilter] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [theme, setTheme] = useState('system');

  const formatDateRange = () => {
    if (startDate && endDate) {
      return `${dayjs(startDate).format('MMM DD')} - ${dayjs(endDate).format('MMM DD, YYYY')}`;
    }
    return 'Select date range';
  };

  useEffect(() => {
    // Apply theme
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.className = prefersDark ? 'dark' : 'light';
    } else {
      document.body.className = theme;
    }
  }, [theme]);

  const handleCheck = () => {
    if (startDate && endDate && onDateRangeChange) {
      const fromFormatted = dayjs(startDate).startOf('day').format('YYYY-MM-DD HH:mm:ss');
      const toFormatted = dayjs(endDate).endOf('day').format('YYYY-MM-DD HH:mm:ss');
      onDateRangeChange(fromFormatted, toFormatted);
      setShowCalendar(false); // Close calendar after checking
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setShowThemeMenu(false);
  };

  return (
    <div className="dashboard-header">
      {/* Header Top: Title + All buttons (for desktop) or Theme/Logout (for mobile) */}
      <div className="header-top">
        <div className="header-title">
          <h1>Dashboard</h1>
          <p className="subtitle">
            developed by{' '}
            <a 
              href="https://tradershub.site" 
              target="_blank" 
              rel="noopener noreferrer"
              className="binarytool-link"
            >
              BINARYTOOL
            </a>
          </p>
        </div>
        
        <div className="header-actions-top">
          {/* Date Picker - Desktop only */}
          <div className="date-range-picker-inline desktop-only">
            <button 
              className="date-picker-btn" 
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {formatDateRange()}
            </button>

            {showCalendar && (
              <div className="calendar-dropdown">
                <DatePicker
                  selectsRange={true}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => {
                    setDateRange(update);
                  }}
                  monthsShown={2}
                  inline
                  calendarClassName="custom-calendar"
                />
              </div>
            )}
          </div>

          {/* Check Button - Desktop only */}
          <button className="btn-check desktop-only" onClick={handleCheck}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Check
          </button>

          {/* Filter Button - Desktop only */}
          <div className="filter-dropdown-container desktop-only">
            <button 
              className="btn-filters" 
              onClick={() => setShowAppFilter(!showAppFilter)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              {selectedAppId ? `App #${selectedAppId}` : 'Filters'}
            </button>

            {showAppFilter && (
              <div className="filter-dropdown">
                <div className="filter-dropdown-header">
                  <span>Filter by App</span>
                  <button 
                    className="btn-close-filter" 
                    onClick={() => setShowAppFilter(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="filter-dropdown-content">
                  <button
                    className={`filter-option ${!selectedAppId ? 'active' : ''}`}
                    onClick={() => {
                      onAppSelect && onAppSelect(null);
                      setShowAppFilter(false);
                    }}
                  >
                    <span>All Apps</span>
                    <span className="filter-badge">Show All</span>
                  </button>
                  {activeApps && activeApps.map(app => (
                    <button
                      key={app.app_id}
                      className={`filter-option ${selectedAppId === app.app_id ? 'active' : ''}`}
                      onClick={() => {
                        onAppSelect && onAppSelect(app.app_id);
                        setShowAppFilter(false);
                      }}
                    >
                      <span>#{app.app_id}</span>
                      <span className="filter-badge">${app.commission.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Theme Button - Always shown */}
          <div className="theme-dropdown-container">
            <button 
              className="btn-theme" 
              onClick={() => setShowThemeMenu(!showThemeMenu)}
            >
              {theme === 'light' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : theme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              )}
            </button>

            {showThemeMenu && (
              <div className="theme-dropdown">
                <button
                  className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('light')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                  <span>Light</span>
                </button>
                <button
                  className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('dark')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                  <span>Dark</span>
                </button>
                <button
                  className={`theme-option ${theme === 'system' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('system')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                  <span>System</span>
                </button>
              </div>
            )}
          </div>

          {/* Logout Button - Always shown */}
          <button className="btn-logout" onClick={onLogout}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span className="logout-text">Logout</span>
            </button>
        </div>
      </div>

      {/* Header Controls: Date + Check + Filter - Only shown on mobile as second row */}
      <div className="header-controls mobile-only">
        {/* Date Picker */}
        <div className="date-range-picker-inline">
          <button 
            className="date-picker-btn" 
            onClick={() => setShowCalendar(!showCalendar)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {formatDateRange()}
          </button>

          {showCalendar && (
            <div className="calendar-dropdown">
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => {
                  setDateRange(update);
                }}
                monthsShown={2}
                inline
                calendarClassName="custom-calendar"
              />
            </div>
          )}
        </div>

        {/* Check Button */}
        <button className="btn-check" onClick={handleCheck}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Check
        </button>

        {/* Filter Button */}
        <div className="filter-dropdown-container">
          <button 
            className="btn-filters" 
            onClick={() => setShowAppFilter(!showAppFilter)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            {selectedAppId ? `App #${selectedAppId}` : 'Filters'}
          </button>

          {showAppFilter && (
            <div className="filter-dropdown">
              <div className="filter-dropdown-header">
                <span>Filter by App</span>
                <button 
                  className="btn-close-filter" 
                  onClick={() => setShowAppFilter(false)}
                >
                  ×
                </button>
              </div>
              <div className="filter-dropdown-content">
                <button
                  className={`filter-option ${!selectedAppId ? 'active' : ''}`}
                  onClick={() => {
                    onAppSelect && onAppSelect(null);
                    setShowAppFilter(false);
                  }}
                >
                  <span>All Apps</span>
                  <span className="filter-badge">Show All</span>
                </button>
                {activeApps && activeApps.map(app => (
                  <button
                    key={app.app_id}
                    className={`filter-option ${selectedAppId === app.app_id ? 'active' : ''}`}
                    onClick={() => {
                      onAppSelect && onAppSelect(app.app_id);
                      setShowAppFilter(false);
                    }}
                  >
                    <span>#{app.app_id}</span>
                    <span className="filter-badge">${app.commission.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
