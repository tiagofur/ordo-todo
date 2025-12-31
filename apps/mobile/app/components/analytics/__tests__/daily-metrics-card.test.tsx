/**
 * Daily Metrics Component Tests
 */

import { render } from '@testing-library/react-native';
import { DailyMetricsCard } from '../daily-metrics-card';

const MOCK_METRICS = {
  tasksCompleted: 8,
  tasksCreated: 12,
  focusScore: 0.85,
};

const MOCK_TIMER_STATS = {
  totalMinutesWorked: 180,
  pomodorosCompleted: 4,
} as any;

describe('DailyMetricsCard', () => {
  it('should render without crashing', () => {
    render(
      <DailyMetricsCard
        metrics={MOCK_METRICS}
        timerStats={MOCK_TIMER_STATS}
      />
    );
  });

  it('should display metrics when provided', () => {
    const { getByText } = render(
      <DailyMetricsCard
        metrics={MOCK_METRICS}
        timerStats={MOCK_TIMER_STATS}
      />
    );

    expect(getByText('Daily Summary')).toBeTruthy();
    expect(getByText('8')).toBeTruthy();
  });

  it('should display focus score as percentage', () => {
    const { getByText } = render(
      <DailyMetricsCard
        metrics={MOCK_METRICS}
        timerStats={MOCK_TIMER_STATS}
      />
    );

    expect(getByText('85%')).toBeTruthy();
  });

  it('should show period selector', () => {
    const { getByText } = render(
      <DailyMetricsCard
        metrics={MOCK_METRICS}
        timerStats={MOCK_TIMER_STATS}
      />
    );

    expect(getByText('Hoy')).toBeTruthy();
    expect(getByText('Semana')).toBeTruthy();
    expect(getByText('Mes')).toBeTruthy();
  });

  it('should display insights', () => {
    const { getByText } = render(
      <DailyMetricsCard
        metrics={MOCK_METRICS}
        timerStats={MOCK_TIMER_STATS}
      />
    );

    expect(getByText(/Insights/)).toBeTruthy();
  });

  it('should handle null metrics', () => {
    const { getByText } = render(
      <DailyMetricsCard
        metrics={null}
        timerStats={null}
      />
    );

    expect(getByText('Daily Summary')).toBeTruthy();
    expect(getByText('N/A')).toBeTruthy();
  });
});
