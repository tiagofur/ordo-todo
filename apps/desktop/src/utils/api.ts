// Re-export the API hooks from the proper location
// This file bridges the old TRPC-based API with the new REST API client

import { useProjects } from '@/hooks/api/use-projects'
import { useTasks } from '@/hooks/api/use-tasks'
import { useTags } from '@/hooks/api/use-tags'
import { useWorkspaces } from '@/hooks/api/use-workspaces'
import { useTimeSessions } from '@/hooks/api/use-timers'

// Create a compatibility layer that mimics TRPC structure
export const api = {
  // Tasks
  task: {
    list: { useQuery: () => useTasks() },
    // Add more as needed
  },
  // Projects
  project: {
    list: { useQuery: () => useProjects() },
  },
  // Tags
  tag: {
    list: { useQuery: () => useTags() },
  },
  // Workspaces
  workspace: {
    list: { useQuery: () => useWorkspaces() },
  },
  // Timers
  timer: {
    list: { useQuery: () => useTimeSessions() },
  },
}
