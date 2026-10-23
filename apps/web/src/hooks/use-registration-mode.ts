"use client";

import { useEffect, useState } from "react";
import type { RegistrationMode } from "@/lib/registration-invite";

interface RegistrationModeClient {
  getRegistrationMode(): Promise<{ mode: RegistrationMode }>;
}

/**
 * Current registration gate (ODD 019 S5). Fails closed: until the backend
 * says "open", the signup form keeps asking for an invite code — an outage
 * must never hide the field and let a code-less submit reach the server.
 */
export function useRegistrationMode(
  client: RegistrationModeClient,
): RegistrationMode {
  const [mode, setMode] = useState<RegistrationMode>("invite-only");

  useEffect(() => {
    let active = true;
    client
      .getRegistrationMode()
      .then(({ mode: resolved }) => {
        if (active && (resolved === "open" || resolved === "invite-only")) {
          setMode(resolved);
        }
      })
      .catch(() => {
        // Keep the fail-closed default.
      });
    return () => {
      active = false;
    };
  }, [client]);

  return mode;
}
