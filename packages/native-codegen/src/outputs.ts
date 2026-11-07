import { existsSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import {
  ANDROID_RES_DIR,
  ANDROID_THEME_DIR,
  LOCALES_DIR,
  REGENERATE_COMMAND,
  REPO_ROOT,
} from './paths.ts';
import { buildAndroidResources, renderStringsXml, type MessageTree } from './strings.ts';
import { renderColorResources, renderKotlinTokens } from './tokens.ts';

export interface GeneratedFile {
  /** Absolute path. */
  path: string;
  content: string;
}

/**
 * next-intl locale files, default first, and the Android resource directory
 * each one feeds. The default locale (es) owns `values/`, mirroring the web,
 * whose last-resort locale is also es.
 */
export const ANDROID_LOCALES = [
  { locale: 'es', file: 'es.json', dir: 'values', toolsLocale: 'es' },
  { locale: 'en', file: 'en.json', dir: 'values-en' },
  { locale: 'pt-br', file: 'pt-br.json', dir: 'values-pt-rBR' },
] as const;

export const NATIVE_NAMESPACE = 'Native';

function readNativeCatalog(file: string): MessageTree {
  const catalog = JSON.parse(readFileSync(join(LOCALES_DIR, file), 'utf8')) as Record<
    string,
    unknown
  >;
  const native = catalog[NATIVE_NAMESPACE];
  if (!native || typeof native !== 'object') {
    throw new Error(`packages/i18n/src/locales/${file} has no "${NATIVE_NAMESPACE}" namespace`);
  }
  return native as MessageTree;
}

/** Every file the native apps receive from the shared sources, rendered in memory. */
export function buildOutputs(): GeneratedFile[] {
  const colors = renderColorResources();
  const files: GeneratedFile[] = [
    { path: join(ANDROID_THEME_DIR, 'OrdoTokens.kt'), content: renderKotlinTokens() },
    { path: join(ANDROID_RES_DIR, 'values/ordo_colors.xml'), content: colors.day },
    { path: join(ANDROID_RES_DIR, 'values-night/ordo_colors.xml'), content: colors.night },
  ];

  const resources = buildAndroidResources(
    ANDROID_LOCALES.map(({ locale, file }) => ({ locale, messages: readNativeCatalog(file) })),
  );
  for (const entry of ANDROID_LOCALES) {
    const source = `packages/i18n/src/locales/${entry.file}`;
    const toolsLocale = 'toolsLocale' in entry ? entry.toolsLocale : undefined;
    files.push({
      path: join(ANDROID_RES_DIR, entry.dir, 'strings.xml'),
      content: renderStringsXml(resources.get(entry.locale)!, source, toolsLocale),
    });
  }
  return files;
}

/** Repo-relative paths whose content on disk differs from what the sources produce. */
export function findStaleOutputs(files: readonly GeneratedFile[] = buildOutputs()): string[] {
  return files
    .filter((file) => !existsSync(file.path) || readFileSync(file.path, 'utf8') !== file.content)
    .map((file) => relative(REPO_ROOT, file.path));
}

export function staleMessage(stale: readonly string[]): string {
  return (
    `Native generated files are out of date:\n${stale.map((p) => `  - ${p}`).join('\n')}\n` +
    `Run: ${REGENERATE_COMMAND}`
  );
}
