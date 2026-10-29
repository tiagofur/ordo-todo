import { browser } from 'wxt/browser';

export interface PageContext {
  title: string;
  url: string;
  selection?: string;
}

/**
 * Contexto de la pestaña activa para el prefill (ODD 024 S2). activeTab —
 * concedido al abrir el popup — ampara leer título/URL e inyectar el lector
 * de selección. En páginas protegidas (chrome://, store) la inyección falla
 * y seguimos solo con título/URL.
 */
export async function getActivePageContext(): Promise<PageContext | null> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return null;

  let selection: string | undefined;
  try {
    const [injection] = await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection()?.toString() ?? '',
    });
    selection = (injection?.result as string | undefined) || undefined;
  } catch {
    // Sin acceso de inyección: captura solo con título/URL.
  }

  return { title: tab.title ?? '', url: tab.url ?? '', selection };
}

/** Mapeo determinista contexto → valores iniciales del CreateTaskDialog. */
export function buildPrefill(ctx: PageContext): {
  initialTitle: string;
  initialDescription: string;
} {
  const url = ctx.url.trim();
  const selection = ctx.selection?.trim() ?? '';
  const title = ctx.title.trim() || url;

  const parts: string[] = [];
  if (url) parts.push(url);
  if (selection) parts.push(selection);

  return {
    initialTitle: title,
    initialDescription: parts.join('\n\n'),
  };
}
