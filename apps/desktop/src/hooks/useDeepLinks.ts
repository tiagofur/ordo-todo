import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export interface DeepLinkData {
  type: 'task' | 'project' | 'workspace' | 'timer' | 'settings' | 'unknown'
  id?: string
  action?: string
  params?: Record<string, string>
}

export interface UseDeepLinksOptions {
  /** Custom handler for deep links (optional) */
  onDeepLink?: (data: DeepLinkData) => boolean | void
}

/**
 * Hook to handle deep links (ordo://) in the Electron app
 *
 * @example
 * ```tsx
 * function App() {
 *   useDeepLinks({
 *     onDeepLink: (data) => {
 *       console.log('Received deep link:', data)
 *       // Return true to prevent default navigation
 *       return false
 *     }
 *   })
 *
 *   return <Router>...</Router>
 * }
 * ```
 */
export function useDeepLinks(options: UseDeepLinksOptions = {}) {
  const navigate = useNavigate()

  const handleDeepLink = useCallback(
    (data: DeepLinkData) => {
      console.log('[DeepLinks] Received:', data)

      // Allow custom handler to override default behavior
      if (options.onDeepLink) {
        const handled = options.onDeepLink(data)
        if (handled === true) return
      }

      // Default navigation based on deep link type
      switch (data.type) {
        case 'task':
          if (data.id) {
            if (data.action === 'edit') {
              navigate(`/tasks/${data.id}/edit`)
            } else {
              navigate(`/tasks/${data.id}`)
            }
          } else {
            navigate('/tasks')
          }
          break

        case 'project':
          if (data.id) {
            navigate(`/projects/${data.id}`)
          } else {
            navigate('/projects')
          }
          break

        case 'workspace':
          if (data.id) {
            // Handle workspace switching via params or state
            navigate('/', { state: { workspaceId: data.id } })
          }
          break

        case 'timer':
          if (data.id === 'start') {
            navigate('/timer', { state: { autoStart: true } })
          } else {
            navigate('/timer')
          }
          break

        case 'settings':
          if (data.id) {
            navigate(`/settings/${data.id}`)
          } else {
            navigate('/settings')
          }
          break

        default:
          console.warn('[DeepLinks] Unknown deep link type:', data.type)
      }
    },
    [navigate, options]
  )

  useEffect(() => {
    if (!window.electronAPI?.deepLinks) {
      console.warn('Deep links API not available')
      return
    }

    // Listen for deep link events
    window.electronAPI.deepLinks.onDeepLink(handleDeepLink)

    return () => {
      window.electronAPI?.removeAllListeners('deep-link')
    }
  }, [handleDeepLink])
}

export default useDeepLinks
