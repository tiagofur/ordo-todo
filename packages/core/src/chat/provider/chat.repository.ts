import { ChatConversation, ChatConversationProps } from "../model/chat-conversation.entity";
import { ChatMessage } from "../model/chat-message.entity";

/**
 * Filter and pagination options for conversations
 */
export interface GetConversationsOptions {
    limit?: number;
    offset?: number;
    includeArchived?: boolean;
}

/**
 * Result of multiple conversations query
 */
export interface GetConversationsResult {
    conversations: ChatConversation[]; // Note: Usually these are returned with some metadata like messageCount or lastMessage
    total: number;
}

/**
 * Repository interface for Chat persistence operations.
 */
export interface IChatRepository {
    /**
     * Create a new conversation
     */
    createConversation(conversation: ChatConversation): Promise<ChatConversation>;

    /**
     * Find a conversation by ID and UserID (for ownership check)
     */
    findConversationById(id: string, userId: string): Promise<ChatConversation | null>;

    /**
     * Find many conversations for a user
     */
    findConversationsByUserId(userId: string, options?: GetConversationsOptions): Promise<GetConversationsResult>;

    /**
     * Update a conversation
     */
    updateConversation(id: string, userId: string, data: Partial<ChatConversationProps>): Promise<void>;

    /**
     * Delete a conversation
     */
    deleteConversation(id: string, userId: string): Promise<void>;

    /**
     * Add a message to a conversation
     */
    addMessage(message: ChatMessage): Promise<ChatMessage>;

    /**
     * Get message history for a conversation
     */
    getMessageHistory(conversationId: string, limit?: number): Promise<ChatMessage[]>;

    /**
     * Verify if a user owns a conversation
     */
    verifyOwnership(conversationId: string, userId: string): Promise<boolean>;
}
