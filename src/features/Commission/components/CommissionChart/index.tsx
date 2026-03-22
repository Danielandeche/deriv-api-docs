import React from 'react';
import { Text } from '@deriv-com/quill-ui';
import styles from './CommissionChart.module.scss';

type ChartData = {
  label: string;
  value: number;
};

type CommissionChartProps = {
  data: ChartData[];
  title: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  loading: boolean;
  contextLabel?: string;
};

const CommissionChart: React.FC<CommissionChartProps> = ({
  data,
  title,
  activeTab,
  onTabChange,
  loading,
  contextLabel,
}) => {
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const hasData = data.length > 0;
  const visibleTotal = data.reduce((sum, item) => sum + item.value, 0);
  const averageValue = hasData ? visibleTotal / data.length : 0;
  const highestPoint = hasData
    ? data.reduce(
        (highest, current) => (current.value > highest.value ? current : highest),
        data[0],
      )
    : null;

  return (
    <div className={styles.chartSection}>
      <div className={styles.chartHeader}>
        <div className={styles.chartHeading}>
          <div className={styles.chartTitle}>
            <span className={styles.chartTitleIcon}>
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <line x1='18' y1='20' x2='18' y2='10' />
                <line x1='12' y1='20' x2='12' y2='4' />
                <line x1='6' y1='20' x2='6' y2='14' />
              </svg>
            </span>
            {title}
          </div>
          {contextLabel && <span className={styles.contextPill}>{contextLabel}</span>}
        </div>

        <div className={styles.chartTabs}>
          <button
            type='button'
            className={`${styles.chartTab} ${activeTab === 'monthly' ? styles.active : ''}`}
            onClick={() => onTabChange('monthly')}
            disabled={loading}
          >
            Monthly
          </button>
          <button
            type='button'
            className={`${styles.chartTab} ${activeTab === 'daily' ? styles.active : ''}`}
            onClick={() => onTabChange('daily')}
            disabled={loading}
          >
            Daily
          </button>
          <button
            type='button'
            className={`${styles.chartTab} ${activeTab === 'hourly' ? styles.active : ''}`}
            onClick={() => onTabChange('hourly')}
            disabled={loading}
          >
            Hourly
          </button>
        </div>
      </div>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <span>Visible total</span>
          <strong>${visibleTotal.toFixed(2)}</strong>
        </div>
        <div className={styles.summaryCard}>
          <span>Average</span>
          <strong>${averageValue.toFixed(2)}</strong>
        </div>
        <div className={styles.summaryCard}>
          <span>Peak period</span>
          <strong>
            {highestPoint ? `${highestPoint.label} · $${highestPoint.value.toFixed(2)}` : 'No data'}
          </strong>
        </div>
      </div>

      <div className={styles.chartContainer}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <Text size='sm'>Loading {activeTab} commission data...</Text>
          </div>
        ) : !hasData ? (
          <div className={styles.loadingContainer}>
            <Text size='sm'>No commission data available for this period.</Text>
          </div>
        ) : (
          <div className={styles.barChart}>
            {data.map((item, index) => (
              <div key={item.label || index} className={styles.barItem}>
                <div className={styles.barValue}>${item.value.toFixed(2)}</div>
                <div className={styles.barWrapper}>
                  <div
                    className={styles.bar}
                    style={{ height: `${(item.value / maxValue) * 100}%` }}
                    title={`${item.label}: $${item.value.toFixed(2)}`}
                    aria-label={`${item.label}: $${item.value.toFixed(2)}`}
                  ></div>
                </div>
                <div className={styles.barLabel}>{item.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommissionChart;
