import React from 'react';
import styles from './CommissionCard.module.scss';

type CommissionCardProps = {
  title: string;
  value: number;
  icon?: 'dollar' | 'trending' | 'calendar';
  trend?: string | null;
  transactions?: number;
  caption?: string;
};

const getToneClass = (icon: CommissionCardProps['icon']) => {
  if (icon === 'trending') return styles.cardTrending;
  if (icon === 'calendar') return styles.cardCalendar;
  return styles.cardDollar;
};

const CommissionCard: React.FC<CommissionCardProps> = ({
  title,
  value,
  icon = 'dollar',
  trend,
  transactions,
  caption,
}) => {
  const trendValue = trend ? parseFloat(trend) : null;
  const hasTrend = trendValue !== null && !Number.isNaN(trendValue);
  const isTrendDown = hasTrend && trendValue < 0;

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getIcon = () => {
    switch (icon) {
      case 'dollar':
        return (
          <svg
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
          >
            <line x1='12' y1='1' x2='12' y2='23' />
            <path d='M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
          </svg>
        );
      case 'trending':
        return (
          <svg
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
          >
            <polyline points='23 6 13.5 15.5 8.5 10.5 1 18' />
            <polyline points='17 6 23 6 23 12' />
          </svg>
        );
      case 'calendar':
        return (
          <svg
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
          >
            <rect x='3' y='4' width='18' height='18' rx='2' ry='2' />
            <line x1='16' y1='2' x2='16' y2='6' />
            <line x1='8' y1='2' x2='8' y2='6' />
            <line x1='3' y1='10' x2='21' y2='10' />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${styles.commissionCard} ${getToneClass(icon)}`}>
      <div className={styles.cardGlow} />

      <div className={styles.cardHeader}>
        <div>
          <span className={styles.cardTitle}>{title}</span>
          {caption && <p className={styles.cardCaption}>{caption}</p>}
        </div>
        <div className={styles.cardIcon}>{getIcon()}</div>
      </div>

      <div className={styles.cardValue}>${formatNumber(value)}</div>

      <div className={styles.cardMeta}>
        <span className={styles.metricChip}>USD commission</span>
        {typeof transactions === 'number' && (
          <span className={styles.metricChip}>Transactions: {transactions.toLocaleString()}</span>
        )}
        {hasTrend && (
          <span
            className={`${styles.metricChip} ${styles.trend} ${
              isTrendDown ? styles.down : styles.up
            }`}
          >
            {isTrendDown ? 'Down' : 'Up'} {Math.abs(trendValue).toFixed(1)}% vs last month
          </span>
        )}
      </div>
    </div>
  );
};

export default CommissionCard;
