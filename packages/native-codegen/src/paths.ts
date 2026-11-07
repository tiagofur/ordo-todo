import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

/** Monorepo root, resolved from this file (packages/native-codegen/src). */
export const REPO_ROOT = fileURLToPath(new URL('../../../', import.meta.url));

export const LOCALES_DIR = join(REPO_ROOT, 'packages/i18n/src/locales');

export const ANDROID_APP_DIR = join(REPO_ROOT, 'apps/native/android/app/src/main');
export const ANDROID_THEME_DIR = join(ANDROID_APP_DIR, 'java/dev/creapolis/ordotodo/ui/theme');
export const ANDROID_RES_DIR = join(ANDROID_APP_DIR, 'res');

/** Command that regenerates every native output; quoted in headers and stale-file errors. */
export const REGENERATE_COMMAND = 'npm run generate -w @ordo-todo/native-codegen';
