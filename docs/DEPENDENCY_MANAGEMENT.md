# Dependency Management Guide

This document outlines best practices and guidelines for managing dependencies in the Ordo-Todo monorepo.

## Table of Contents

- [Security Policy](#security-policy)
- [Automated Dependency Updates](#automated-dependency-updates)
- [Version Consistency](#version-consistency)
- [Dependency Selection Guidelines](#dependency-selection-guidelines)
- [Common Operations](#common-operations)
- [Troubleshooting](#troubleshooting)

---

## Security Policy

### Automated Security Audits

This project uses GitHub Actions to automatically scan for security vulnerabilities:

- **Frequency:** Weekly (every Monday) + on every push/PR
- **Workflow:** `.github/workflows/security-audit.yml`
- **Action Required:** Critical/High vulnerabilities will fail PR checks

### Manual Security Audits

```bash
# Check for security vulnerabilities
npm audit

# Fix automatically fixable vulnerabilities
npm audit fix

# View detailed vulnerability information
npm audit --json
```

### Severity Levels

| Severity | Action Required |
|----------|----------------|
| 🔴 **Critical** | Immediate update required - blocks PR merges |
| 🟠 **High** | Update within 7 days - blocks PR merges |
| 🟡 **Moderate** | Update within 30 days - warning only |
| 🔵 **Low** | Update at next convenient time |

---

## Automated Dependency Updates

### Dependabot Configuration

Dependabot is configured to automatically check for dependency updates:

- **Location:** `.github/dependabot.yml`
- **Schedule:** Weekly updates every Monday at 9:00 AM UTC
- **PR Limit:** 5-10 PRs per workspace to avoid overwhelming maintainers
- **Versioning Strategy:** `increase` - allows minor and patch updates

### Handling Dependabot PRs

1. **Review the PR**: Check changelog and breaking changes
2. **Run tests locally**: Ensure nothing breaks
3. **Check bundle size**: For frontend dependencies, verify no significant size increase
4. **Merge promptly**: Security updates should be merged within 24-48 hours

```bash
# After merging Dependabot PR, update locally
git checkout main
git pull origin main
npm install
npm run test
npm run build
```

---

## Version Consistency

### Monorepo Version Alignment

Maintain consistent versions across the monorepo for these critical dependencies:

| Package | Web | Backend | Mobile | Desktop | Packages |
|---------|-----|---------|--------|---------|----------|
| React | 19.2.0 | N/A | 19.2.0 | 19.2.0 | 19.2.0 (peer) |
| React-DOM | 19.2.0 | N/A | 19.2.0 | 19.2.0 | 19.2.0 (peer) |
| TypeScript | 5.9.3 | 5.9.3 | 5.9.3 | 5.9.3 | 5.9.3 |
| Prisma | N/A | 7.1.0 | N/A | N/A | 7.1.0 |
| @prisma/client | N/A | 7.1.0 | N/A | N/A | 7.1.0 |
| @tanstack/react-query | 5.90.11 | N/A | 5.90.11 | 5.90.11 | 5.90.11 (peer) |

### Checking Version Consistency

```bash
# Check for version mismatches across workspaces
npm list <package-name>

# Check for outdated packages
npm outdated

# Check specific workspace
npm outdated --workspace=@ordo-todo/web
```

---

## Dependency Selection Guidelines

### Choosing Dependencies

Before adding a new dependency, consider:

1. **Bundle Size**: Check on [bundlephobia.com](https://bundlephobia.com)
2. **Maintenance**: Last update, active issues, GitHub stars
3. **Tree-Shaking**: Prefer ES modules (look for `.mjs` or `module` field)
4. **TypeScript Support**: Native TypeScript or `@types/*` availability
5. **Alternatives**: Compare with similar packages

### Preferred Alternatives

| ❌ Avoid | ✅ Prefer | Reason |
|---------|----------|--------|
| `lodash` | `lodash-es` | Tree-shaking support |
| `moment` | `date-fns` | Smaller bundle, immutable |
| `bcryptjs` | `bcrypt` | Native performance (backend) |
| `@tabler/icons-vue` | `lucide-react` | Wrong framework |
| `uuid` (old) | `crypto.randomUUID()` | Native API |

### Package.json Structure

```json
{
  "dependencies": {
    // Runtime dependencies only
  },
  "devDependencies": {
    // Build tools, testing, linting
  },
  "peerDependencies": {
    // Required by consumers (for packages)
  }
}
```

**Root package.json Rule:**
- ❌ NO runtime `dependencies` in root
- ✅ Only `devDependencies` (prettier, turbo, typescript)

---

## Common Operations

### Adding a Dependency

```bash
# To a specific app
npm install <package> --workspace=@ordo-todo/web

# To a specific package
npm install <package> --workspace=@ordo-todo/core

# Dev dependency
npm install -D <package> --workspace=@ordo-todo/web

# To all workspaces
npm install <package> --workspaces
```

### Removing a Dependency

```bash
# From specific workspace
npm uninstall <package> --workspace=@ordo-todo/web

# From root
npm uninstall <package>
```

### Updating Dependencies

```bash
# Update specific package across all workspaces
npm update <package> --workspaces

# Update all packages in specific workspace
npm update --workspace=@ordo-todo/web

# Update to specific version
npm install <package>@<version> --workspace=@ordo-todo/web
```

### Checking for Updates

```bash
# Check all outdated packages
npm outdated

# Check specific workspace
npm outdated --workspace=@ordo-todo/web

# Interactive update (requires npm-check-updates)
npx npm-check-updates
npx npm-check-updates -u  # Update package.json
npm install
```

---

## Troubleshooting

### Common Issues

#### 1. Dependency Resolution Conflicts

```bash
# Clear all node_modules and reinstall
rm -rf node_modules package-lock.json
rm -rf apps/*/node_modules apps/*/package-lock.json
rm -rf packages/*/node_modules packages/*/package-lock.json
npm install
```

#### 2. Prisma Engine Download Failures

```bash
# Ignore checksum validation (CI environments)
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npm install

# Or add to .npmrc
echo "prisma_engines_checksum_ignore_missing=true" >> .npmrc
```

#### 3. Electron Download Failures

Network issues with Electron download are common in restricted environments:

```bash
# Use Electron mirror (China)
export ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
npm install
```

#### 4. Version Mismatch Errors

```bash
# Find which package is causing the conflict
npm list <package-name>

# Force resolution in root package.json
{
  "overrides": {
    "<package-name>": "^1.2.3"
  }
}
```

#### 5. Peer Dependency Warnings

```bash
# Install missing peer dependencies
npm install <peer-dep> --workspace=<workspace>

# Or suppress warnings (not recommended)
npm install --legacy-peer-deps
```

---

## Best Practices Checklist

- [ ] Run `npm audit` before committing
- [ ] Check bundle size impact for frontend dependencies
- [ ] Update all instances when updating shared dependencies
- [ ] Test thoroughly after major version updates
- [ ] Document breaking changes in PR description
- [ ] Merge security updates within 24-48 hours
- [ ] Keep root package.json free of runtime dependencies
- [ ] Use workspace protocol (`"*"`) for internal packages
- [ ] Prefer specific versions over ranges for production apps
- [ ] Always commit `package-lock.json`

---

## Resources

- [npm Workspaces Documentation](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- [Dependabot Configuration](https://docs.github.com/en/code-security/dependabot)
- [npm audit Documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Bundlephobia](https://bundlephobia.com/) - Check bundle sizes
- [npm-check-updates](https://github.com/raineorshine/npm-check-updates) - Interactive updates

---

## Maintenance Schedule

| Task | Frequency | Owner |
|------|-----------|-------|
| Review Dependabot PRs | Daily | Team |
| Manual `npm outdated` check | Weekly | Tech Lead |
| Major version updates | Monthly | Team |
| Security audit review | Weekly (automated) | CI/CD |
| Dependency cleanup | Quarterly | Tech Lead |

---

**Last Updated:** 2025-12-15
**Version:** 1.0.0
