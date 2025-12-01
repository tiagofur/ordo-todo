import { useAuth } from "../../contexts/auth.context";

/**
 * Legacy hook for backwards compatibility
 * Redirects to the new useAuth hook
 * @deprecated Use useAuth from ../../contexts/auth.context instead
 */
const useSession = () => {
  const auth = useAuth();
  return {
    loading: auth.isLoading,
    token: null, // Token is managed internally by API client
    user: auth.user,
    startSession: () => {}, // No longer needed, handled by login
    endSession: auth.logout,
  };
};

export default useSession;
