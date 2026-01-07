import { UseCase } from '../../shared/use-case';
import { ActivityRepository } from '../provider/activity.repository';
import { Activity } from '../model/activity.entity';

export interface GetTaskActivitiesInput {
  taskId: string;
  limit?: number;
}

export class GetTaskActivitiesUseCase implements UseCase<GetTaskActivitiesInput, Activity[]> {
  constructor(private readonly activityRepo: ActivityRepository) {}

  async execute(input: GetTaskActivitiesInput): Promise<Activity[]> {
    return await this.activityRepo.getTaskActivities(input.taskId, input.limit);
  }
}
