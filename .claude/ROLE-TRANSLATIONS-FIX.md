# Role Translations Fix

**Date:** 2025-12-27
**Status:** ✅ Fixed

---

## Problem

The "Owner" role translation was missing in the `InviteMemberDialog` section for all three languages (English, Spanish, and Portuguese Brazilian).

When inviting a member to a workspace, the role dropdown would show "admin", "member", and "viewer" options, but was missing the "owner" option translation.

---

## Solution

Added the `"owner"` translation key to the `InviteMemberDialog.roles` section in all three language files.

### Files Modified

1. **packages/i18n/src/locales/en.json**
   - Added `"owner": "Creator"` to `InviteMemberDialog.roles`

2. **packages/i18n/src/locales/es.json**
   - Added `"owner": "Creador"` to `InviteMemberDialog.roles`

3. **packages/i18n/src/locales/pt-br.json**
   - Added `"owner": "Criador"` to `InviteMemberDialog.roles`

4. **packages/i18n/dist/locales/*.json** (built files)
   - All source files copied to dist after build

---

## Translations Added

### English (en.json)
```json
"roles": {
  "owner": "Creator",
  "admin": "Admin",
  "member": "Member",
  "viewer": "Viewer"
}
```

### Spanish (es.json)
```json
"roles": {
  "owner": "Creador",
  "admin": "Admin",
  "member": "Miembro",
  "viewer": "Visualizador"
}
```

### Portuguese Brazilian (pt-br.json)
```json
"roles": {
  "owner": "Criador",
  "admin": "Admin",
  "member": "Membro",
  "viewer": "Visualizador"
}
```

---

## Context

There are **two** places where role translations exist in the i18n files:

1. **WorkspaceMembersSettings.roles** - Already had all translations ✅
   - Used in the members list to display role badges
   - Located at line ~966 in en.json

2. **InviteMemberDialog.roles** - Was missing "owner" ❌ → ✅ Fixed
   - Used in the invite member dialog dropdown
   - Located at line ~935 in en.json

Both sections now have complete translations for all roles: **owner, admin, member, viewer**.

---

## Usage

The translations are used in:

1. **apps/web/src/components/workspace/workspace-members-settings.tsx** (line 82-85)
   ```typescript
   const getRoleLabel = (role: string): string => {
     const key = role.toLowerCase() as "owner" | "admin" | "member" | "viewer";
     return t(`roles.${key}`); // Uses WorkspaceMembersSettings.roles
   };
   ```

2. **InviteMemberDialog component**
   - Uses `InviteMemberDialog.roles.*` for the role dropdown options

---

## Verification

```bash
✅ npm run build -- --filter=@ordo-todo/i18n  # PASSED
✅ All JSON files validated
✅ All 3 languages have complete role translations
```

---

## Related Files

- Translation source: `packages/i18n/src/locales/*.json`
- Built translations: `packages/i18n/dist/locales/*.json`
- Component using translations: `apps/web/src/components/workspace/workspace-members-settings.tsx`
- Platform-agnostic component: `packages/ui/src/components/workspace/workspace-members-settings.tsx`
