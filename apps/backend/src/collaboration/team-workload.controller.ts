import {
    Controller,
    Get,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { TeamWorkloadService } from './team-workload.service';

@Controller('workload')
@UseGuards(JwtAuthGuard)
export class TeamWorkloadController {
    constructor(private readonly workloadService: TeamWorkloadService) { }

    /**
     * Get workload summary for a workspace
     * Shows all members' workload, distribution, and suggestions
     */
    @Get('workspace/:workspaceId')
    async getWorkspaceWorkload(
        @Param('workspaceId') workspaceId: string,
        @CurrentUser() user: RequestUser,
    ) {
        return this.workloadService.getWorkspaceWorkload(workspaceId, user.id);
    }

    /**
     * Get workload for a specific team member
     */
    @Get('member/:userId')
    async getMemberWorkload(
        @Param('userId') userId: string,
        @Query('workspaceId') workspaceId?: string,
    ) {
        return this.workloadService.getMemberWorkload(userId, workspaceId);
    }

    /**
     * Get my own workload
     */
    @Get('me')
    async getMyWorkload(
        @CurrentUser() user: RequestUser,
        @Query('workspaceId') workspaceId?: string,
    ) {
        return this.workloadService.getMemberWorkload(user.id, workspaceId);
    }

    /**
     * Get suggestions for balancing workload in a workspace
     */
    @Get('suggestions/:workspaceId')
    async getBalancingSuggestions(
        @Param('workspaceId') workspaceId: string,
        @CurrentUser() user: RequestUser,
    ) {
        return this.workloadService.getBalancingSuggestions(workspaceId);
    }
}
