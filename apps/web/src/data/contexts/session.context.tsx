"use client";
import { createContext, useMemo, type PropsWithChildren } from "react";
import { User } from "@ordo-todo/core";
import { useSession as useNextAuthSession } from "next-auth/react";

interface SessionContextProps {
  loading: boolean;
  token: string | null;
  user: User | null;
  startSession: (token: string) => void;
  endSession: () => void;
}

interface NextAuthUserExtended {
  id?: string;
  username?: string;
  name?: string | null;
  email?: string | null;
}

const defaultSessionContext: SessionContextProps = {
  loading: true,
  token: null,
  user: null,
  startSession: () => {},
  endSession: () => {},
};

const SessionContext = createContext<SessionContextProps>(defaultSessionContext);
export default SessionContext;

export function SessionProvider({ children }: PropsWithChildren) {
  const { data: nextAuthSession, status } = useNextAuthSession();

  const user = useMemo(() => {
    if (nextAuthSession?.user) {
      const sessionUser = nextAuthSession.user as NextAuthUserExtended;

      return new User({
        id: sessionUser.id || "unknown",
        username: sessionUser.username || "",
        name: sessionUser.name || "",
        email: sessionUser.email || "",
      });
    }
    return null;
  }, [nextAuthSession]);

  function startSession(_token: string) {
    // Deprecated: Use next-auth signIn instead
  }

  function endSession() {
    // Deprecated: Use next-auth signOut instead
  }

  return (
    <SessionContext.Provider
      value={{
        loading: status === "loading",
        token: null,
        user: user,
        startSession,
        endSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
