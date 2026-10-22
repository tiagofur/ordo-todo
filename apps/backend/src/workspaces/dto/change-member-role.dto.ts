import { IsIn } from 'class-validator';

/** Roles that can be assigned through the role-change endpoint (never OWNER) */
const ASSIGNABLE_ROLES = ['ADMIN', 'MEMBER', 'VIEWER'] as const;

export class ChangeMemberRoleDto {
  @IsIn(ASSIGNABLE_ROLES)
  role: (typeof ASSIGNABLE_ROLES)[number];
}
