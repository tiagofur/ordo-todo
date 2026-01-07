import { Meeting, MeetingAnalysis, ActionItem } from '../model';

export interface MeetingRepository {
  // CRUD operations
  create(meeting: Meeting): Promise<Meeting>;
  findById(id: string): Promise<Meeting | null>;
  findByUserId(userId: string): Promise<Meeting[]>;
  findByProjectId(projectId: string): Promise<Meeting[]>;
  update(meeting: Meeting): Promise<Meeting>;
  delete(id: string): Promise<void>;

  // Query operations
  findUpcoming(userId: string, days?: number): Promise<Meeting[]>;
  findPast(userId: string): Promise<Meeting[]>;
  findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Meeting[]>;
  findWithTranscript(userId: string): Promise<Meeting[]>;
  findWithAnalysis(userId: string): Promise<Meeting[]>;

  // Analytics
  countByUserId(userId: string): Promise<number>;
  getTotalDuration(userId: string): Promise<number>;
  getMeetingsStats(userId: string): Promise<{
    total: number;
    withTranscript: number;
    withAnalysis: number;
    totalHours: number;
    avgDuration: number;
  }>;
}

export interface MeetingAnalysisService {
  // AI-based analysis operations
  analyzeTranscript(
    transcript: string,
    options?: {
      meetingTitle?: string;
      participants?: string[];
      duration?: number;
      projectContext?: string;
    }
  ): Promise<MeetingAnalysis>;

  extractActionItems(
    transcript: string,
    projectContext?: string
  ): Promise<ActionItem[]>;

  generateSummary(
    transcript: string,
    style?: 'executive' | 'detailed' | 'bullet-points'
  ): Promise<string>;
}
