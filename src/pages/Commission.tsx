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
  app_id?: string | number;
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

type TActiveApp = {
  app_id: string;
  commission: number;
  transactions: number;
};

const DEFAULT_CHART_TITLE = 'Monthly Commission Distribution';
const DEFAULT_ERROR_MESSAGE =
  'Unable to load commission data right now. Please refresh the page or log in again.';
const DEFAULT_CUSTOM_FROM = moment().startOf('month').format('YYYY-MM-DD');
const DEFAULT_CUSTOM_TO = moment().format('YYYY-MM-DD');

const formatDateTime = (date: moment.Moment) => date.format('YYYY-MM-DD HH:mm:ss');

const getChartTitle = (tab: TChartTab, appId?: string) => {
  const baseTitle =
    tab === 'daily'
      ? 'Daily Commission Distribution'
      : tab === 'hourly'
      ? 'Hourly Commission Distribution'
      : DEFAULT_CHART_TITLE;

  return appId ? `${baseTitle} for App #${appId}` : baseTitle;
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

  return Array.from({ length: 12 }, (_, monthIndex) => {
    const month = now.clone().month(monthIndex);

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

  const [customValue, setCustomValue] = useState<number | null>(null);
  const [customTxns, setCustomTxns] = useState(0);
  const [customFrom, setCustomFrom] = useState(DEFAULT_CUSTOM_FROM);
  const [customTo, setCustomTo] = useState(DEFAULT_CUSTOM_TO);
  const [customLoading, setCustomLoading] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  const [chartData, setChartData] = useState<TChartData[]>([]);
  const [chartTitle, setChartTitle] = useState(DEFAULT_CHART_TITLE);
  const [activeTab, setActiveTab] = useState<TChartTab>('monthly');
  const [chartLoading, setChartLoading] = useState(false);
  const [cardsError, setCardsError] = useState<string | null>(null);
  const [chartError, setChartError] = useState<string | null>(null);
  const [activeApps, setActiveApps] = useState<TActiveApp[]>([]);
  const [selectedAppId, setSelectedAppId] = useState('');

  const pageError = cardsError || chartError;
  const canLoadCommission = isClientReady && is_logged_in && is_authorized;
  const selectedAppLabel = selectedAppId ? `App #${selectedAppId}` : 'All active apps';
  const selectedAppSummary = activeApps.find((app) => app.app_id === selectedAppId) || null;

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  const getCommissionTotals = useCallback(
    (breakdown: TCommissionBreakdown[] = [], appId?: string) => {
      if (appId) {
        const appMatch = breakdown.find((item) => String(item.app_id) === String(appId));

        return {
          commission: appMatch?.app_markup_usd || 0,
          transactions: appMatch?.transactions_count || 0,
        };
      }

      return breakdown.reduce<TCommissionTotals>(
        (totals, item) => ({
          commission: totals.commission + (item.app_markup_usd || 0),
          transactions: totals.transactions + (item.transactions_count || 0),
        }),
        { commission: 0, transactions: 0 },
      );
    },
    [],
  );

  const getActiveAppsFromBreakdown = useCallback((breakdown: TCommissionBreakdown[] = []) => {
    return breakdown
      .filter((item) => item.app_id && (item.app_markup_usd || 0) > 0)
      .map((item) => ({
        app_id: String(item.app_id),
        commission: item.app_markup_usd || 0,
        transactions: item.transactions_count || 0,
      }))
      .sort((first, second) => second.commission - first.commission);
  }, []);

  const clearCustomResult = useCallback(() => {
    setCustomValue(null);
    setCustomTxns(0);
    setCustomError(null);
    setCustomLoading(false);
  }, []);

  const loadCommissionTotals = useCallback(
    async (date_from: string, date_to: string, appId?: string) => {
      const response = await getCommission(date_from, date_to);
      const breakdown = response?.app_markup_statistics?.breakdown || [];

      return getCommissionTotals(breakdown, appId);
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
    setActiveApps([]);
    setSelectedAppId('');
    clearCustomResult();
    setCustomFrom(DEFAULT_CUSTOM_FROM);
    setCustomTo(DEFAULT_CUSTOM_TO);
  }, [clearCustomResult]);

  const loadDefaultCards = useCallback(async () => {
    const now = moment();

    setCardsError(null);

    try {
      const [todayRes, monthRes, lastMonthRes] = await Promise.all([
        getCommission(
          formatDateTime(now.clone().startOf('day')),
          formatDateTime(now.clone().endOf('day')),
        ),
        getCommission(
          formatDateTime(now.clone().startOf('month')),
          formatDateTime(now.clone().endOf('month')),
        ),
        getCommission(
          formatDateTime(now.clone().subtract(1, 'month').startOf('month')),
          formatDateTime(now.clone().subtract(1, 'month').endOf('month')),
        ),
      ]);

      const todayBreakdown = todayRes?.app_markup_statistics?.breakdown || [];
      const monthBreakdown = monthRes?.app_markup_statistics?.breakdown || [];
      const lastMonthBreakdown = lastMonthRes?.app_markup_statistics?.breakdown || [];
      const monthActiveApps = getActiveAppsFromBreakdown(monthBreakdown);

      setActiveApps(monthActiveApps);
      setToday(getCommissionTotals(todayBreakdown, selectedAppId || undefined).commission);
      setTodayTxns(getCommissionTotals(todayBreakdown, selectedAppId || undefined).transactions);
      setThisMonth(getCommissionTotals(monthBreakdown, selectedAppId || undefined).commission);
      setThisMonthTxns(
        getCommissionTotals(monthBreakdown, selectedAppId || undefined).transactions,
      );
      setLastMonth(getCommissionTotals(lastMonthBreakdown, selectedAppId || undefined).commission);
      setLastMonthTxns(
        getCommissionTotals(lastMonthBreakdown, selectedAppId || undefined).transactions,
      );
    } catch (error) {
      console.error('Error loading commission cards:', error);
      setCardsError(getCommissionErrorMessage(error));
    }
  }, [getActiveAppsFromBreakdown, getCommissionTotals, selectedAppId]);

  const loadChart = useCallback(
    async (tab: TChartTab) => {
      const requestId = chartRequestIdRef.current + 1;
      const nextChartTitle = getChartTitle(tab, selectedAppId || undefined);

      chartRequestIdRef.current = requestId;
      setChartLoading(true);
      setChartError(null);

      try {
        const ranges = getChartRanges(tab);
        const data = await Promise.all(
          ranges.map(async ({ label, from, to }) => {
            const periodData = await loadCommissionTotals(from, to, selectedAppId || undefined);

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
    [loadCommissionTotals, selectedAppId],
  );

  const loadCustomRange = useCallback(async () => {
    if (!customFrom || !customTo) {
      setCustomError('Select both a start date and an end date.');
      return;
    }

    const fromDate = moment(customFrom);
    const toDate = moment(customTo);

    if (fromDate.isAfter(toDate)) {
      setCustomError('Start date must be before end date.');
      return;
    }

    setCustomLoading(true);
    setCustomError(null);

    try {
      const response = await getCommission(
        formatDateTime(fromDate.clone().startOf('day')),
        formatDateTime(toDate.clone().endOf('day')),
      );
      const breakdown = response?.app_markup_statistics?.breakdown || [];
      const customData = getCommissionTotals(breakdown, selectedAppId || undefined);

      setCustomValue(customData.commission);
      setCustomTxns(customData.transactions);
    } catch (error) {
      console.error('Error loading custom commission:', error);
      setCustomError(getCommissionErrorMessage(error));
    } finally {
      setCustomLoading(false);
    }
  }, [customFrom, customTo, getCommissionTotals, selectedAppId]);

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

  useEffect(() => {
    if (selectedAppId && !activeApps.some((app) => app.app_id === selectedAppId)) {
      setSelectedAppId('');
    }
  }, [activeApps, selectedAppId]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TChartTab);
  };

  const handleAppChange = (nextAppId: string) => {
    clearCustomResult();
    setSelectedAppId(nextAppId);
  };

  const handleCustomFromChange = (value: string) => {
    clearCustomResult();
    setCustomFrom(value);
  };

  const handleCustomToChange = (value: string) => {
    clearCustomResult();
    setCustomTo(value);
  };

  const handleCustomReset = () => {
    clearCustomResult();
    setCustomFrom(DEFAULT_CUSTOM_FROM);
    setCustomTo(DEFAULT_CUSTOM_TO);
  };

  if (!isClientReady) {
    return (
      <Layout>
        <div className={styles.commissionPage}>
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
          <div className={styles.hero}>
            <div className={styles.heroBody}>
              <span className={styles.heroBadge}>Commission Hub</span>
              <Heading.H2>Commission</Heading.H2>
              <Text size='sm'>Track your commission earnings across every registered app.</Text>
            </div>
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
          <div className={styles.hero}>
            <div className={styles.heroBody}>
              <span className={styles.heroBadge}>Commission Hub</span>
              <Heading.H2>Commission</Heading.H2>
              <Text size='sm'>Track your commission earnings across every registered app.</Text>
            </div>
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
        <div className={styles.hero}>
          <div className={styles.heroBody}>
            <span className={styles.heroBadge}>Commission Hub</span>
            <Heading.H2>Commission</Heading.H2>
            <Text size='sm'>
              Track earnings across your active apps, focus on a single APP_ID, and inspect any
              custom period without leaving the page.
            </Text>
          </div>

          <div className={styles.heroMetrics}>
            <div className={styles.heroMetric}>
              <span className={styles.heroMetricLabel}>Current view</span>
              <strong className={styles.heroMetricValue}>{selectedAppLabel}</strong>
            </div>
            <div className={styles.heroMetric}>
              <span className={styles.heroMetricLabel}>Active apps</span>
              <strong className={styles.heroMetricValue}>{activeApps.length}</strong>
            </div>
            <div className={styles.heroMetric}>
              <span className={styles.heroMetricLabel}>Top app this month</span>
              <strong className={styles.heroMetricValue}>
                {activeApps[0] ? `#${activeApps[0].app_id}` : 'No data'}
              </strong>
            </div>
          </div>
        </div>

        {pageError && (
          <div className={styles.statusBanner} role='alert'>
            <Text as='p' size='sm'>
              {pageError}
            </Text>
          </div>
        )}

        <div className={styles.controlGrid}>
          <section className={styles.controlCard}>
            <div className={styles.controlHeader}>
              <div>
                <h3>App focus</h3>
                <p>Switch between all active apps and a single APP_ID.</p>
              </div>
              {selectedAppSummary && (
                <span className={styles.metricPill}>
                  ${selectedAppSummary.commission.toFixed(2)} this month
                </span>
              )}
            </div>

            <label className={styles.fieldLabel} htmlFor='commission-app-select'>
              Active APP_ID
            </label>
            <div className={styles.selectWrap}>
              <select
                id='commission-app-select'
                className={styles.selectInput}
                value={selectedAppId}
                onChange={(event) => handleAppChange(event.target.value)}
              >
                <option value=''>All active apps</option>
                {activeApps.map((app) => (
                  <option key={app.app_id} value={app.app_id}>
                    App #{app.app_id} · ${app.commission.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            {activeApps.length > 0 ? (
              <div className={styles.quickFilters}>
                <span className={styles.quickFiltersLabel}>Quick pick</span>
                <div className={styles.filterChips}>
                  <button
                    type='button'
                    className={`${styles.filterChip} ${
                      selectedAppId === '' ? styles.activeChip : ''
                    }`}
                    onClick={() => handleAppChange('')}
                  >
                    All apps
                  </button>
                  {activeApps.slice(0, 5).map((app) => (
                    <button
                      key={app.app_id}
                      type='button'
                      className={`${styles.filterChip} ${
                        selectedAppId === app.app_id ? styles.activeChip : ''
                      }`}
                      onClick={() => handleAppChange(app.app_id)}
                    >
                      #{app.app_id}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className={styles.helperText}>
                Active apps will appear here once commission data loads.
              </p>
            )}
          </section>

          <section className={styles.controlCard}>
            <div className={styles.controlHeader}>
              <div>
                <h3>Custom range</h3>
                <p>Run a focused commission check for any date span.</p>
              </div>
              {customLoading && <span className={styles.metricPill}>Checking…</span>}
            </div>

            <div className={styles.dateGrid}>
              <label className={styles.fieldLabel}>
                From
                <input
                  type='date'
                  className={styles.dateInput}
                  value={customFrom}
                  max={customTo || undefined}
                  onChange={(event) => handleCustomFromChange(event.target.value)}
                />
              </label>
              <label className={styles.fieldLabel}>
                To
                <input
                  type='date'
                  className={styles.dateInput}
                  value={customTo}
                  min={customFrom || undefined}
                  max={moment().format('YYYY-MM-DD')}
                  onChange={(event) => handleCustomToChange(event.target.value)}
                />
              </label>
            </div>

            <div className={styles.actionRow}>
              <button
                type='button'
                className={styles.primaryAction}
                disabled={customLoading || !customFrom || !customTo}
                onClick={loadCustomRange}
              >
                Check commission
              </button>
              <button type='button' className={styles.secondaryAction} onClick={handleCustomReset}>
                Clear
              </button>
            </div>

            {customError && (
              <p className={styles.inlineError} role='alert'>
                {customError}
              </p>
            )}
          </section>
        </div>

        <div className={styles.cardsGrid}>
          <CommissionCard
            title='This Month'
            value={thisMonth}
            icon='dollar'
            trend={lastMonth > 0 ? (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1) : null}
            transactions={thisMonthTxns}
            caption={selectedAppLabel}
          />
          <CommissionCard
            title="Today's Commission"
            value={today}
            icon='trending'
            transactions={todayTxns}
            caption='Today so far'
          />
          <CommissionCard
            title='Last Month'
            value={lastMonth}
            icon='calendar'
            transactions={lastMonthTxns}
            caption={selectedAppId ? `App #${selectedAppId}` : 'Previous month'}
          />
          {customValue !== null && (
            <CommissionCard
              title='Custom Range'
              value={customValue}
              icon='dollar'
              transactions={customTxns}
              caption={`${moment(customFrom).format('DD MMM')} to ${moment(customTo).format(
                'DD MMM',
              )}`}
            />
          )}
        </div>

        <CommissionChart
          title={chartTitle}
          data={chartData}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          loading={chartLoading}
          contextLabel={selectedAppLabel}
        />
      </div>
    </Layout>
  );
};

export default Commission;
