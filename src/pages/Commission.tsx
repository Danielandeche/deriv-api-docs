import React, { useCallback, useEffect, useRef, useState } from 'react';
import moment from 'moment';
import Layout from '@theme/Layout';
import { Text, Heading } from '@deriv-com/quill-ui';
import CommissionCard from '@site/src/features/Commission/components/CommissionCard';
import CommissionChart from '@site/src/features/Commission/components/CommissionChart';
import { getCommission } from '@site/src/features/Commission/services/deriv';
import useAuthContext from '@site/src/hooks/useAuthContext';
import styles from './Commission.module.scss';

type TCommissionBreakdown = {
  app_id?: string;
  app_markup_usd?: number;
  transactions_count?: number;
};

type TCommissionTotals = {
  commission: number;
  transactions: number;
};

type TChartData = {
  label: string;
  value: number;
};

type TChartTab = 'monthly' | 'daily' | 'hourly';

type TChartRange = {
  label: string;
  from: string;
  to: string;
};

const DEFAULT_CHART_TITLE = 'Monthly Commission Distribution';
const DEFAULT_ERROR_MESSAGE =
  'Unable to load commission data right now. Please refresh the page or log in again.';

const formatDateTime = (date: moment.Moment) => date.format('YYYY-MM-DD HH:mm:ss');

const getChartTitle = (tab: TChartTab) => {
  if (tab === 'daily') return 'Daily Commission Distribution';
  if (tab === 'hourly') return 'Hourly Commission Distribution';
  return DEFAULT_CHART_TITLE;
};

const getChartRanges = (tab: TChartTab): TChartRange[] => {
  const now = moment();

  if (tab === 'daily') {
    const daysToShow = Math.min(now.daysInMonth(), 30);

    return Array.from({ length: daysToShow }, (_, index) => {
      const day = now.clone().date(index + 1);

      return {
        label: `Day ${index + 1}`,
        from: formatDateTime(day.clone().startOf('day')),
        to: formatDateTime(day.clone().endOf('day')),
      };
    });
  }

  if (tab === 'hourly') {
    return Array.from({ length: 24 }, (_, hour) => {
      const currentHour = now.clone().hour(hour).minute(0).second(0);

      return {
        label: `${hour.toString().padStart(2, '0')}:00`,
        from: formatDateTime(currentHour),
        to: formatDateTime(currentHour.clone().minute(59).second(59)),
      };
    });
  }

  const currentYear = now.year();

  return Array.from({ length: 12 }, (_, monthIndex) => {
    const month = now.clone().year(currentYear).month(monthIndex);

    return {
      label: month.format('MMM'),
      from: formatDateTime(month.clone().startOf('month')),
      to: formatDateTime(month.clone().endOf('month')),
    };
  });
};

const getCommissionErrorMessage = (error: unknown) => {
  const apiError = (error as { error?: { code?: string; message?: string } })?.error;

  if (apiError?.code === 'AuthorizationRequired') {
    return 'Your session needs to be reconnected. Please log in again to view commission details.';
  }

  return apiError?.message || (error instanceof Error && error.message) || DEFAULT_ERROR_MESSAGE;
};

