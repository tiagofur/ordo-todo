import { Entity, EntityProps } from '../../shared/entity';

export interface FocusModeProps extends EntityProps {
  name: string;
  description: string;
  workDuration: number; // minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  recommendedTrackIds: string[];
}

export class FocusMode extends Entity<FocusModeProps> {
  constructor(props: FocusModeProps, mode: 'valid' | 'draft' = 'valid') {
    super(props, mode);
    if (mode === 'valid') {
      this.validate();
    }
  }

  private validate(): void {
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new Error('FocusMode name is required');
    }
    if (this.props.name.length > 100) {
      throw new Error('FocusMode name must be 100 characters or less');
    }
    if (!this.props.description || this.props.description.trim().length === 0) {
      throw new Error('FocusMode description is required');
    }
    if (this.props.description.length > 500) {
      throw new Error('FocusMode description must be 500 characters or less');
    }
    if (this.props.workDuration < 1 || this.props.workDuration > 180) {
      throw new Error('FocusMode workDuration must be between 1 and 180 minutes');
    }
    if (this.props.shortBreakDuration < 1 || this.props.shortBreakDuration > 60) {
      throw new Error('FocusMode shortBreakDuration must be between 1 and 60 minutes');
    }
    if (this.props.longBreakDuration < 1 || this.props.longBreakDuration > 120) {
      throw new Error('FocusMode longBreakDuration must be between 1 and 120 minutes');
    }
    if (this.props.sessionsBeforeLongBreak < 1 || this.props.sessionsBeforeLongBreak > 10) {
      throw new Error('FocusMode sessionsBeforeLongBreak must be between 1 and 10');
    }
  }

  // Business logic methods
  getTotalCycleTime(): number {
    // Total time for one complete cycle (work + short break)
    return this.props.workDuration + this.props.shortBreakDuration;
  }

  getTotalCycleTimeWithLongBreak(): number {
    // Total time for a full set including long break
    const shortBreaksTime = this.props.shortBreakDuration * (this.props.sessionsBeforeLongBreak - 1);
    const workTime = this.props.workDuration * this.props.sessionsBeforeLongBreak;
    return workTime + shortBreaksTime + this.props.longBreakDuration;
  }

  isLongBreakSession(sessionNumber: number): boolean {
    return sessionNumber > 0 && sessionNumber % this.props.sessionsBeforeLongBreak === 0;
  }

  getExpectedSessionDuration(sessionNumber: number): number {
    if (this.isLongBreakSession(sessionNumber)) {
      return this.props.longBreakDuration;
    }
    // First session is always work
    if (sessionNumber === 1) {
      return this.props.workDuration;
    }
    // Odd sessions (after first) are work, even are short breaks
    return sessionNumber % 2 !== 0 ? this.props.workDuration : this.props.shortBreakDuration;
  }

  hasRecommendedTrack(trackId: string): boolean {
    return this.props.recommendedTrackIds.includes(trackId);
  }

  isIntensive(): boolean {
    return this.props.workDuration >= 50;
  }

  isLight(): boolean {
    return this.props.workDuration <= 25;
  }

  // Getters
  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get workDuration(): number {
    return this.props.workDuration;
  }

  get shortBreakDuration(): number {
    return this.props.shortBreakDuration;
  }

  get longBreakDuration(): number {
    return this.props.longBreakDuration;
  }

  get sessionsBeforeLongBreak(): number {
    return this.props.sessionsBeforeLongBreak;
  }

  get recommendedTrackIds(): string[] {
    return [...this.props.recommendedTrackIds];
  }
}
