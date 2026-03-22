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
};

const CommissionChart: React.FC<CommissionChartProps> = ({
  data,
  title,
  activeTab,
  onTabChange,
  loading,
}) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={styles.chartSection}>
      <div className={styles.chartHeader}>
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

        <div className={styles.chartTabs}>
          <button
            className={`${styles.chartTab} ${activeTab === 'monthly' ? styles.active : ''}`}
            onClick={() => onTabChange('monthly')}
            disabled={loading}
          >
            Monthly
          </button>
          <button
            className={`${styles.chartTab} ${activeTab === 'daily' ? styles.active : ''}`}
            onClick={() => onTabChange('daily')}
            disabled={loading}
          >
            Daily
          </button>
          <button
            className={`${styles.chartTab} ${activeTab === 'hourly' ? styles.active : ''}`}
            onClick={() => onTabChange('hourly')}
            disabled={loading}
          >
            Hourly
          </button>
        </div>
      </div>

      <div className={styles.chartContainer}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <Text size='sm'>Loading {activeTab} commission data...</Text>
          </div>
        ) : (
          <div className={styles.barChart}>
            {data.map((item, index) => (
              <div key={index} className={styles.barItem}>
                <div className={styles.barWrapper}>
                  <div
                    className={styles.bar}
                    style={{ height: `${(item.value / maxValue) * 100}%` }}
                    title={`$${item.value.toFixed(2)}`}
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
