export interface CreateConversationDto {
    title?: string;
    workspaceId?: string;
    projectId?: string;
    initialMessage?: string;
}
export interface SendMessageDto {
    message: string;
}
export interface ChatMessageResponse {
    id: string;
    role: 'USER' | 'ASSISTANT' | 'SYSTEM';
    content: string;
    metadata?: {
        actions?: Array<{
            type: string;
            data?: Record<string, unknown>;
            result?: Record<string, unknown>;
        }>;
        suggestions?: string[];
        modelUsed?: string;
        processingTimeMs?: number;
    };
    createdAt: string | Date;
}
export interface ConversationResponse {
    id: string;
    title: string | null;
    context: Record<string, unknown> | null;
    messageCount: number;
    lastMessage?: string;
    createdAt: string | Date;
    updatedAt: string | Date;
}
export interface ConversationDetail {
    id: string;
    title: string | null;
    context: Record<string, unknown> | null;
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