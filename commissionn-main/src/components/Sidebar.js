import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';

export default function Sidebar({ onCheck, onClose }) {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const handleCheck = () => {
    if (startDate && endDate) {
      // Convert to Deriv API format
      const fromFormatted = dayjs(startDate).startOf('day').format('YYYY-MM-DD HH:mm:ss');
      const toFormatted = dayjs(endDate).endOf('day').format('YYYY-MM-DD HH:mm:ss');
      onCheck(fromFormatted, toFormatted);
      onClose();
    }
  };

  return (
    <div className="sidebar-overlay" onClick={onClose}>
      <div className="sidebar-panel-calendar" onClick={e => e.stopPropagation()}>
        <div className="sidebar-header">
          <h3>Select Date Range</h3>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="date-range-buttons">
          <div className="date-button">
            <label>From</label>
            <div className="date-value">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>{startDate ? dayjs(startDate).format('MMM DD, YYYY') : 'Select start date'}</span>
            </div>
          </div>

          <div className="date-separator">→</div>

          <div className="date-button">
            <label>To</label>
            <div className="date-value">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>{endDate ? dayjs(endDate).format('MMM DD, YYYY') : 'Select end date'}</span>
            </div>
          </div>
        </div>

        <div className="calendar-container-horizontal">
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

        <div className="sidebar-actions-horizontal">
          <button 
            className="btn-check-calendar" 
            onClick={handleCheck}
            disabled={!startDate || !endDate}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            Check
          </button>
        </div>
      </div>
    </div>
  );
}
