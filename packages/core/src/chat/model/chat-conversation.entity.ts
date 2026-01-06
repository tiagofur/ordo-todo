import { Entity, EntityProps } from "../../shared/entity";
import { ChatMessage } from "./chat-message.entity";

/**
 * Props for ChatConversation entity
 */
export interface ChatConversationProps extends EntityProps {
    userId: string;
    title?: string;
    context?: any;
    isArchived: boolean;
    archivedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    // We don't necessarily need to store all messages in the aggregate if they are too many,
    // but having a list of recent ones or just the metadata is common.
    messages?: ChatMessage[];
}

/**
 * ChatConversation domain entity
 */
export class ChatConversation extends Entity<ChatConversationProps> {
    constructor(props: ChatConversationProps) {
        super({
            ...props,
            isArchived: props.isArchived ?? false,
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        });
    }

    /**
     * Create a new chat conversation
     */
    static create(
        props: Omit<ChatConversationProps, "id" | "createdAt" | "updatedAt" | "isArchived" | "archivedAt">
    ): ChatConversation {
        return new ChatConversation({
            ...props,
            isArchived: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    get userId(): string {
        return this.props.userId;
    }

    get title(): string | undefined {
        return this.props.title;
    }

    get isArchived(): boolean {
        return this.props.isArchived;
    }

    /**
     * Archive the conversation
     */
    archive(): ChatConversation {
        return this.clone({
            isArchived: true,
            archivedAt: new Date(),
            updatedAt: new Date(),
        });
    }

    /**
     * Update title
     */
    updateTitle(title: string): ChatConversation {
        return this.clone({
            title,
            updatedAt: new Date(),
        });
    }
}
