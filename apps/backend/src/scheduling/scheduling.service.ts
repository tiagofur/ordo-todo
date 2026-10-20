import { Injectable } from '@nestjs/common';
import { planDay, type DayPlan, type PlanDayInput } from './day-planner';

// Thin Nest wrapper around the pure planner so other modules (ai in T2,
// replan/alerts in T3/T4) can consume it via DI.
@Injectable()
export class SchedulingService {
  planDay(input: PlanDayInput): DayPlan {
    return planDay(input);
  }
}
