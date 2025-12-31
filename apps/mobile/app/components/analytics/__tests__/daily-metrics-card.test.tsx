/**
 * Daily Metrics Component Tests
 */

import { render, act, waitFor, screen } from '@testing-library/react-native';
import { DailyMetricsCard } from '../daily-metrics-card';

const MOCK_METRICS = {
  tasksCompleted: 8,
  tasksCreated: 12,
  focusScore: 0.85,
};

const MOCK_TIMER_STATS = {
  totalMinutesWorked: 180,
  pomodorosCompleted: 4,
};

describe('DailyMetricsCard', () => {
  it('should render metrics correctly', () => {
    render(() => (
      <DailyMetricsCard
        metrics={MOCK_METRICS}
        timerStats={MOCK_TIMER_STATS}
      />
    ));

    expect(screen.getByText('Daily Summary')).toBeTruthy();
    expect(screen.getByText('8')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
  });

  it('should format duration correctly', () => {
    render(() => (
      <DailyMetricsCard
        metrics={MOCK_METRICS}
        timerStats={{ totalMinutesWorked: 125 }}
      />
    ));

    expect(screen.getByText('2h 5m')).toBeTruthy();
  });

  it('should display focus score as percentage', () => {
    render(() => (
      <DailyMetricsCard
        metrics={MOCK_METRICS}
        timerStats={MOCK_TIMER_STATS}
      />
    ));

    expect(screen.getByText('85%')).toBeTruthy();
  });

  it('should show loading skeleton when isLoading is true', () => {
    render(() => (
      <DailyMetricsCard
        isLoading={true}
      />
    ));

    // Check for loading state indicators
    expect(screen.getByText('Daily Summary')).toBeTruthy();
  });

  it('should switch between period tabs', async () => {
    render(() => (
      <DailyMetricsCard
        metrics={MOCK_METRICS}
        timerStats={MOCK_TIMER_STATS}
      />
    ));

    const weekTab = screen.getByText('Semana');
    act(() => {
      weekTab.parent?.props.onPress();
    });

    await waitFor(() => {
      expect(weekTab.parent?.props.style.borderColor).toBeDefined();
    });
  });

  it('should display insights correctly', () => {
    render(() => (
      <DailyMetricsCard
        metrics={MOCK_METRICS}
        timerStats={MOCK_TIMER_STATS}
      />
    ));

    expect(screen.getByText(/Insights/)).toBeTruthy();
    expect(screen.getByText(/Productividad/)).toBeTruthy();
    expect(screen.getByText(/Racha actual/)).toBeTruthy();
  });

  it('should handle null metrics', () => {
    render(() => (
      <DailyMetricsCard
        metrics={null}
        timerStats={null}
      />
    ));

    expect(screen.getByText('Daily Summary')).toBeTruthy();
    expect(screen.getByText('0')).toBeTruthy();
    expect(screen.getByText('N/A')).toBeTruthy();
  });
});

  it("should format duration correctly", () => {
    const { getByText } = render(() => (
      <DailyMetricsCard
        metrics={MOCK_METRICS}
        timerStats={{ totalMinutesWorked: 125 }}
      />
    ));

    expect(getByText("2h 5m")).toBeTruthy();
  });

  it("should display focus score as percentage", () => {
    const { getByText } = render(() => (
      <DailyMetricsCard metrics={MOCK_METRICS} timerStats={MOCK_TIMER_STATS} />
    ));

    expect(getByText("85%")).toBeTruthy();
  });

  it("should show loading skeleton when isLoading is true", () => {
    const { getAllByTestId } = render(() => (
      <DailyMetricsCard isLoading={true} />
    ));

    const skeletons = getAllByTestId(/skeleton/);
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("should switch between period tabs", async () => {
    const { getByText } = render(() => (
      <DailyMetricsCard metrics={MOCK_METRICS} timerStats={MOCK_TIMER_STATS} />
    ));

    const weekTab = getByText("Semana");
    act(() => {
      weekTab.parent?.props.onPress();
    });

    await waitFor(() => {
      expect(weekTab.parent?.props.style.borderColor).toBe(
        getByTestId("active-tab").props.color,
      );
    });
  });

  it("should display insights correctly", () => {
    const { getByText } = render(() => (
      <DailyMetricsCard metrics={MOCK_METRICS} timerStats={MOCK_TIMER_STATS} />
    ));

    expect(getByText(/Insights/)).toBeTruthy();
    expect(getByText(/Productividad/)).toBeTruthy();
    expect(getByText(/Racha actual/)).toBeTruthy();
  });

  it("should handle null metrics", () => {
    const { getByText } = render(() => (
      <DailyMetricsCard metrics={null} timerStats={null} />
    ));

    expect(getByText("Daily Summary")).toBeTruthy();
    expect(getByText("0")).toBeTruthy();
    expect(getByText("N/A")).toBeTruthy();
  });
});
