export const MENU_ID = 'ordo-add-task';

export interface MenuClickInfo {
  menuItemId: string | number;
  selectionText?: string;
  linkUrl?: string;
  pageUrl?: string;
}

export interface MenuTab {
  title?: string;
  url?: string;
}

export interface MenuTaskPayload {
  title: string;
  description?: string;
  projectId: string | null;
}

/**
 * Mapeo determinista del clic de menú a tarea (ODD 024 S3):
 * - selección → título = selectionText, descripción = URL de la página
 * - enlace    → título = título de la pestaña (el menú no da el texto del
 *               enlace), descripción = linkUrl
 * - página    → título + URL de la pestaña
 * Proyecto: el por defecto de opciones; si no hay, tarea express (null).
 */
export function buildMenuTaskPayload(
  info: MenuClickInfo,
  tab: MenuTab | undefined | null,
  defaultProjectId?: string | null,
): MenuTaskPayload | null {
  const pageUrl = info.pageUrl ?? tab?.url ?? '';
  const selection = info.selectionText?.trim();
  const linkUrl = info.linkUrl?.trim();
  const pageTitle = tab?.title?.trim() ?? '';

  let title: string;
  let description: string;
  if (selection) {
    title = selection;
    description = pageUrl;
  } else if (linkUrl) {
    title = pageTitle || linkUrl;
    description = linkUrl;
  } else {
    title = pageTitle || pageUrl;
    description = pageUrl;
  }

  if (!title) return null;
  return {
    title,
    description: description || undefined,
    projectId: defaultProjectId ?? null,
  };
}
