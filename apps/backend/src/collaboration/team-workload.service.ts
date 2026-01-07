import { Injectable, Inject, Logger } from '@nestjs/common';
import type { ICollaborationRepository, TeamWorkloadSummary, MemberWorkload, WorkloadSuggestion } from '@ordo-todo/core';

@Injectable()
export class TeamWorkloadService {
  private readonly logger = new Logger(TeamWorkloadService.name);

  constructor(
    @Inject('CollaborationRepository')
    private readonly collaborationRepository: ICollaborationRepository,
  ) { }

  /**
   * Get workload summary for a workspace
   */
  async getWorkspaceWorkload(
    workspaceId: string,
    requesterId: string,
  ): Promise<TeamWorkloadSummary> {
    this.logger.log(`Getting workload for workspace ${workspaceId}`);
    return this.collaborationRepository.getWorkspaceWorkload(workspaceId);
  }

  /**
   * Get workload for a specific team member
   */
  async getMemberWorkload(
    userId: string,
    workspaceId?: string,
  ): Promise<MemberWorkload> {
    return this.collaborationRepository.getMemberWorkload(userId, workspaceId);
  }

  /**
   * Get suggestions for balancing workload
   */
  async getBalancingSuggestions(
    workspaceId: string,
  ): Promise<WorkloadSuggestion[]> {
    return this.collaborationRepository.getBalancingSuggestions(workspaceId);
  }
}
