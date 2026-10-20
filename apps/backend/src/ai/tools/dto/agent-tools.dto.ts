import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  AGENT_TOOL_NAMES,
  MAX_PLAN_STEPS,
  type AgentToolName,
} from '../agent-tool.types';

export class AgentToolCallDto {
  @IsIn([...AGENT_TOOL_NAMES])
  tool: AgentToolName;

  /**
   * Free-form object: passes `whitelist` as a decorated property, but its
   * inner content is NOT validated here — semantic arg validation lives in
   * AgentToolsService (per-tool validators).
   */
  @IsObject()
  args: Record<string, unknown>;
}

export class ProposePlanDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AgentToolCallDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_PLAN_STEPS)
  calls: AgentToolCallDto[];
}

/**
 * The client re-sends the plan (stateless server): the server re-validates
 * every call and re-derives `requiresConfirmation` via the pure
 * `planRequiresConfirmation()` — it never trusts any client-side flag.
 */
export class ExecutePlanDto {
  @IsString()
  planId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AgentToolCallDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_PLAN_STEPS)
  calls: AgentToolCallDto[];

  @IsBoolean()
  confirmed: boolean;
}
