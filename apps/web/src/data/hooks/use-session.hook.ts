import { useAuth } from "@ordo-todo/auth-provider";
import { User } from "@ordo-todo/core";

const useSession = () => {
    const auth = useAuth();
    const { user: authUser, isLoading, logout } = auth;

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
        error: 'error' in auth ? (auth as { error: unknown }).error : null,
        startSession: () => {},
        endSession: logout,
    };
};

export default useSession;
