/**
 * Meeting analyzer DTOs and response shapes.
 * Field set mirrors what the web/desktop meeting UIs read
 * (titles, dates, transcripts, AI analysis with action items).
 */

export interface MeetingAnalysisOptions {
  meetingTitle?: string;
  participants?: string[];
  duration?: number;
}

export type MeetingSummaryStyle = 'executive' | 'detailed' | 'bullet-points';

export interface MeetingActionItem {
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  context: string;
}

export interface MeetingAnalysis {
  summary: string;
  keyPoints: string[];
  actionItems: MeetingActionItem[];
  decisions: MeetingDecision[];
  participants: MeetingParticipant[];
  topics: MeetingTopic[];
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'MIXED';
}

export interface MeetingDecision {
  decision: string;
  context: string;
  participants?: string[];
}

export interface MeetingParticipant {
  name: string;
  role?: string;
  speakingTime?: number;
}

export interface MeetingTopic {
  topic: string;
  duration?: number;
  summary: string;
}

export interface ConvertActionsOptions {
  projectId?: string;
}

export interface ConvertTasksResult {
  created?: number;
}

export interface SaveMeetingDto {
  title: string;
  date: string | Date;
  duration: number;
  transcript?: string;
  audioUrl?: string;
  analysis?: MeetingAnalysis | null;
  projectId?: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: number;
  transcript?: string | null;
  audioUrl?: string | null;
  analysis?: MeetingAnalysis | null;
  projectId?: string | null;
}

export interface GetMeetingsParams {
  projectId?: string;
  limit?: number;
}
