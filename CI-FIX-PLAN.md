# GitHub Actions CI Failures - Comprehensive Fix Plan

**Date**: 2026-01-04
**Repository**: tiagofur/ordo-todo
**Status**: CRITICAL - All Workflows Failing

---

## Executive Summary

All GitHub Actions workflows (CI, Security Audit, Deploy) are failing due to **package-lock.json desynchronization**. The root cause is multiple dependencies being upgraded in `package.json` files without regenerating the lockfile.

### Primary Issue
```
npm ci can only install packages when your package.json and package-lock.json are in sync
```

### Missing Dependencies (from CI logs)
- `react-test-renderer@18.3.1` (root package.json expects 19.2.0)
- `vitest@3.2.4` → expects `4.0.16` (latest)
- `@vitest/coverage-v8@3.2.4` → expects `4.0.16`
- `@vitest/ui@3.2.4` → expects `4.0.16`
- `jsdom@26.1.0` → expects `27.4.0`
- Plus 200+ other missing transitive dependencies

---

## Current Dependency Matrix

### Core Framework Versions

| Platform | Current | Latest Compatible | Status |
|----------|---------|-------------------|--------|
| **React (Web/Desktop)** | 19.2.0 | 19.2.3 | ✅ Compatible |
| **React (Mobile)** | 18.3.1 | 18.3.1 | ⚠️ Outdated |
| **Next.js (Web)** | 16.0.9 / 16.1.1 | 16.1.1 | ⚠️ Version Mismatch |
| **React Native** | 0.76.9 | 0.76.9 | ✅ Latest Stable |
| **Expo** | 52.0.0 | 52.0.0 | ✅ Latest Stable |
| **Electron** | 39.2.4 | 39.2.4 | ✅ Latest Stable |
| **NestJS** | 11.1.9 | 11.1.9 | ✅ Latest Stable |
| **Prisma** | 7.2.0 | 7.2.0 | ✅ Latest Stable |
| **Vitest** | 3.2.4 | 4.0.16 | ⚠️ Major Upgrade Needed |
| **Node.js** | 20.x | 20.x | ✅ Compatible |

---

## Detailed Breakdown by App/Package

### 1. Root Package (`/package.json`)

**Current Issues:**
```json
{
  "devDependencies": {
    "react-test-renderer": "^19.2.0"  // ❌ Lockfile has 18.3.1
  },
  "dependencies": {
    "next": "^16.1.1",                 // ⚠️ Web has 16.0.9
    "@prisma/client": "^7.1.0"         // ⚠️ Backend has 7.2.0
  }
}
```

**Required Changes:**
- Upgrade `react-test-renderer` to match React 19.2.x
- Align `next` version across workspace
- Align `@prisma/client` version to 7.2.0

---

### 2. Web App (`apps/web/package.json`)

**Current Issues:**
```json
{
  "dependencies": {
    "next": "^16.0.9",                 // ⚠️ Root has 16.1.1
    "@next/eslint-plugin-next": "^15.5.6", // ❌ Should be 16.x
    "eslint-config-next": "^16.0.6",   // ✅ OK
    "react": "^19.2.0",                // ✅ OK
    "react-dom": "^19.2.0"             // ✅ OK
  },
  "devDependencies": {
    "@next/eslint-plugin-next": "^16.0.6", // ✅ OK (duplicate)
    "vitest": "^4.0.15"                // ✅ Latest
  }
}
```

