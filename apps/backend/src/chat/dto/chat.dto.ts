import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateConversationDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    workspaceId?: string;

    @IsString()
    @IsOptional()
    projectId?: string;

    @IsString()
    @IsOptional()
    initialMessage?: string;
}

export class SendMessageDto {
    @IsString()
    message: string;
}

export class ChatMessageResponseDto {
    id: string;
    role: 'USER' | 'ASSISTANT' | 'SYSTEM';
    content: string;
    metadata?: {
        actions?: Array<{
            type: string;
            data?: any;
            result?: any;
        }>;
        suggestions?: string[];
        modelUsed?: string;
        processingTimeMs?: number;
    };
    createdAt: Date;
}

export class ConversationResponseDto {
    id: string;
    title: string | null;
    context: any | null;
    messageCount: number;
    lastMessage?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class ConversationDetailDto {
    id: string;
    title: string | null;
    context: any | null;
    messages: ChatMessageResponseDto[];
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export class SendMessageResponseDto {
    conversationId: string;
    message: ChatMessageResponseDto;
    aiResponse: ChatMessageResponseDto;
}
