import { Entity, EntityProps } from '../../shared/entity';
import { MeetingAnalysis } from './meeting-analysis.vo';

export interface MeetingProps extends EntityProps<string> {
  userId: string;
  title: string;
  date: Date;
  duration: number; // minutes
  transcript?: string;
  audioUrl?: string;
  analysis?: MeetingAnalysis;
  projectId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Meeting extends Entity<MeetingProps> {
  constructor(props: MeetingProps, mode: 'valid' | 'draft' = 'valid') {
    super(props, mode);
    if (mode === 'valid') {
      this.validate();
    }
  }

  static create(props: Omit<MeetingProps, 'id' | 'createdAt' | 'updatedAt'>): Meeting {
    const now = new Date();
    return new Meeting({
      ...props,
      createdAt: now,
      updatedAt: now,
    });
  }

  private validate(): void {
    if (!this.props.userId || this.props.userId.trim().length === 0) {
      throw new Error('Meeting userId is required');
    }
    if (!this.props.title || this.props.title.trim().length === 0) {
      throw new Error('Meeting title is required');
    }
    if (this.props.title.length > 500) {
      throw new Error('Meeting title must be 500 characters or less');
    }
    if (!this.props.date) {
      throw new Error('Meeting date is required');
    }
    if (this.props.duration < 0) {
      throw new Error('Meeting duration cannot be negative');
    }
    if (this.props.duration > 480) {
      throw new Error('Meeting duration cannot exceed 8 hours (480 minutes)');
    }
    if (this.props.transcript && this.props.transcript.length > 100000) {
      throw new Error('Meeting transcript must be 100,000 characters or less');
    }
    if (this.props.audioUrl && this.props.audioUrl.length > 1000) {
      throw new Error('Meeting audioUrl must be 1000 characters or less');
    }
  }

  // Business logic methods
  hasTranscript(): boolean {
    return !!this.props.transcript && this.props.transcript.trim().length > 0;
  }

  hasAudio(): boolean {
    return !!this.props.audioUrl && this.props.audioUrl.trim().length > 0;
  }

  hasAnalysis(): boolean {
    return !!this.props.analysis;
  }

  isAssociatedWithProject(): boolean {
    return !!this.props.projectId;
  }

  isPast(): boolean {
    return this.props.date < new Date();
  }

  isFuture(): boolean {
    return this.props.date > new Date();
  }

  isToday(): boolean {
    const today = new Date();
    return (
      this.props.date.getDate() === today.getDate() &&
      this.props.date.getMonth() === today.getMonth() &&
      this.props.date.getFullYear() === today.getFullYear()
    );
  }

  isUpcoming(days: number = 7): boolean {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);
    return this.props.date >= now && this.props.date <= future;
  }

  getDurationInHours(): number {
    return Math.round((this.props.duration / 60) * 10) / 10;
  }

  isLong(): boolean {
    return this.props.duration > 60;
  }

  isShort(): boolean {
    return this.props.duration <= 30;
  }

  updateAnalysis(analysis: MeetingAnalysis): Meeting {
    return this.clone({
      analysis,
      updatedAt: new Date(),
    });
  }

  addTranscript(transcript: string): Meeting {
    return this.clone({
      transcript,
      updatedAt: new Date(),
    });
  }

  linkToProject(projectId: string): Meeting {
    return this.clone({
      projectId,
      updatedAt: new Date(),
    });
  }

  // Getters
  get userId(): string {
    return this.props.userId;
  }

  get title(): string {
    return this.props.title;
  }

  get date(): Date {
    return this.props.date;
  }

  get duration(): number {
    return this.props.duration;
  }

  get transcript(): string | undefined {
    return this.props.transcript;
  }

  get audioUrl(): string | undefined {
    return this.props.audioUrl;
  }

  get analysis(): MeetingAnalysis | undefined {
    return this.props.analysis;
  }

  get projectId(): string | undefined {
    return this.props.projectId;
  }

  get createdAt(): Date {
    return this.props.createdAt || new Date();
  }

  get updatedAt(): Date {
    return this.props.updatedAt || new Date();
  }
}
