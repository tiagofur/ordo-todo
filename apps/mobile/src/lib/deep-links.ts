import { onOpenUrl, getCurrent } from "@tauri-apps/plugin-deep-link";
import { storeOAuthCallbackTokens } from "./oauth";

export type DeepLinkCallback = (ok: boolean) => void;

const isAuthCallback = (url: string) =>
  url.startsWith("ordo://auth/callback?") || url === "ordo://auth/callback";

/**
 * Registra el manejo del deep link ordo://auth/callback (OAuth). El callback
 * se invoca con true cuando llega un callback con tokens válidos, para que
 * la UI refresque la sesión.
 *
 * getCurrent() cubre el cold start: si la app se abrió POR el deep link
 * (estaba cerrada), el evento onOpenUrl puede no repetirse.
 */
export async function initDeepLinks(onCallback: DeepLinkCallback) {
  const handle = async (urls: unknown) => {
    for (const raw of Array.isArray(urls) ? urls : [urls]) {
      const url = typeof raw === "string" ? raw : String(raw);
      if (!isAuthCallback(url)) continue;

      const params = new URLSearchParams(url.slice(url.indexOf("?") + 1));
      const ok = await storeOAuthCallbackTokens(params);
      onCallback(ok);
    }
  };

  await onOpenUrl(handle);

  // Cold start: la app pudo abrirse directamente por el deep link.
  try {
    const initial = await getCurrent();
    if (initial) await handle(initial);
  } catch {
    // sin deep link inicial
  }
}
