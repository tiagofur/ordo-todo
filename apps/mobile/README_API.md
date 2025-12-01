# Ordo-Todo Mobile App - REST API Integration

## Overview

The Ordo-Todo mobile app is built with **React Native + Expo** and uses the **@ordo-todo/api-client** package to communicate with the NestJS REST API backend.

## Key Features

- Type-safe REST API client
- Automatic token management with AsyncStorage
- React Query for caching and state management
- 59 custom hooks covering 49 API endpoints
- Full authentication flow with JWT
- Offline-first architecture
- Cross-platform support (iOS, Android, Web)

## Quick Start

See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for quick commands and common patterns.

## Documentation

- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick start and common patterns
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Migration from tRPC to REST API
- **[API_SETUP.md](./API_SETUP.md)** - Complete setup and architecture guide
- **[MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)** - Summary of all changes
- **[TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)** - Testing checklist

## Available Hooks

### Authentication (5 hooks)
- useLogin, useRegister, useLogout, useCurrentUser, useUpdateProfile

### Tasks (8 hooks)
- useTasks, useTask, useCreateTask, useUpdateTask, useCompleteTask, useDeleteTask, useAssignTask, useUnassignTask

### Workspaces (8 hooks)
- useWorkspaces, useWorkspace, useCreateWorkspace, useUpdateWorkspace, useDeleteWorkspace, useWorkspaceMembers, useAddWorkspaceMember, useRemoveWorkspaceMember

### Workflows (5 hooks)
- useWorkflows, useWorkflow, useCreateWorkflow, useUpdateWorkflow, useDeleteWorkflow

### Projects (5 hooks)
- useProjects, useProject, useCreateProject, useUpdateProject, useDeleteProject

### Tags (7 hooks)
- useTags, useTag, useCreateTag, useUpdateTag, useDeleteTag, useAddTaskTag, useRemoveTaskTag

### Timers (8 hooks)
- useTimerSessions, useTimerSession, useCreateTimerSession, useUpdateTimerSession, useStartTimer, usePauseTimer, useStopTimer, useDeleteTimerSession

### Analytics (4 hooks)
- useDailyMetrics, useProductivitySummary, useTaskCompletionStats, useTimeTrackingSummary

### Comments (5 hooks)
- useComments, useComment, useCreateComment, useUpdateComment, useDeleteComment

### Attachments (4 hooks)
- useAttachments, useAttachment, useUploadAttachment, useDeleteAttachment

**Total: 59 hooks covering 49 API endpoints**

## License

MIT
