import { Entity, EntityProps } from "../../shared/entity";

export type ChatRole = 'USER' | 'ASSISTANT' | 'SYSTEM';

/**
 * Props for ChatMessage entity
 */
export interface ChatMessageProps extends EntityProps {
    conversationId: string;
    role: ChatRole;
    content: string;
    metadata?: any;
    createdAt?: Date;
}

/**
 * ChatMessage domain entity
 */
export class ChatMessage extends Entity<ChatMessageProps> {
    constructor(props: ChatMessageProps) {
        super({
            ...props,
            createdAt: props.createdAt ?? new Date(),
        });
    }

    /**
     * Create a new chat message
     */
    static create(
        props: Omit<ChatMessageProps, "id" | "createdAt">
    ): ChatMessage {
        return new ChatMessage({
            ...props,
            createdAt: new Date(),
        });
    }

    get conversationId(): string {
        return this.props.conversationId;
    }

    get role(): ChatRole {
        return this.props.role;
    }

    get content(): string {
        return this.props.content;
    }

    get metadata(): any {
        return this.props.metadata;
    }

    get createdAt(): Date {
        return this.props.createdAt!;
    }
}
