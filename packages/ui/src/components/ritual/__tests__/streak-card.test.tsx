/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StreakCard } from '../streak-card';

const labels = {
  title: 'Racha del ritual',
  days: 'días seguidos',
  best: 'Tu mejor racha',
  nextMilestone: 'Próximo hito',
  milestoneReached: 'Hito alcanzado',
  empty: 'Completa tu primer ritual para empezar la racha',
};

describe('StreakCard (ODD 006 S4/T5)', () => {
  it('renders current streak, best and the next milestone', () => {
    render(
      <StreakCard
        current={5}
        longest={9}
        milestones={[7, 30, 100]}
        labels={labels}
      />,
    );
    expect(screen.getByText('Racha del ritual')).toBeDefined();
    expect(screen.getByText('5')).toBeDefined();
    expect(screen.getByText('días seguidos')).toBeDefined();
    expect(screen.getByText('9')).toBeDefined();
    // Next milestone after 5 is 7.
    expect(screen.getByText('7')).toBeDefined();
  });

  it('celebrates a reached milestone', () => {
    render(
      <StreakCard
        current={7}
        longest={7}
        milestones={[7, 30, 100]}
        labels={labels}
      />,
    );
    expect(screen.getByText('Hito alcanzado')).toBeDefined();
    // Next milestone after 7 is 30.
    expect(screen.getByText('30')).toBeDefined();
  });

  it('shows the empty state without a streak', () => {
    render(
      <StreakCard
        current={0}
        longest={0}
        milestones={[7, 30, 100]}
        labels={labels}
      />,
    );
    expect(
      screen.getByText('Completa tu primer ritual para empezar la racha'),
    ).toBeDefined();
  });
});
