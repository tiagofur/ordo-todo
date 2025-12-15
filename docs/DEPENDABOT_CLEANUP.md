# Dependabot Cleanup Guide

This guide helps you clean up the initial burst of Dependabot PRs and manage them going forward.

## 🚨 Initial Problem

When Dependabot was first enabled, it created **48+ PRs** because it found many outdated packages. The new configuration has been optimized to prevent this in the future.

---

## 🧹 How to Clean Up Existing Dependabot PRs

### Option 1: Close All Dependabot PRs at Once (Recommended for Now)

Use GitHub CLI to close all Dependabot PRs in bulk:

```bash
# Close all open Dependabot PRs
gh pr list --author "dependabot[bot]" --json number --jq '.[].number' | \
  xargs -I {} gh pr close {} --comment "Closing in favor of manual dependency audit PR"

# Or close and delete branches
gh pr list --author "dependabot[bot]" --json number --jq '.[].number' | \
  xargs -I {} gh pr close {} --delete-branch --comment "Closing - will handle in batch"
```

### Option 2: Close Specific Categories

Close PRs by label or pattern:

```bash
# Close only patch/minor updates
gh pr list --label "dependencies" --json number,title | \
  jq -r '.[] | select(.title | contains("Bump")) | .number' | \
  xargs -I {} gh pr close {}

# Close only development dependencies
gh pr list --label "dependencies" --json number,title | \
  jq -r '.[] | select(.title | contains("devDependencies")) | .number' | \
  xargs -I {} gh pr close {}
```

### Option 3: Manual Cleanup via GitHub UI

1. Go to: `https://github.com/YOUR_USERNAME/ordo-todo/pulls`
2. Filter by: `is:pr is:open author:app/dependabot`
3. Select all (checkbox at top)
4. Click "Close pull request" button
5. Optionally delete branches

---

## 🎯 What Changed in the New Configuration

### Before (Problematic):
```yaml
schedule:
  interval: "weekly"  # Too frequent!
open-pull-requests-limit: 5-10  # Too many PRs!
# No grouping - each package = separate PR
```

### After (Optimized):
```yaml
schedule:
  interval: "monthly"  # Much less frequent
  time: "02:00"  # Runs at 2 AM UTC (off-hours)
open-pull-requests-limit: 1-3  # Maximum 1-3 PRs per workspace
groups:  # Multiple packages grouped into single PR
  nextjs-ecosystem:  # All Next.js updates in 1 PR
  ui-libraries:      # All UI updates in 1 PR
  testing-tools:     # All testing updates in 1 PR
```

### Key Improvements:

| Aspect | Before | After |
|--------|--------|-------|
| **Frequency** | Weekly (52/year) | Monthly (12/year) |
| **Max PRs** | 5-10 per workspace | 1-3 per workspace |
| **Grouping** | None (1 PR per package) | Grouped by ecosystem |
| **Expected PRs/month** | 40-80 PRs | 10-20 PRs |
| **Run time** | Business hours | 2 AM UTC (off-hours) |

---

## 📋 Expected PR Structure (After Cleanup)

With the new configuration, you'll receive **grouped PRs** like:

### Apps:
- `chore(web): bump nextjs-ecosystem` - All Next.js + React updates
- `chore(web): bump ui-libraries` - All Radix UI + Tailwind updates
- `chore(web): bump testing-tools` - All testing dependencies
- `chore(backend): bump nestjs-ecosystem` - All NestJS updates
- `chore(backend): bump database` - Prisma + PostgreSQL updates

### Packages:
- `chore(core): bump all-dependencies` - All core package updates
- `chore(ui): bump radix-ui` - All Radix UI components
- `chore(ui): bump ui-utilities` - Other UI utilities

**Total: 10-15 PRs per month** instead of 40-80 per week!

---

## 🔧 How to Handle Future Dependabot PRs

### 1. Review Grouped PRs Monthly

On the first Monday of each month (after 2 AM UTC), review:

```bash
# List this month's Dependabot PRs
gh pr list --author "dependabot[bot]" --json number,title,labels

# Review a specific PR
gh pr view 123
```

### 2. Automated Testing

