/**
 * Value Object for Focus Session Statistics
 */
export interface FocusStatsProps {
  totalSessions: number;
  totalFocusMinutes: number;
  avgSessionLength: number;
  favoriteTrack: string | null;
  preferredMode: string | null;
  streakDays: number;
}

export class FocusStats {
  constructor(private readonly props: FocusStatsProps) {
    this.validate();
  }

  private validate(): void {
    if (this.props.totalSessions < 0) {
      throw new Error('Total sessions cannot be negative');
    }
    if (this.props.totalFocusMinutes < 0) {
      throw new Error('Total focus minutes cannot be negative');
    }
    if (this.props.avgSessionLength < 0) {
      throw new Error('Average session length cannot be negative');
    }
    if (this.props.streakDays < 0) {
      throw new Error('Streak days cannot be negative');
    }
  }

  // Business logic methods
  getTotalFocusHours(): number {
    return Math.round((this.props.totalFocusMinutes / 60) * 10) / 10;
  }

  hasData(): boolean {
    return this.props.totalSessions > 0;
  }

  hasStreak(): boolean {
    return this.props.streakDays > 0;
  }

  isProductive(): boolean {
    // Consider productive if avg session > 20 min and at least 5 sessions
    return this.props.avgSessionLength >= 20 && this.props.totalSessions >= 5;
  }

  getStreakLevel(): 'none' | 'bronze' | 'silver' | 'gold' | 'platinum' {
    if (this.props.streakDays === 0) return 'none';
    if (this.props.streakDays < 7) return 'bronze';
    if (this.props.streakDays < 14) return 'silver';
    if (this.props.streakDays < 30) return 'gold';
    return 'platinum';
  }

  // Getters
  get totalSessions(): number {
    return this.props.totalSessions;
  }

  get totalFocusMinutes(): number {
    return this.props.totalFocusMinutes;
  }

  get avgSessionLength(): number {
    return this.props.avgSessionLength;
  }

  get favoriteTrack(): string | null {
    return this.props.favoriteTrack;
  }

  get preferredMode(): string | null {
    return this.props.preferredMode;
  }

  get streakDays(): number {
    return this.props.streakDays;
  }

  toJSON() {
    return {
      totalSessions: this.props.totalSessions,
      totalFocusMinutes: this.props.totalFocusMinutes,
      totalFocusHours: this.getTotalFocusHours(),
      avgSessionLength: this.props.avgSessionLength,
      favoriteTrack: this.props.favoriteTrack,
      preferredMode: this.props.preferredMode,
      streakDays: this.props.streakDays,
      streakLevel: this.getStreakLevel(),
      hasData: this.hasData(),
      hasStreak: this.hasStreak(),
      isProductive: this.isProductive(),
    };
  }
}
