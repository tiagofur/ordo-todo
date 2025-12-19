import { useAuth } from "@/contexts/auth-context";
import { User } from "@ordo-todo/core";

const useSession = () => {
    const { user: authUser, isLoading, logout } = useAuth();

    const user = authUser
        ? new User({
            id: authUser.id,
            username: authUser.username ?? '',
            name: authUser.name ?? undefined,
            email: authUser.email,
        })
        : null;

    return {
        loading: isLoading,
        token: null,
        user,
        error: (useAuth() as any).error,
        startSession: () => console.warn("startSession is deprecated"),
        endSession: logout,
    };
};

export default useSession;
