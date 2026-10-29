import { browser } from 'wxt/browser';
import { apiClient } from '../src/lib/api-client';
import { refreshBadge, flashBadge } from '../src/lib/badge';
import { MENU_ID, buildMenuTaskPayload, type MenuClickInfo, type MenuTab } from '../src/lib/menu';
import { getOptions } from '../src/lib/options';

const BADGE_REFRESH_ALARM = 'ordo-badge-refresh';

export default defineBackground(() => {
  // Menús: el SW se reinicia a menudo; removeAll evita duplicados.
  void browser.contextMenus.removeAll().then(() => {
    browser.contextMenus.create({
      id: MENU_ID,
      title: menuTitle(),
      contexts: ['selection', 'link', 'page'],
    });
  });

  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== MENU_ID) return;
    await handleMenuClick(info, tab);
  });

  // Badge de "tareas de hoy": al arrancar y cada 30 min (S4).
  void refreshBadge();
  void browser.alarms.create(BADGE_REFRESH_ALARM, { periodInMinutes: 30 });
  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === BADGE_REFRESH_ALARM) void refreshBadge();
  });
});

/** Título del menú en el idioma del navegador (el SW no tiene localStorage). */
function menuTitle(): string {
  const lang = (browser.i18n?.getUILanguage?.() ?? 'en').slice(0, 2);
  const titles: Record<string, string> = {
    es: 'Añadir a Ordo',
    pt: 'Adicionar ao Ordo',
    en: 'Add to Ordo',
  };
  return titles[lang] ?? titles.en;
}

export async function handleMenuClick(
  info: MenuClickInfo,
  tab?: MenuTab | null,
): Promise<void> {
  const { defaultProjectId } = await getOptions();
  const payload = buildMenuTaskPayload(info, tab, defaultProjectId ?? null);
  if (!payload) return;

  try {
    await apiClient.createTask(payload as never);
    await flashBadge(true);
  } catch {
    // Sesión muerta o error: badge de fallo y Ordo abierto para re-autenticar.
    await flashBadge(false);
    await browser.tabs.create({ url: 'https://ordotodo.app/login' });
  }
}
