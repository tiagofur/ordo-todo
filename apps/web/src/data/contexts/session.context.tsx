"use client";
import { createContext, useMemo } from "react";
import { User } from "@ordo-todo/core";
import { useSession as useNextAuthSession } from "next-auth/react";

interface SessionContextProps {
  loading: boolean;
  token: string | null;
  user: User | null;
  startSession: (token: string) => void;
  endSession: () => void;
}

const SessionContext = createContext<SessionContextProps>({} as any);
export default SessionContext;

export function SessionProvider(props: any) {
  const { data: nextAuthSession, status } = useNextAuthSession();
  
  const user = useMemo(() => {
    if (nextAuthSession?.user) {
      // We cast to any because next-auth types might not have our custom properties
      const user = nextAuthSession.user as any;
      
      return new User({
        id: user.id || "unknown",
        name: user.name || "",
        email: user.email || "",
      });
    }
    return null;
  }, [nextAuthSession]);

  function startSession(token: string) {
    console.warn("startSession is deprecated. Use next-auth signIn.");
  }

  function endSession() {
    console.warn("endSession is deprecated. Use next-auth signOut.");
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
      {props.children}
    </SessionContext.Provider>
  );
}
