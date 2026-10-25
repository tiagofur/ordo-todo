import { useEffect, useRef } from "react";
import { getCurrent, onOpenUrl } from "@tauri-apps/plugin-deep-link";

const isAuthCallback = (url: string) => url.startsWith("ordo://auth/callback");

/**
 * Escucha el deep link ordo://auth/callback (OAuth) y entrega sus parámetros
 * (access_token, refresh_token, error…). getCurrent() cubre el cold start: si
 * la app se abrió POR el deep link, el evento onOpenUrl puede no repetirse.
 */
export function useOAuthDeepLinks(
  onCallback: (params: Record<string, string>) => Promise<unknown>,
) {
  const callbackRef = useRef(onCallback);
  callbackRef.current = onCallback;

  useEffect(() => {
    let disposed = false;
    let unlisten: (() => void) | undefined;

    const handle = async (urls: unknown) => {
      for (const raw of Array.isArray(urls) ? urls : [urls]) {
        const url = typeof raw === "string" ? raw : String(raw);
        if (!isAuthCallback(url)) continue;
        const query = url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";
        await callbackRef.current(
          Object.fromEntries(new URLSearchParams(query)),
        );
      }
    };

    onOpenUrl(handle)
      .then((stop) => {
        if (disposed) stop();
        else unlisten = stop;
      })
      .catch(() => undefined);

    getCurrent()
      .then((initial) => {
        if (initial && !disposed) void handle(initial);
      })
      .catch(() => undefined);

    return () => {
      disposed = true;
      unlisten?.();
    };
  }, []);
}
