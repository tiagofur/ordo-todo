# Quick Fix for GitHub Actions CI Failures

**Problem**: All CI workflows fail with `package-lock.json` out of sync error

**Solution**: Regenerate lockfile (15 minutes)

---

## Emergency Fix (Do This First)

```bash
# Step 1: Clean dependencies
rm -rf node_modules package-lock.json
rm -rf apps/*/node_modules packages/*/node_modules webpage/*/node_modules

# Step 2: Clear npm cache
npm cache clean --force

# Step 3: Reinstall with legacy peer deps (resolves React 18/19 conflict)
npm install --legacy-peer-deps

# Step 4: Commit and push
git add package-lock.json
git commit -m "fix: regenerate package-lock.json to sync with package.json"
git push origin main
```

**Expected Result**: CI workflows should pass installation step ✅

---

## Why This Works

- **Root Cause**: Dependencies in `package.json` were upgraded but `package-lock.json` wasn't updated
- **CI Behavior**: `npm ci` requires exact match between `package.json` and `package-lock.json`
- **Fix**: `npm install` regenerates lockfile to match current `package.json`

---

## Why `--legacy-peer-deps`?

Mobile app uses React 18.3.1 (Expo 52 requirement), while web/desktop use React 19.2.0. This flag prevents peer dependency warnings from blocking installation.

---

## After CI Passes

Complete the remaining upgrades (see `CI-FIX-PLAN.md` for full details):

1. Align Next.js to 16.1.1
2. Upgrade Vitest to 4.0.16
3. Align Prisma to 7.2.0
4. Document React version split

---

## Check Versions

```bash
# Verify key versions
npm list react
npm list next
npm list vitest
npm list @prisma/client
```

Expected output:
- React: 18.3.1 (mobile) || 19.2.0 (web/desktop)
- Next.js: 16.1.1
- Vitest: 4.0.16
- Prisma: 7.2.0

---

## Validation

After the fix, ensure:
- [ ] CI workflow passes
- [ ] Security audit passes
- [ ] Deploy workflow succeeds
- [ ] No peer dependency warnings (except React split)

---

## Need More Details?

See full analysis: `CI-FIX-PLAN.md`

**Time Required**: 15 minutes
**Risk Level**: Low
**Impact**: Unblocks all CI workflows
