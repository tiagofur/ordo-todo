import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export interface DeepLinkData {
  type: 'task' | 'project' | 'workspace' | 'timer' | 'settings' | 'unknown'
  id?: string
  action?: string
  params?: Record<string, string>
}

export interface UseDeepLinksOptions {
  onTaskOpen?: (taskId: string) => void
  onProjectOpen?: (projectId: string) => void
  onTimerStart?: () => void
}

/**
 * Hook to handle deep links in Desktop
 */
export function useDeepLinks(options: UseDeepLinksOptions = {}) {
  const navigate = useNavigate()

  const handleDeepLink = useCallback(
    (data: DeepLinkData) => {
      switch (data.type) {
        case 'task':
          if (data.id) {
            if (options.onTaskOpen) {
              options.onTaskOpen(data.id)
            } else {
              navigate(`/tasks?taskId=${data.id}`)
            }
          }
          break

        case 'project':
          if (data.id) {
            if (options.onProjectOpen) {
              options.onProjectOpen(data.id)
            } else {
              navigate(`/projects/${data.id}`)
            }
          }
          break

        case 'workspace':
          if (data.id) {
            navigate(`/workspaces/${data.id}`)
          }
          break

        case 'timer':
          if (data.action === 'start') {
            if (options.onTimerStart) {
              options.onTimerStart()
            }
            navigate('/timer')
          } else {
            navigate('/timer')
          }
          break

        case 'settings':
          navigate('/settings')
          break

        default:
          break
      }
    },
    [navigate, options]
  )

  useEffect(() => {
    // Check initial search parameters
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const action = params.get('action')
      const type = params.get('type')
      const id = params.get('id')
      if (type) {
        handleDeepLink({
          type: type as any,
          id: id || undefined,
          action: action || undefined,
        })
      }
    }
  }, [handleDeepLink])
}

export default useDeepLinks
