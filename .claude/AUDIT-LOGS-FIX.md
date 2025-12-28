# Audit Logs API Response Fix

**Date:** 2025-12-27
**Status:** ✅ Fixed

---

## Problem

The frontend was crashing with error `TypeError: logs.map is not a function` when trying to display workspace audit logs in the `WorkspaceDashboard` component.

### Root Cause

The backend endpoint `GET /workspaces/:id/audit-logs` returns a **paginated response**:

```typescript
{
  logs: WorkspaceAuditLog[],
  total: number
}
```

However, the frontend API client expected it to return just an **array**:

```typescript
Promise<WorkspaceAuditLog[]>  // ❌ Incorrect type
```

This caused the frontend code to try to call `.map()` on an object instead of an array.

---

## Solution

### 1. Updated Type Definition

Added new type for the paginated response in `packages/api-client/src/types/workspace.types.ts`:

```typescript
/**
 * Paginated audit logs response
 */
export interface WorkspaceAuditLogsResponse {
  logs: WorkspaceAuditLog[];
  total: number;
}
```

### 2. Updated API Client Method

Changed the return type in `packages/api-client/src/client.ts`:

```typescript
async getWorkspaceAuditLogs(
  workspaceId: string,
  params?: { limit?: number; offset?: number }
): Promise<WorkspaceAuditLogsResponse> {  // ✅ Correct type
  const response = await this.axios.get<WorkspaceAuditLogsResponse>(
    `/workspaces/${workspaceId}/audit-logs`,
    { params }
  );
  return response.data;
}
```

### 3. Updated Frontend Component

Fixed the `WorkspaceDashboard` component to extract the logs array:

```typescript
// Before
const { data: activityData } = useWorkspaceAuditLogs(workspace.id, { limit: 5 });
const logs = activityData || [];  // ❌ activityData is an object, not array

// After
const { data: auditLogData } = useWorkspaceAuditLogs(workspace.id, { limit: 5 });
const logs = auditLogData?.logs || [];  // ✅ Extract logs array from response
```

---

## Files Modified

1. `packages/api-client/src/types/workspace.types.ts` - Added `WorkspaceAuditLogsResponse` type
2. `packages/api-client/src/client.ts` - Updated `getWorkspaceAuditLogs()` return type
3. `apps/web/src/components/workspace/workspace-dashboard.tsx` - Fixed logs extraction

---

## Verification

```bash
✅ npm run check-types -- --filter=@ordo-todo/api-client  # PASSED
✅ npm run build -- --filter=@ordo-todo/api-client        # PASSED
```

---

## Related Documentation

- [Backend Service](apps/backend/src/workspaces/workspaces.service.ts:699) - `getAuditLogs()` method
- [Backend Controller](apps/backend/src/workspaces/workspaces.controller.ts:440) - `GET /:id/audit-logs` endpoint
- [Frontend Component](apps/web/src/components/workspace/workspace-dashboard.tsx:77) - Usage of audit logs

---

## Pattern for Future

When working with paginated endpoints, always use the response wrapper pattern:

```typescript
// ❌ Don't return just the array
async getItems(): Promise<Item[]>

// ✅ Return the full paginated response
async getItems(): Promise<{ items: Item[], total: number }>
```

This allows for pagination metadata and is consistent across the API.
