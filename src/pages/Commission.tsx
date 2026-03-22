import React, { useEffect, useState, useCallback } from 'react';
import moment from 'moment';
import Layout from '@theme/Layout';
import { getCommission } from '@site/src/features/Commission/services/deriv';
import CommissionCard from '@site/src/features/Commission/components/CommissionCard';
import CommissionChart from '@site/src/features/Commission/components/CommissionChart';
import useAuthContext from '@site/src/hooks/useAuthContext';
import { Text, Heading } from '@deriv-com/quill-ui';
import styles from './Commission.module.scss';
const Commission = () => {
  const { currentLoginAccount } = useAuthContext();

  const [today, setToday] = useState(0);
  const [todayTxns, setTodayTxns] = useState(0);
  const [thisMonth, setThisMonth] = useState(0);
  const [thisMonthTxns, setThisMonthTxns] = useState(0);
  const [lastMonth, setLastMonth] = useState(0);
  const [lastMonthTxns, setLastMonthTxns] = useState(0);

  const [chartData, setChartData] = useState<{ label: string; value: number }[]>([]);
  const [chartTitle, setChartTitle] = useState('Monthly Commission Distribution');
  const [activeTab, setActiveTab] = useState('monthly');
  const [chartLoading, setChartLoading] = useState(false);

  const getAppData = (
    breakdown: { app_markup_usd?: number; transactions_count?: number; app_id?: string }[],
    appId?: string,
  ) => {
    if (!appId) {
      return breakdown.reduce(
        (acc, app) => ({
          commission: acc.commission + (app.app_markup_usd || 0),
          transactions: acc.transactions + (app.transactions_count || 0),
        }),
        { commission: 0, transactions: 0 },
      );
    }
    const appData = breakdown.find((app) => String(app.app_id) === appId);
    return {
      commission: appData?.app_markup_usd || 0,
      transactions: appData?.transactions_count || 0,
    };
  };

  const loadDefaultCards = useCallback(async () => {
    try {
      const todayFrom = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
      const todayTo = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
      const todayRes = await getCommission(todayFrom, todayTo);
      const todayBreakdown = todayRes?.app_markup_statistics?.breakdown || [];
      const todayData = getAppData(todayBreakdown, currentLoginAccount.name);
      setToday(todayData.commission);
      setTodayTxns(todayData.transactions);

      const monthFrom = moment().startOf('month').format('YYYY-MM-DD HH:mm:ss');
      const monthTo = moment().endOf('month').format('YYYY-MM-DD HH:mm:ss');
      const monthRes = await getCommission(monthFrom, monthTo);
      const monthBreakdown = monthRes?.app_markup_statistics?.breakdown || [];
      const monthData = getAppData(monthBreakdown, currentLoginAccount.name);
      setThisMonth(monthData.commission);
      setThisMonthTxns(monthData.transactions);

      const lastFrom = moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD HH:mm:ss');
      const lastTo = moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD HH:mm:ss');
      const lastRes = await getCommission(lastFrom, lastTo);
      const lastBreakdown = lastRes?.app_markup_statistics?.breakdown || [];
      const lastData = getAppData(lastBreakdown, currentLoginAccount.name);
      setLastMonth(lastData.commission);
      setLastMonthTxns(lastData.transactions);
    } catch (error) {
      console.error('Error loading commission cards:', error);
    }
  }, [currentLoginAccount.name]);

  const loadMonthlyChart = useCallback(async () => {
    setChartLoading(true);
    try {
      const data: { label: string; value: number }[] = [];
      const currentYear = moment().year();

      for (let i = 0; i < 12; i++) {
        const from = moment()
          .year(currentYear)
          .month(i)
          .startOf('month')
          .format('YYYY-MM-DD HH:mm:ss');
        const to = moment().year(currentYear).month(i).endOf('month').format('YYYY-MM-DD HH:mm:ss');
        const res = await getCommission(from, to);
        const breakdown = res?.app_markup_statistics?.breakdown || [];
        const monthData = getAppData(breakdown, currentLoginAccount.name);

        data.push({
          label: moment().month(i).format('MMM'),
          value: monthData.commission,
        });
      }

      setChartData(data);
      setChartTitle('Monthly Commission Distribution');
    } catch (error) {
      console.error('Error loading monthly chart:', error);
    } finally {
      setChartLoading(false);
    }
  }, [currentLoginAccount.name]);

  const loadDailyChart = useCallback(async () => {
    setChartLoading(true);
    try {
      const data: { label: string; value: number }[] = [];
      const daysInMonth = moment().daysInMonth();

      for (let i = 1; i <= Math.min(daysInMonth, 30); i++) {
        const from = moment().date(i).startOf('day').format('YYYY-MM-DD HH:mm:ss');
        const to = moment().date(i).endOf('day').format('YYYY-MM-DD HH:mm:ss');
        const res = await getCommission(from, to);
        const breakdown = res?.app_markup_statistics?.breakdown || [];
        const dayData = getAppData(breakdown, currentLoginAccount.name);

        data.push({
          label: `Day ${i}`,
          value: dayData.commission,
        });
      }

      setChartData(data);
      setChartTitle('Daily Commission Distribution');
    } catch (error) {
      console.error('Error loading daily chart:', error);
    } finally {
      setChartLoading(false);
    }
  }, [currentLoginAccount.name]);

  const loadHourlyChart = useCallback(async () => {
    setChartLoading(true);
    try {
      const data: { label: string; value: number }[] = [];
      const today = moment();

      for (let i = 0; i < 24; i++) {
        const from = today.clone().hour(i).minute(0).second(0).format('YYYY-MM-DD HH:mm:ss');
        const to = today.clone().hour(i).minute(59).second(59).format('YYYY-MM-DD HH:mm:ss');
        const res = await getCommission(from, to);
        const breakdown = res?.app_markup_statistics?.breakdown || [];
        const hourData = getAppData(breakdown, currentLoginAccount.name);

        data.push({
          label: `${i}:00`,
          value: hourData.commission,
        });
      }

      setChartData(data);
      setChartTitle('Hourly Commission Distribution');
    } catch (error) {
      console.error('Error loading hourly chart:', error);
    } finally {
      setChartLoading(false);
    }
  }, [currentLoginAccount.name]);

  useEffect(() => {
    loadDefaultCards();
    loadMonthlyChart();
  }, [loadDefaultCards, loadMonthlyChart]);

  useEffect(() => {
    if (activeTab === 'monthly') {
      loadMonthlyChart();
    } else if (activeTab === 'daily') {
      loadDailyChart();
    } else if (activeTab === 'hourly') {
      loadHourlyChart();
    }
  }, [activeTab, loadMonthlyChart, loadDailyChart, loadHourlyChart]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <Layout>
      <div className={styles.commissionPage}>
        <div className={styles.header}>
          <Heading.H2>Commission</Heading.H2>
          <Text size='sm'>Track your commission earnings</Text>
        </div>

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
