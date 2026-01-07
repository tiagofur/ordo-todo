/**
 * Value Objects for Meeting Analysis components
 */

export type Sentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'MIXED';

export interface KeyDecisionProps {
  decision: string;
  context: string;
  participants?: string[];
}

export class KeyDecision {
  constructor(private readonly props: KeyDecisionProps) {
    this.validate();
  }

  private validate(): void {
    if (!this.props.decision || this.props.decision.trim().length === 0) {
      throw new Error('KeyDecision decision is required');
    }
    if (this.props.decision.length > 500) {
      throw new Error('KeyDecision decision must be 500 characters or less');
    }
    if (this.props.context && this.props.context.length > 1000) {
      throw new Error('KeyDecision context must be 1000 characters or less');
    }
  }

  get decision(): string {
    return this.props.decision;
  }

  get context(): string {
    return this.props.context;
  }

  get participants(): string[] {
    return this.props.participants || [];
  }

  hasParticipants(): boolean {
    return !!this.props.participants && this.props.participants.length > 0;
  }
}

export interface MeetingParticipantProps {
  name: string;
  role?: string;
  speakingTime?: number; // percentage
}

export class MeetingParticipant {
  constructor(private readonly props: MeetingParticipantProps) {
    this.validate();
  }

  private validate(): void {
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new Error('MeetingParticipant name is required');
    }
    if (this.props.name.length > 100) {
      throw new Error('MeetingParticipant name must be 100 characters or less');
    }
    if (this.props.role && this.props.role.length > 100) {
      throw new Error('MeetingParticipant role must be 100 characters or less');
    }
    if (this.props.speakingTime !== undefined && (this.props.speakingTime < 0 || this.props.speakingTime > 100)) {
      throw new Error('MeetingParticipant speakingTime must be between 0 and 100');
    }
  }

  get name(): string {
    return this.props.name;
  }

  get role(): string | undefined {
    return this.props.role;
  }

  get speakingTime(): number | undefined {
    return this.props.speakingTime;
  }

  hasRole(): boolean {
    return !!this.props.role && this.props.role.trim().length > 0;
  }

  isActiveSpeaker(): boolean {
    return (this.props.speakingTime || 0) > 10; // More than 10% speaking time
  }
}

export interface MeetingTopicProps {
  topic: string;
  duration?: number; // minutes
  summary: string;
}

export class MeetingTopic {
  constructor(private readonly props: MeetingTopicProps) {
    this.validate();
  }

  private validate(): void {
    if (!this.props.topic || this.props.topic.trim().length === 0) {
      throw new Error('MeetingTopic topic is required');
    }
    if (this.props.topic.length > 200) {
      throw new Error('MeetingTopic topic must be 200 characters or less');
    }
    if (!this.props.summary || this.props.summary.trim().length === 0) {
      throw new Error('MeetingTopic summary is required');
    }
    if (this.props.summary.length > 500) {
      throw new Error('MeetingTopic summary must be 500 characters or less');
    }
    if (this.props.duration !== undefined && this.props.duration < 0) {
      throw new Error('MeetingTopic duration cannot be negative');
    }
  }

  get topic(): string {
    return this.props.topic;
  }

  get duration(): number | undefined {
    return this.props.duration;
  }

  get summary(): string {
    return this.props.summary;
  }

  isMajorTopic(): boolean {
    return (this.props.duration || 0) > 15; // More than 15 minutes
  }
}

export interface MeetingAnalysisProps {
  summary: string;
  keyPoints: string[];
  actionItems: any[]; // Will be ActionItem entities
  decisions: KeyDecision[];
  participants: MeetingParticipant[];
  topics: MeetingTopic[];
  sentiment: Sentiment;
  followUpRequired: boolean;
  suggestedFollowUpDate?: Date;
}

export class MeetingAnalysis {
  constructor(private readonly props: MeetingAnalysisProps) {
    this.validate();
  }

  private validate(): void {
    if (!this.props.summary || this.props.summary.trim().length === 0) {
      throw new Error('MeetingAnalysis summary is required');
    }
    if (this.props.summary.length > 2000) {
      throw new Error('MeetingAnalysis summary must be 2000 characters or less');
    }
    if (!Array.isArray(this.props.keyPoints)) {
      throw new Error('MeetingAnalysis keyPoints must be an array');
    }
    if (!['POSITIVE', 'NEUTRAL', 'NEGATIVE', 'MIXED'].includes(this.props.sentiment)) {
      throw new Error('Invalid sentiment value');
    }
    if (this.props.suggestedFollowUpDate && this.props.suggestedFollowUpDate < new Date()) {
      throw new Error('MeetingAnalysis suggestedFollowUpDate must be in the future');
    }
  }

  // Business logic methods
  hasActionItems(): boolean {
    return this.props.actionItems.length > 0;
  }

  hasDecisions(): boolean {
    return this.props.decisions.length > 0;
  }

  hasParticipants(): boolean {
    return this.props.participants.length > 0;
  }

  hasTopics(): boolean {
    return this.props.topics.length > 0;
  }

  isPositive(): boolean {
    return this.props.sentiment === 'POSITIVE';
  }

  isNegative(): boolean {
    return this.props.sentiment === 'NEGATIVE';
  }

  requiresFollowUp(): boolean {
    return this.props.followUpRequired;
  }

  getActionItemCount(): number {
    return this.props.actionItems.length;
  }

  getDecisionCount(): number {
    return this.props.decisions.length;
  }

  getParticipantCount(): number {
    return this.props.participants.length;
  }

  getTopicCount(): number {
    return this.props.topics.length;
  }

  wasProductive(): boolean {
    return this.hasDecisions() && this.hasActionItems() && !this.isNegative();
  }

  // Getters
  get summary(): string {
    return this.props.summary;
  }

  get keyPoints(): string[] {
    return [...this.props.keyPoints];
  }

  get actionItems(): any[] {
    return this.props.actionItems;
  }

  get decisions(): KeyDecision[] {
    return this.props.decisions;
  }

  get participants(): MeetingParticipant[] {
    return this.props.participants;
  }

  get topics(): MeetingTopic[] {
    return this.props.topics;
  }

  get sentiment(): Sentiment {
    return this.props.sentiment;
  }

  get followUpRequired(): boolean {
    return this.props.followUpRequired;
  }

  get suggestedFollowUpDate(): Date | undefined {
    return this.props.suggestedFollowUpDate;
  }
}
