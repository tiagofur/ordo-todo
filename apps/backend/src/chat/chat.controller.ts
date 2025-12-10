import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ChatService } from './chat.service';
import {
    CreateConversationDto,
    SendMessageDto,
} from './dto/chat.dto';

interface RequestUser {
    id: string;
    email: string;
    name: string;
}

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    // ============ CONVERSATIONS ============

    /**
     * List all conversations for the current user
     */
    @Get('conversations')
    getConversations(
        @CurrentUser() user: RequestUser,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
        @Query('includeArchived') includeArchived?: string,
    ) {
        return this.chatService.getConversations(user.id, {
            limit: limit ? parseInt(limit, 10) : undefined,
            offset: offset ? parseInt(offset, 10) : undefined,
            includeArchived: includeArchived === 'true',
        });
    }

    /**
     * Get a single conversation with all messages
     */
    @Get('conversations/:id')
    getConversation(
        @Param('id') id: string,
        @CurrentUser() user: RequestUser,
    ) {
        return this.chatService.getConversation(id, user.id);
    }

    /**
     * Create a new conversation
     */
    @Post('conversations')
    createConversation(
        @Body() dto: CreateConversationDto,
        @CurrentUser() user: RequestUser,
    ) {
        return this.chatService.createConversation(user.id, dto);
    }

    /**
     * Send a message to a conversation
     */
    @Post('conversations/:id/messages')
    sendMessage(
        @Param('id') conversationId: string,
        @Body() dto: SendMessageDto,
        @CurrentUser() user: RequestUser,
    ) {
        return this.chatService.sendMessage(conversationId, user.id, dto);
    }

    /**
     * Update conversation title
     */
    @Patch('conversations/:id')
    updateConversation(
        @Param('id') id: string,
        @Body('title') title: string,
        @CurrentUser() user: RequestUser,
    ) {
        return this.chatService.updateTitle(id, user.id, title);
    }

    /**
     * Archive a conversation
     */
    @Patch('conversations/:id/archive')
    archiveConversation(
        @Param('id') id: string,
        @CurrentUser() user: RequestUser,
    ) {
        return this.chatService.archiveConversation(id, user.id);
    }

    /**
     * Delete a conversation
     */
    @Delete('conversations/:id')
    deleteConversation(
        @Param('id') id: string,
        @CurrentUser() user: RequestUser,
    ) {
        return this.chatService.deleteConversation(id, user.id);
    }

    // ============ AI INSIGHTS ============

    /**
     * Get proactive productivity insights
     */
    @Get('insights')
    getInsights(@CurrentUser() user: RequestUser) {
        return this.chatService.getInsights(user.id);
    }
}