**Next.js 16 Compatibility with React 19:**
- ✅ **Next.js 16 officially supports React 19.2**
- Released October 2025
- Source: [Next.js 16 Announcement](https://nextjs.org/blog/next-16)

**Required Changes:**
- Upgrade `next` to `^16.1.1` (match root)
- Remove duplicate `@next/eslint-plugin-next@15.5.6`

---

### 3. Backend App (`apps/backend/package.json`)

**Current Issues:**
```json
{
  "dependencies": {
    "@nestjs/common": "^11.1.9",       // ✅ Latest
    "@prisma/client": "^7.2.0",        // ✅ Latest (root has 7.1.0)
    "prisma": "^7.1.0"                 // ⚠️ Should be 7.2.0
  }
}
```

**Prisma 7 + NestJS Compatibility:**
- ⚠️ **Prisma 7 has breaking changes** (released Nov 18, 2025)
- Changes to Prisma config file structure
- Source: [Prisma 7 Release](https://www.prisma.io/blog/announcing-prisma-orm-7-0-0)
- Source: [Prisma + NestJS Issues](https://www.prisma.io/nestjs)

**Required Changes:**
- Upgrade `prisma` devDependency to `^7.2.0`
- Verify Prisma config compatibility

---

### 4. Desktop App (`apps/desktop/package.json`)

**Current Issues:**
```json
{
  "dependencies": {
    "react": "^19.2.0",                // ✅ OK
    "react-dom": "^19.2.0",            // ✅ OK
    "electron": "39.2.4"               // ✅ Latest Stable
  },
  "devDependencies": {
    "vitest": "^4.0.15"                // ✅ Latest
  }
}
```

**Electron 39 + React 19 Compatibility:**
- ✅ **Electron 39 compatible with React 19** (no direct restrictions)
- Electron bundles Chromium 142+
- React runs in renderer process (web environment)
- Source: [Electron Release Timelines](https://electronjs.org/docs/latest/tutorial/electron-timelines)

**Required Changes:**
- None major, version alignment only

---

### 5. Mobile App (`apps/mobile/package.json`)

**Current Issues:**
```json
{
  "dependencies": {
    "expo": "~52.0.0",                 // ✅ Latest
    "react": "18.3.1",                 // ⚠️ Desktop/Web use 19.2.0
    "react-native": "0.76.9",          // ✅ Latest Stable
    "react-native-web": "~0.19.10"     // ⚠️ Root has 0.21.2
  },
  "devDependencies": {
    "react-test-renderer": "^18.3.1",  // ⚠️ Root expects 19.2.0
    "vitest": "^4.0.16"                // ✅ Latest
  }
}
```

**Expo 52 + React Native 0.76 Compatibility:**
- ✅ **Expo 52 officially supports React Native 0.76-0.77**
- Released November 12, 2024
- New Architecture (Fabric/TurboModules) enabled by default
- iOS deployment target: 15.1+ (up from 13.4)
- Source: [Expo SDK 52 Announcement](https://expo.dev/changelog/2024-11-12-sdk-52)
- Source: [React Native 0.76 Release](https://reactnative.dev/blog/2024/10/23/release-0.76-new-architecture)

**React Version Constraint:**
- ⚠️ **Expo 52 DOES NOT support React 19** (React Native 0.76 requires React 18.3.1)
- React 19 support is planned for future Expo SDK versions

**Required Changes:**
- Keep React 18.3.1 for mobile (platform constraint)
- Document version split in README

---

### 6. Shared Packages

#### packages/ui
```json
{
  "devDependencies": {
    "@vitest/ui": "^3.2.4",           // ⚠️ Should be 4.0.16
    "vitest": "^3.2.4"                // ⚠️ Should be 4.0.16
  }
}
```

#### packages/hooks
```json
{
  "devDependencies": {
    "@vitest/coverage-v8": "^3.2.4",  // ⚠️ Should be 4.0.16
    "vitest": "^3.2.4",                // ⚠️ Should be 4.0.16
    "jsdom": "^26.1.0"                 // ⚠️ Should be 27.4.0
  }
}
```

#### packages/stores
```json
{
  "devDependencies": {
    "@vitest/coverage-v8": "^3.2.4",  // ⚠️ Should be 4.0.16
    "vitest": "^3.2.4",                // ⚠️ Should be 4.0.16
    "jsdom": "^26.1.0"                 // ⚠️ Should be 27.4.0
  }
}
```

**Vitest 4.0 Changes:**
- ✅ **Vitest 4.0 compatible with React 19**
- Released October 22, 2025
- Breaking changes: Browser provider configuration
- Source: [Vitest 4.0 Announcement](https://vitest.dev/blog/vitest-4)
- Source: [Vitest Migration Guide](https://vitest.dev/guide/migration.html)

---

## Root Cause Analysis

### Why package-lock.json is Out of Sync

1. **Manual package.json edits** - Dependencies were upgraded in `package.json` files without running `npm install`
2. **Workspace version conflicts** - Different apps have different versions of the same package
3. **Transitive dependency cascade** - Upgrading vitest from 3.x to 4.x updates 200+ nested packages
4. **React version split** - Mobile (React 18) vs Web/Desktop (React 19) causes peer dependency warnings

### CI Workflow Analysis

All workflows use `npm ci` which:
- Requires exact lockfile synchronization
- Fails if `package.json` ≠ `package-lock.json`
- Does NOT update lockfile (unlike `npm install`)

Workflows affected:
1. **CI** (`.github/workflows/ci.yml`) - All jobs fail at `npm ci`
2. **Security Audit** - Fails at dependency installation
3. **Deploy** - Fails before deployment steps

---

## Comprehensive Upgrade Plan

### Phase 1: Fix Immediate CI Failures (CRITICAL)

**Objective**: Regenerate lockfile to match current package.json

```bash
# 1. Clean all dependencies
rm -rf node_modules package-lock.json
rm -rf apps/*/node_modules packages/*/node_modules

# 2. Clear npm cache
npm cache clean --force

# 3. Reinstall with workspace protocol
npm install --legacy-peer-deps

# 4. Verify lockfile
git diff package-lock.json
```

**Why `--legacy-peer-deps`?**
- Resolves React 18/19 peer dependency conflicts
- Mobile uses React 18.3.1, web/desktop use React 19.2.0
- Prevents peer dependency warnings from blocking installation

---

### Phase 2: Standardize Versions Across Workspace

**Order of Operations:**

1. **Root Dependencies**
   ```json
   {
     "dependencies": {
       "@prisma/client": "^7.2.0",  // Align with backend
       "next": "^16.1.1"            // Keep, latest
     },
     "devDependencies": {
       "react-test-renderer": "^19.2.0",  // Match web/desktop
       "vitest": "^4.0.16",         // Match packages
       "jsdom": "^27.4.0"           // Match packages
     }
   }
   ```

2. **Web App (`apps/web`)**
   ```bash
   npm install next@^16.1.1 @next/eslint-plugin-next@^16.1.1 --workspace=@ordo-todo/web
   ```

3. **Backend (`apps/backend`)**
   ```bash
   npm install prisma@^7.2.0 --save-dev --workspace=@ordo-todo/backend
   ```

4. **Shared Packages**
   ```bash
   # For each package (ui, hooks, stores)
   npm install vitest@^4.0.16 @vitest/coverage-v8@^4.0.16 @vitest/ui@^4.0.16 jsdom@^27.4.0 --workspace=@ordo-todo/[package]
   ```

---

### Phase 3: Address React Version Split

**Problem**: Mobile (Expo 52) requires React 18.3.1, but web/desktop use React 19.2.0

**Solution**: Document and accept version split

```json
// Root package.json - Add peer dependency
{
  "peerDependencies": {
    "react": "^18.3.1 || ^19.0.0"
  }
}
```

**Mobile App** (`apps/mobile/package.json`):
```json
{
  "dependencies": {
    "react": "18.3.1"  // Pin to 18.3.1 (Expo 52 requirement)
  }
}
```

**Web/Desktop Apps**:
```json
{
  "dependencies": {
    "react": "^19.2.0"  // Use React 19
  }
}
```

**Documentation Update**:
Add to `README.md`:
```markdown
## React Version Note

- **Web/Desktop**: React 19.2.0 (latest)
- **Mobile**: React 18.3.1 (Expo SDK 52 constraint)
```

---

### Phase 4: Upgrade Testing Stack

**Vitest 3.x → 4.0 Migration:**

1. Update all packages:
   ```bash
   npm install vitest@^4.0.16 @vitest/coverage-v8@^4.0.16 @vitest/ui@^4.0.16 -w
   ```

2. Check breaking changes:
   - Browser provider config changes
   - Source: [Vitest 4.0 Migration Guide](https://vitest.dev/guide/migration.html)

3. Update test configs if needed:
   - Check `vitest.config.ts` files
   - Verify browser mode configuration

---

### Phase 5: Verify Prisma 7 Compatibility

**Prisma 6 → 7 Breaking Changes:**

1. Update Prisma CLI version:
   ```bash
   npm install prisma@^7.2.0 -D -w
   ```

2. Check Prisma config (`packages/db/prisma/schema.prisma`):
   - No more `'classic'` engine option
   - New config structure

3. Regenerate Prisma client:
   ```bash
   cd packages/db
   npx prisma generate
   ```

4. Test migrations:
   ```bash
   npx prisma migrate dev
   ```

---

### Phase 6: Final Lockfile Regeneration

After all version updates:

```bash
# 1. Clean everything
rm -rf node_modules package-lock.json
rm -rf apps/*/node_modules packages/*/node_modules webpage/*/node_modules

# 2. Fresh install
npm install --legacy-peer-deps

# 3. Verify versions
npm list react
npm list next
npm list vitest
npm list @prisma/client

# 4. Commit new lockfile
git add package-lock.json
git commit -m "fix: regenerate package-lock.json with updated dependencies"
```

---

## Expected Compatibility Matrix (After Fix)

| Dependency | Version | Platform | Compatible |
|------------|---------|----------|------------|
| **React** | 19.2.3 | Web, Desktop, Root | ✅ |
| **React** | 18.3.1 | Mobile | ✅ (Expo constraint) |
| **Next.js** | 16.1.1 | Web, Webpage | ✅ |
| **React Native** | 0.76.9 | Mobile | ✅ |
| **Expo** | 52.0.0 | Mobile | ✅ |
| **Electron** | 39.2.4 | Desktop | ✅ |
| **NestJS** | 11.1.9 | Backend | ✅ |
| **Prisma** | 7.2.0 | All (via packages/db) | ✅ |
| **Vitest** | 4.0.16 | All (testing) | ✅ |
| **Node.js** | 20.x | CI/Local | ✅ |
| **jsdom** | 27.4.0 | Testing | ✅ |

---

## Step-by-Step Execution Plan

### Step 1: Emergency CI Fix (Do Immediately)
```bash
# Regenerate lockfile to match current package.json
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps

# Commit and push
git add package-lock.json
git commit -m "fix: sync package-lock.json with package.json"
git push origin main
```

**Expected Result**: CI workflows should pass installation step

---

### Step 2: Align Next.js Version (Post-CI)
```bash
# Upgrade web app Next.js
npm install next@^16.1.1 @next/eslint-plugin-next@^16.1.1 --workspace=@ordo-todo/web

# Regenerate lockfile
npm install --legacy-peer-deps

# Commit
git add package-lock.json apps/web/package.json
git commit -m "fix: align Next.js to 16.1.1 across workspace"
```

---

### Step 3: Upgrade Vitest to 4.0 (Post-CI)
```bash
# Upgrade all vitest packages
npm install vitest@^4.0.16 @vitest/coverage-v8@^4.0.16 @vitest/ui@^4.0.16 jsdom@^27.4.0 -w

# Regenerate lockfile
npm install --legacy-peer-deps

# Test
npm run test

# Commit
git add package-lock.json
git commit -m "chore: upgrade vitest to 4.0.16"
```

---

### Step 4: Align Prisma Versions (Post-CI)
```bash
# Upgrade root Prisma
npm install @prisma/client@^7.2.0 -w

# Upgrade backend Prisma CLI
npm install prisma@^7.2.0 -D --workspace=@ordo-todo/backend

# Regenerate client
cd packages/db && npx prisma generate && cd ../..

# Test backend
cd apps/backend && npm run test && cd ../..

# Commit
git add package-lock.json
git commit -m "chore: align Prisma to 7.2.0"
```

---

### Step 5: Document React Split (Post-CI)
```bash
# Update README
cat >> README.md << 'EOF'

## React Version Notes

This monorepo uses different React versions per platform due to ecosystem constraints:

- **Web/Desktop**: React 19.2.0 (latest, with Next.js 16 and Electron 39)
- **Mobile**: React 18.3.1 (Expo SDK 52 requirement, React Native 0.76 constraint)

This split is intentional and necessary for compatibility with:
- Expo SDK 52 (requires React 18.3.1)
- Next.js 16 (supports React 19.2.0)
- Electron 39 (supports React 19.2.0)

All shared packages (`packages/ui`, `packages/hooks`, etc.) use `peerDependencies` with version ranges:
```json
"peerDependencies": {
  "react": "^18.3.1 || ^19.0.0"
}
```
EOF

git add README.md
git commit -m "docs: document React version split across platforms"
```

---

## Validation Checklist

After applying fixes, verify:

- [ ] `npm ci` succeeds (no sync errors)
- [ ] `npm run lint` passes
- [ ] `npm run check-types` passes
- [ ] `npm run test` passes (all workspaces)
- [ ] `npm run build` succeeds (all apps)
- [ ] CI workflow passes
- [ ] Security audit workflow passes
- [ ] Deploy workflow succeeds
- [ ] No peer dependency warnings (except expected React split)

---

## Alternative Approaches (If Issues Persist)

### Option A: Use npm install Instead of npm ci

**Change workflows** from:
```yaml
- name: Install dependencies
  run: npm ci
```

To:
```yaml
- name: Install dependencies
  run: npm install --legacy-peer-deps
```

**Pros**: More forgiving, handles version mismatches
**Cons**: Slower, not reproducible (violates CI best practices)

### Option B: Downgrade Vitest to 3.x (Temporary)

If Vitest 4.0 has compatibility issues:
```bash
npm install vitest@^3.2.4 -w
```

**Rollback plan**: Keep Vitest 3.x until React 19 support stabilizes

### Option C: Wait for Expo React 19 Support

If mobile React 19 support is critical:
- Wait for Expo SDK 53 (Q2 2026?)
- Or use Expo Modules API to override React version
- Source: [Expo Roadmap](https://expo.dev/changelog)

---

## Estimated Timeline

| Phase | Time | Complexity |
|-------|------|------------|
| Phase 1: Lockfile Regen | 15 min | Low |
| Phase 2: Version Alignment | 30 min | Medium |
| Phase 3: React Split Doc | 15 min | Low |
| Phase 4: Vitest Upgrade | 1 hour | Medium (test updates) |
| Phase 5: Prisma Verify | 30 min | Medium |
| Phase 6: Final Regen | 15 min | Low |
| **Total** | **2.5-3 hours** | **Medium** |

---

## Post-Fix Monitoring

After CI is fixed:

1. **Watch for Dependabot PRs** - Dependencies will continue updating
2. **Automate lockfile updates** - Consider using Renovate or Dependabot
3. **Pre-commit hooks** - Add package-lock.json validation
4. **CI improvements** - Add lockfile diff check in workflow

---

## References & Sources

### Official Documentation
- [Next.js 16 Release](https://nextjs.org/blog/next-16) - React 19.2 compatibility
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Expo SDK 52 Changelog](https://expo.dev/changelog/2024-11-12-sdk-52) - React Native 0.76 support
- [React Native 0.76 Release](https://reactnative.dev/blog/2024/10/23/release-0.76-new-architecture) - New Architecture
- [Electron 39 Release](https://electronjs.org/blog/electron-39-0) - Latest stable
- [Prisma 7 Release](https://www.prisma.io/blog/announcing-prisma-orm-7-0-0) - Rust-free client
- [Prisma + NestJS Integration](https://www.prisma.io/nestjs) - Official guide
- [Vitest 4.0 Release](https://vitest.dev/blog/vitest-4) - Visual regression testing
- [Vitest Migration Guide](https://vitest.dev/guide/migration.html) - Breaking changes

### Community Resources
- [npm ci Sync Issues](https://github.com/npm/cli/issues/8777) - Known bugs
- [npm install vs npm ci](https://dev.to/rameshpvr/npm-i-vs-npm-ci-49i9) - Best practices
- [Vitest Performance Issue](https://github.com/vitest-dev/vitest/issues/8808) - v3 to v4 slowdown

---

## Conclusion

The CI failures are **100% fixable** by regenerating `package-lock.json`. The root cause is dependency drift from manual `package.json` edits without running `npm install`.

**Critical Path**: Phase 1 (lockfile regen) → CI passes
**Full Fix**: Phases 1-6 → All versions aligned, future-proof

**Risk Level**: Low
**Estimated Time**: 2.5-3 hours total (15 min for emergency fix)

**Recommendation**: Start with Phase 1 immediately, then complete remaining phases incrementally.

---

**Generated**: 2026-01-04
**Author**: Claude Code Investigation
**Status**: Ready for Execution
