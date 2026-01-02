export interface CreateConversationDto {
    title?: string;
    workspaceId?: string;
    projectId?: string;
    initialMessage?: string;
}
export interface SendMessageDto {
    message: string;
}
/**
 * Chat action data structure
 */
export interface ChatAction {
    type: string;
    data?: Record<string, unknown>;
    result?: Record<string, unknown>;
}
export interface ChatMessageResponse {
    id: string;
    role: 'USER' | 'ASSISTANT' | 'SYSTEM';
    content: string;
    metadata?: {
        actions?: ChatAction[];
        suggestions?: string[];
        modelUsed?: string;
        processingTimeMs?: number;
    };
    createdAt: string | Date;
}
/**
 * Conversation context structure
 */
export interface ConversationContext {
    workspaceId?: string;
    projectId?: string;
    taskId?: string;
    additionalInfo?: Record<string, unknown>;
}
export interface ConversationResponse {
    id: string;
    title: string | null;
    context: ConversationContext | null;
    messageCount: number;
    lastMessage?: string;
    createdAt: string | Date;
    updatedAt: string | Date;
}
export interface ConversationDetail {
    id: string;
    title: string | null;
    context: ConversationContext | null;
    messages: ChatMessageResponse[];
    isArchived: boolean;
    createdAt: string | Date;
    updatedAt: string | Date;
}
export interface SendMessageResponse {
    conversationId: string;
    message: ChatMessageResponse;
    aiResponse: ChatMessageResponse;
}
export interface AIInsightsResponse {
    recentConversations: ConversationResponse[];
    suggestedActions: string[];
    productivityTips: string[];
}
//# sourceMappingURL=chat.types.d.ts.map