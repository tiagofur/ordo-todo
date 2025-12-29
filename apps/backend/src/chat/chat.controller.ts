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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ChatService } from './chat.service';
import { CreateConversationDto, SendMessageDto } from './dto/chat.dto';

interface RequestUser {
  id: string;
  email: string;
  name: string;
}

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // ============ CONVERSATIONS ============

  @Get('conversations')
  @ApiOperation({ summary: 'List all conversations for current user' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of conversations to return',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of conversations to skip',
  })
  @ApiQuery({
    name: 'includeArchived',
    required: false,
    type: Boolean,
    description: 'Include archived conversations',
  })
  @ApiResponse({
    status: 200,
    description: 'Conversations retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get a single conversation with all messages' })
  @ApiParam({ name: 'id', type: String, description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Conversation retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  getConversation(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.chatService.getConversation(id, user.id);
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiBody({ type: CreateConversationDto })
  @ApiResponse({
    status: 201,
    description: 'Conversation created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  createConversation(
    @Body() dto: CreateConversationDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.chatService.createConversation(user.id, dto);
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send a message to a conversation' })
  @ApiParam({ name: 'id', type: String, description: 'Conversation ID' })
  @ApiBody({ type: SendMessageDto })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  sendMessage(
    @Param('id') conversationId: string,
    @Body() dto: SendMessageDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.chatService.sendMessage(conversationId, user.id, dto);
  }

  @Patch('conversations/:id')
  @ApiOperation({ summary: 'Update conversation title' })
  @ApiParam({ name: 'id', type: String, description: 'Conversation ID' })
  @ApiBody({
    schema: { type: 'object', properties: { title: { type: 'string' } } },
  })
  @ApiResponse({
    status: 200,
    description: 'Conversation updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  updateConversation(
    @Param('id') id: string,
    @Body('title') title: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.chatService.updateTitle(id, user.id, title);
  }

  @Patch('conversations/:id/archive')
  @ApiOperation({ summary: 'Archive a conversation' })
  @ApiParam({ name: 'id', type: String, description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Conversation archived successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  archiveConversation(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.chatService.archiveConversation(id, user.id);
  }

  @Delete('conversations/:id')
  @ApiOperation({ summary: 'Delete a conversation' })
  @ApiParam({ name: 'id', type: String, description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Conversation deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  deleteConversation(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.chatService.deleteConversation(id, user.id);
  }

  // ============ AI INSIGHTS ============

  @Get('insights')
  @ApiOperation({ summary: 'Get proactive productivity insights' })
  @ApiResponse({ status: 200, description: 'Insights retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getInsights(@CurrentUser() user: RequestUser) {
    return this.chatService.getInsights(user.id);
  }
}
