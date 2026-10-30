import { useEffect, useRef } from "react";
import { getCurrent, onOpenUrl } from "@tauri-apps/plugin-deep-link";

const isAuthCallback = (url: string) =>
  url.startsWith("ordo://auth/callback?") || url === "ordo://auth/callback";

/**
 * Escucha el deep link ordo://auth/callback (OAuth) y entrega sus parámetros
 * (access_token, refresh_token, error…). getCurrent() cubre el cold start: si
 * la app se abrió POR el deep link, el evento onOpenUrl puede no repetirse.
 * La misma URL puede llegar dos veces (cold start + evento vivo, o
 * re-entrega del intent al recrear la Activity): se procesa una sola vez.
 */
export function useOAuthDeepLinks(
  onCallback: (params: Record<string, string>) => Promise<unknown>,
) {
  const callbackRef = useRef(onCallback);
  callbackRef.current = onCallback;
  const processedUrls = useRef<Set<string>>(new Set());

  useEffect(() => {
    let disposed = false;
    let unlisten: (() => void) | undefined;

    const handle = async (urls: unknown) => {
      for (const raw of Array.isArray(urls) ? urls : [urls]) {
        const url = typeof raw === "string" ? raw : String(raw);
        if (!isAuthCallback(url)) continue;
        if (processedUrls.current.has(url)) continue;
        processedUrls.current.add(url);
        const query = url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";
        const ok = await callbackRef.current(
          Object.fromEntries(new URLSearchParams(query)),
        );
        // La URL de error del backend es determinista: si el handler no tuvo
        // éxito, permitir reintentarla (no tragamos reintentos legítimos).
        if (ok !== true) processedUrls.current.delete(url);
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