const Commission = () => {
  const { is_logged_in, is_authorized } = useAuthContext();
  const chartRequestIdRef = useRef(0);
  const [isClientReady, setIsClientReady] = useState(false);

  const [today, setToday] = useState(0);
  const [todayTxns, setTodayTxns] = useState(0);
  const [thisMonth, setThisMonth] = useState(0);
  const [thisMonthTxns, setThisMonthTxns] = useState(0);
  const [lastMonth, setLastMonth] = useState(0);
  const [lastMonthTxns, setLastMonthTxns] = useState(0);

  const [chartData, setChartData] = useState<TChartData[]>([]);
  const [chartTitle, setChartTitle] = useState(DEFAULT_CHART_TITLE);
  const [activeTab, setActiveTab] = useState<TChartTab>('monthly');
  const [chartLoading, setChartLoading] = useState(false);
  const [cardsError, setCardsError] = useState<string | null>(null);
  const [chartError, setChartError] = useState<string | null>(null);

  const pageError = cardsError || chartError;
  const canLoadCommission = isClientReady && is_logged_in && is_authorized;

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  const getCommissionTotals = useCallback((breakdown: TCommissionBreakdown[] = []) => {
    return breakdown.reduce<TCommissionTotals>(
      (totals, app) => ({
        commission: totals.commission + (app.app_markup_usd || 0),
        transactions: totals.transactions + (app.transactions_count || 0),
      }),
      { commission: 0, transactions: 0 },
    );
  }, []);

  const loadCommissionTotals = useCallback(
    async (date_from: string, date_to: string) => {
      const response = await getCommission(date_from, date_to);
      const breakdown = response?.app_markup_statistics?.breakdown || [];

      return getCommissionTotals(breakdown);
    },
    [getCommissionTotals],
  );

  const resetCommissionState = useCallback(() => {
    setToday(0);
    setTodayTxns(0);
    setThisMonth(0);
    setThisMonthTxns(0);
    setLastMonth(0);
    setLastMonthTxns(0);
    setChartData([]);
    setChartTitle(DEFAULT_CHART_TITLE);
    setChartLoading(false);
    setCardsError(null);
    setChartError(null);
  }, []);

  const loadDefaultCards = useCallback(async () => {
    const now = moment();

    setCardsError(null);

    try {
      const [todayData, monthData, lastMonthData] = await Promise.all([
        loadCommissionTotals(
          formatDateTime(now.clone().startOf('day')),
          formatDateTime(now.clone().endOf('day')),
        ),
        loadCommissionTotals(
          formatDateTime(now.clone().startOf('month')),
          formatDateTime(now.clone().endOf('month')),
        ),
        loadCommissionTotals(
          formatDateTime(now.clone().subtract(1, 'month').startOf('month')),
          formatDateTime(now.clone().subtract(1, 'month').endOf('month')),
        ),
      ]);

      setToday(todayData.commission);
      setTodayTxns(todayData.transactions);
      setThisMonth(monthData.commission);
      setThisMonthTxns(monthData.transactions);
      setLastMonth(lastMonthData.commission);
      setLastMonthTxns(lastMonthData.transactions);
    } catch (error) {
      console.error('Error loading commission cards:', error);
      setCardsError(getCommissionErrorMessage(error));
    }
  }, [loadCommissionTotals]);

  const loadChart = useCallback(
    async (tab: TChartTab) => {
      const requestId = chartRequestIdRef.current + 1;
      const nextChartTitle = getChartTitle(tab);

      chartRequestIdRef.current = requestId;
      setChartLoading(true);
      setChartError(null);

      try {
        const ranges = getChartRanges(tab);
        const data = await Promise.all(
          ranges.map(async ({ label, from, to }) => {
            const periodData = await loadCommissionTotals(from, to);

            return {
              label,
              value: periodData.commission,
            };
          }),
        );

        if (chartRequestIdRef.current !== requestId) {
          return;
        }

        setChartData(data);
        setChartTitle(nextChartTitle);
      } catch (error) {
        if (chartRequestIdRef.current !== requestId) {
          return;
        }

        console.error(`Error loading ${tab} chart:`, error);
        setChartData([]);
        setChartTitle(nextChartTitle);
        setChartError(getCommissionErrorMessage(error));
      } finally {
        if (chartRequestIdRef.current === requestId) {
          setChartLoading(false);
        }
      }
    },
    [loadCommissionTotals],
  );

  useEffect(() => {
    if (!canLoadCommission) {
      chartRequestIdRef.current += 1;
      resetCommissionState();
      return;
    }

    loadDefaultCards();
  }, [canLoadCommission, loadDefaultCards, resetCommissionState]);

  useEffect(() => {
    if (!canLoadCommission) {
      return;
    }

    loadChart(activeTab);
  }, [activeTab, canLoadCommission, loadChart]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TChartTab);
  };

  if (!isClientReady) {
    return (
      <Layout>
        <div className={styles.commissionPage}>
          <div className={styles.header}>
            <Heading.H2>Commission</Heading.H2>
            <Text size='sm'>Track your commission earnings</Text>
          </div>
          <div className={styles.loginPrompt}>
            <Text as='p' size='lg' className={styles.loginText}>
              Loading commission details...
            </Text>
          </div>
        </div>
      </Layout>
    );
  }

  if (!is_logged_in) {
    return (
      <Layout>
        <div className={styles.commissionPage}>
          <div className={styles.header}>
            <Heading.H2>Commission</Heading.H2>
            <Text size='sm'>Track your commission earnings</Text>
          </div>
          <div className={styles.loginPrompt}>
            <Text as='p' size='lg' className={styles.loginText}>
              Please log in to view your commission details
            </Text>
          </div>
        </div>
      </Layout>
    );
  }

  if (!is_authorized) {
    return (
      <Layout>
        <div className={styles.commissionPage}>
          <div className={styles.header}>
            <Heading.H2>Commission</Heading.H2>
            <Text size='sm'>Track your commission earnings</Text>
          </div>
          <div className={styles.loginPrompt}>
            <Text as='p' size='lg' className={styles.loginText}>
              Connecting to your account to load commission details...
            </Text>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.commissionPage}>
        <div className={styles.header}>
          <Heading.H2>Commission</Heading.H2>
          <Text size='sm'>Track your commission earnings</Text>
        </div>

        {pageError && (
          <div className={styles.statusBanner} role='alert'>
            <Text as='p' size='sm'>
              {pageError}
            </Text>
          </div>
        )}

        <div className={styles.cardsGrid}>
          <CommissionCard
            title='This Month'
            value={thisMonth}
            icon='dollar'
            trend={lastMonth > 0 ? (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1) : null}
            transactions={thisMonthTxns}
          />
          <CommissionCard
            title="Today's Commission"
            value={today}
            icon='trending'
            transactions={todayTxns}
          />
          <CommissionCard
            title='Last Month'
            value={lastMonth}
            icon='calendar'
            transactions={lastMonthTxns}
          />
        </div>

        <CommissionChart
          title={chartTitle}
          data={chartData}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          loading={chartLoading}
        />
      </div>
    </Layout>
  );
};

export default Commission;
