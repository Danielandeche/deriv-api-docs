import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Commission from '../Commission';
import useAuthContext from '@site/src/hooks/useAuthContext';
import { getCommission } from '@site/src/features/Commission/services/deriv';

jest.mock('@theme/Layout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@site/src/hooks/useAuthContext');
jest.mock('@site/src/features/Commission/services/deriv');

jest.mock('@deriv-com/quill-ui', () => ({
  Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  Heading: {
    H2: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  },
}));

jest.mock('@site/src/features/Commission/components/CommissionCard', () => ({
  __esModule: true,
  default: ({
    title,
    value,
    transactions,
    trend,
  }: {
    title: string;
    value: number;
    transactions?: number;
    trend?: string | null;
  }) => (
    <div data-testid={`card-${title}`}>
      {title}|{value}|{transactions ?? 'no-transactions'}|{trend ?? 'no-trend'}
    </div>
  ),
}));

jest.mock('@site/src/features/Commission/components/CommissionChart', () => ({
  __esModule: true,
  default: ({
    title,
    data,
    activeTab,
    onTabChange,
    loading,
  }: {
    title: string;
    data: Array<{ label: string; value: number }>;
    activeTab: string;
    onTabChange: (tab: string) => void;
    loading: boolean;
  }) => (
    <div>
      <div data-testid='chart-title'>{title}</div>
      <div data-testid='chart-state'>
        {activeTab}|{loading ? 'loading' : 'ready'}|{data.length}
      </div>
      <button type='button' onClick={() => onTabChange('daily')}>
        Daily
      </button>
    </div>
  ),
}));

const mockUseAuthContext = useAuthContext as jest.MockedFunction<
  () => Partial<ReturnType<typeof useAuthContext>>
>;

const mockGetCommission = getCommission as jest.MockedFunction<typeof getCommission>;
const createCommissionResponse = (
  breakdown: Array<{ app_id: string; app_markup_usd: number; transactions_count: number }> = [],
) =>
  ({
    app_markup_statistics: {
      breakdown,
    },
  } as unknown as Awaited<ReturnType<typeof getCommission>>);

const authorizedContext = {
  is_logged_in: true,
  is_authorized: true,
};

describe('Commission page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthContext.mockImplementation(
      () => authorizedContext as Partial<ReturnType<typeof useAuthContext>>,
    );
    mockGetCommission.mockResolvedValue(createCommissionResponse());
  });

  it('shows the login prompt when the user is not logged in', async () => {
    mockUseAuthContext.mockImplementation(
      () =>
        ({
          is_logged_in: false,
          is_authorized: false,
        } as Partial<ReturnType<typeof useAuthContext>>),
    );

    render(<Commission />);

    expect(
      await screen.findByText(/Please log in to view your commission details/i),
    ).toBeInTheDocument();
    expect(mockGetCommission).not.toHaveBeenCalled();
  });

  it('waits for websocket authorization before loading commission data', async () => {
    mockUseAuthContext.mockImplementation(
      () =>
        ({
          is_logged_in: true,
          is_authorized: false,
        } as Partial<ReturnType<typeof useAuthContext>>),
    );

    render(<Commission />);

    expect(
      await screen.findByText(/Connecting to your account to load commission details/i),
    ).toBeInTheDocument();
    expect(mockGetCommission).not.toHaveBeenCalled();
  });

  it('aggregates commission data across apps and loads the monthly chart once on mount', async () => {
    mockGetCommission.mockResolvedValue(
      createCommissionResponse([
        { app_id: '123', app_markup_usd: 12.5, transactions_count: 4 },
        { app_id: '456', app_markup_usd: 7.5, transactions_count: 3 },
      ]),
    );

    render(<Commission />);

    await waitFor(() => {
      expect(screen.getByTestId('card-This Month')).toHaveTextContent('This Month|20|7|0.0');
    });

    expect(mockGetCommission).toHaveBeenCalledTimes(15);
    expect(screen.getByTestId("card-Today's Commission")).toHaveTextContent(
      "Today's Commission|20|7|no-trend",
    );
    expect(screen.getByTestId('card-Last Month')).toHaveTextContent('Last Month|20|7|no-trend');
    expect(screen.getByTestId('chart-title')).toHaveTextContent('Monthly Commission Distribution');
    expect(screen.getByTestId('chart-state')).toHaveTextContent('monthly|ready|12');
  });

  it('loads the daily chart when the daily tab is selected', async () => {
    render(<Commission />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-state')).toHaveTextContent('monthly|ready|12');
    });

    expect(mockGetCommission).toHaveBeenCalledTimes(15);
    fireEvent.click(screen.getByRole('button', { name: 'Daily' }));

    await waitFor(() => {
      expect(screen.getByTestId('chart-title')).toHaveTextContent('Daily Commission Distribution');
    });

    expect(mockGetCommission).toHaveBeenCalledTimes(45);
    expect(screen.getByTestId('chart-title')).toHaveTextContent('Daily Commission Distribution');
    expect(screen.getByTestId('chart-state')).toHaveTextContent('daily|ready|30');
  });

  it('filters commission figures by the selected app', async () => {
    mockGetCommission.mockResolvedValue(
      createCommissionResponse([
        { app_id: '123', app_markup_usd: 12.5, transactions_count: 4 },
        { app_id: '456', app_markup_usd: 7.5, transactions_count: 3 },
      ]),
    );

    render(<Commission />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '#123' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '#123' }));

    await waitFor(() => {
      expect(screen.getByTestId('card-This Month')).toHaveTextContent('This Month|12.5|4|0.0');
    });

    expect(mockGetCommission).toHaveBeenCalledTimes(30);
    expect(screen.getByTestId('chart-title')).toHaveTextContent(
      'Monthly Commission Distribution for App #123',
    );
  });

  it('loads a custom range only when requested', async () => {
    mockGetCommission.mockResolvedValue(
      createCommissionResponse([
        { app_id: '123', app_markup_usd: 12.5, transactions_count: 4 },
        { app_id: '456', app_markup_usd: 7.5, transactions_count: 3 },
      ]),
    );

    render(<Commission />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-state')).toHaveTextContent('monthly|ready|12');
    });

    fireEvent.click(screen.getByRole('button', { name: /Check commission/i }));

    await waitFor(() => {
      expect(screen.getByTestId('card-Custom Range')).toHaveTextContent(
        'Custom Range|20|7|no-trend',
      );
    });

    expect(mockGetCommission).toHaveBeenCalledTimes(16);
  });
});