All Dependabot PRs trigger CI automatically:
- ✅ Security audit
- ✅ Build tests
- ✅ Type checking
- ✅ Lint checks

**Only merge if all checks pass!**

### 3. Merge Strategy

```bash
# Merge a Dependabot PR (if tests pass)
gh pr merge 123 --squash --delete-branch

# Merge multiple PRs at once
gh pr list --author "dependabot[bot]" --json number | \
  jq -r '.[].number' | \
  xargs -I {} gh pr merge {} --squash --delete-branch
```

### 4. When to Ignore/Close

Close Dependabot PRs if:
- ❌ Breaking changes in major version updates
- ❌ Tests are failing
- ❌ Known issues with the new version
- ❌ Not critical for your project

---

## ⏸️ Temporarily Pause Dependabot

If you need a break from Dependabot PRs:

### Option 1: Via GitHub UI
1. Go to: `Settings` → `Security` → `Dependabot`
2. Click "Pause" next to "Dependabot version updates"

### Option 2: Delete/Rename the Config
```bash
# Temporarily disable
mv .github/dependabot.yml .github/dependabot.yml.disabled

# Re-enable later
mv .github/dependabot.yml.disabled .github/dependabot.yml
```

### Option 3: Set Schedule to "Never"
```yaml
schedule:
  interval: "monthly"
  # Add this line to pause
  # You can also comment out specific ecosystems
```

---

## 📊 Monitoring Dependabot Activity

### Dashboard Commands

```bash
# Count open Dependabot PRs
gh pr list --author "dependabot[bot]" --json number | jq length

# See PR titles and labels
gh pr list --author "dependabot[bot]" --json number,title,labels

# Check failed CI runs
gh run list --workflow=ci.yml --status=failure

# View recent Dependabot activity
gh pr list --author "dependabot[bot]" --state all --limit 20
```

---

## 🎯 Recommended Workflow

### After This Initial Cleanup:

1. **Week 1**: Close all existing Dependabot PRs
2. **Week 2-4**: Focus on merging your main dependency audit PR
3. **Month 1**: Review first batch of grouped Dependabot PRs
4. **Ongoing**: Handle 10-15 grouped PRs monthly

### Monthly Routine (10 minutes):

```bash
# 1. List Dependabot PRs
gh pr list --author "dependabot[bot]"

# 2. Check CI status
gh pr checks 123  # For each PR

# 3. Merge if all green
gh pr merge 123 --squash --delete-branch

# 4. Close if not needed
gh pr close 123 --comment "Not needed right now"
```

---

## 💡 Best Practices

1. **Don't merge all at once** - Review in batches
2. **Prioritize security updates** - Check labels for "security"
3. **Test locally first** - For critical dependencies
4. **Read changelogs** - Especially for major updates
5. **Monitor after merge** - Watch for issues in production

---

## 🔗 Quick Commands Reference

```bash
# Close all Dependabot PRs
gh pr list --author "dependabot[bot]" --json number --jq '.[].number' | xargs -I {} gh pr close {}

# Count Dependabot PRs
gh pr list --author "dependabot[bot]" | wc -l

# Merge all passing PRs
gh pr list --author "dependabot[bot]" --json number,statusCheckRollup | \
  jq -r '.[] | select(.statusCheckRollup[0].state == "SUCCESS") | .number' | \
  xargs -I {} gh pr merge {} --squash --delete-branch

# View Dependabot config
cat .github/dependabot.yml
```

---

## ❓ FAQ

**Q: Will Dependabot recreate closed PRs?**
A: Not until the next scheduled run (monthly at 2 AM UTC first Monday).

**Q: Can I disable specific workspaces?**
A: Yes, comment out or remove sections from `.github/dependabot.yml`.

**Q: What if I want weekly updates for security only?**
A: Add `open-pull-requests-limit: 1` and filter by security labels.

**Q: How do I know which PRs are security-related?**
A: Dependabot adds a "security" label to PRs fixing vulnerabilities.

---

**Last Updated:** 2025-12-15
**Configuration:** `.github/dependabot.yml`
**Monitoring:** GitHub Actions → Dependabot tab
