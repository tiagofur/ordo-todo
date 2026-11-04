/**
 * Declared-dependencies audit (ODD 035).
 *
 * The production image prunes devDependencies (`npm prune --omit=dev`).
 * Any package imported at runtime by `apps/backend/src` must therefore be
 * declared in `apps/backend/package.json` dependencies: hoisted transitive
 * packages (e.g. `uuid` via `@ordo-todo/core`, `cron` via
 * `@nestjs/schedule`) work in dev but vanish from the pruned image and crash
 * the container with MODULE_NOT_FOUND.
 *
 * This spec scans every non-spec source file and fails listing any runtime
 * import that is neither a declared dependency, a Node.js builtin, a
 * relative/path-alias import, nor a documented type-only exception.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { builtinModules } from 'node:module';
import { join } from 'node:path';

const SRC_DIR = __dirname;
const BACKEND_PKG = join(SRC_DIR, '..', 'package.json');

/**
 * Packages imported with `import type` (or only in type positions) are
 * erased at compile time, so the pruned image never requires them.
 * Each entry here was verified type-only on the date above.
 */
const TYPE_ONLY_EXCEPTIONS = new Set([
  'express', // `import type { Request, Response }`
  'ms', // `import type { StringValue }`
  'passport-oauth2', // `import { VerifyCallback }` used only as a type
]);

function packageNameOf(specifier: string): string {
  if (specifier.startsWith('@')) {
    const [scope, name] = specifier.split('/');
    return `${scope}/${name}`;
  }
  return specifier.split('/')[0];
}

function collectSourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectSourceFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      out.push(full);
    }
  }
  return out;
}

describe('declared runtime dependencies audit', () => {
  it('every runtime import resolves to a declared dependency or builtin', () => {
    const pkg = JSON.parse(readFileSync(BACKEND_PKG, 'utf8')) as {
      dependencies?: Record<string, string>;
    };
    const declared = new Set(Object.keys(pkg.dependencies ?? {}));
    const builtins = new Set([
      ...builtinModules.map((m) => m.replace(/^node:/, '')),
      ...builtinModules,
    ]);

    const undeclared = new Map<string, string[]>();
    for (const file of collectSourceFiles(SRC_DIR)) {
      if (file.endsWith('.spec.ts')) {
        continue;
      }
      const lines = readFileSync(file, 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('import type ')) {
          continue;
        }
        const match =
          trimmed.match(/from\s+['"]([^'"]+)['"]/) ??
          trimmed.match(/require\(\s*['"]([^'"]+)['"]\s*\)/) ??
          trimmed.match(/import\(\s*['"]([^'"]+)['"]\s*\)/);
        if (!match) {
          continue;
        }
        const specifier = match[1];
        if (
          specifier.startsWith('.') ||
          specifier.startsWith('@/') ||
          specifier.startsWith('node:')
        ) {
          continue;
        }
        const name = packageNameOf(specifier);
        if (declared.has(name) || builtins.has(name)) {
          continue;
        }
        if (TYPE_ONLY_EXCEPTIONS.has(name)) {
          continue;
        }
        const list = undeclared.get(name) ?? [];
        list.push(file.replace(`${SRC_DIR}/`, ''));
        undeclared.set(name, list);
      }
    }

    expect(
      [...undeclared.entries()].map(
        ([name, files]) =>
          `${name} (imported by ${files.length} file(s), e.g. ${files[0]}): ` +
          `add it to apps/backend/package.json dependencies`,
      ),
    ).toEqual([]);
  });
});
