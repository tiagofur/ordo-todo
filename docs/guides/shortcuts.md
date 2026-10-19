# Canonical shortcuts map

> Source of truth for keyboard shortcuts and the command palette (ODD 007).
> Verified against real code — every entry below names its implementation.
> If code and this doc disagree, the doc is wrong: fix the doc, not the code.

## Quick Add (S2)

| Action | Shortcut | Where |
|---|---|---|
| Open Quick-Add | `N` (outside inputs) or `Cmd/Ctrl+N` | `apps/web/src/hooks/use-keyboard-shortcuts.ts` |
| Create task | `Enter` | `packages/ui/src/components/task/quick-add.tsx` |
| Cycle inferred fields | `Tab` | `packages/ui/src/components/task/quick-add.tsx` (chips are tabbable) |
| Dismiss | `Esc` or backdrop click | `packages/ui/src/components/task/quick-add.tsx` |

Desktop: `Cmd/Ctrl+N` opens the same flow (`apps/desktop`, ODD 007 C4).
Mobile: FAB / share text (ODD 007 C5).

## Command palette (S3)

`Cmd/Ctrl+K` everywhere in web (`apps/web/src/components/shared/command-palette.tsx`,
mounted in `app-layout.tsx`). Same 8 canonical actions on web and desktop:

| # | Action id | What it does |
|---|---|---|
| 1 | `go-dashboard` | Go to dashboard |
| 2 | `go-tasks` | Go to tasks |
| 3 | `go-projects` | Go to projects |
| 4 | `go-calendar` | Go to calendar |
| 5 | `new-task` | Open Quick-Add |
| 6 | `new-project` | Open the new-project dialog |
| 7 | `start-timer` | Start a WORK timer |
| 8 | `search` | Open search (dispatches `ordo:open-search`) |

Behavior: type to filter, `Enter` runs the first match, `Esc`/backdrop
click closes, filter resets on every open. Labels are translated
(`CommandPalette` keys in `packages/i18n/src/locales/*.json`).

## Global map (web)

| Shortcut | Action | Implementation |
|---|---|---|
| `N` | New task (quick) | `use-keyboard-shortcuts.ts` (skipped inside inputs) |
| `Cmd/Ctrl+N` | New task | `use-keyboard-shortcuts.ts` → `QuickAddDialog` |
| `Cmd/Ctrl+Shift+N` | New project dialog | `use-keyboard-shortcuts.ts` → `/projects?action=new` |
| `Cmd/Ctrl+K` | Command palette | `use-keyboard-shortcuts.ts` → `CommandPalette` |
| `Cmd/Ctrl+G` | Go to dashboard | `use-keyboard-shortcuts.ts` |
| `Cmd/Ctrl+Shift+T` | Go to tasks | `use-keyboard-shortcuts.ts` |
| `Cmd/Ctrl+Shift+P` | Go to projects | `use-keyboard-shortcuts.ts` |
| `Cmd/Ctrl+,` | Go to settings | `use-keyboard-shortcuts.ts` |
| `Cmd/Ctrl+Shift+M` | Go to meetings | `use-keyboard-shortcuts.ts` |
| `Cmd/Ctrl+Shift+W` | Go to wellbeing | `use-keyboard-shortcuts.ts` |
| `Cmd/Ctrl+B` | Toggle sidebar | `use-keyboard-shortcuts.ts` |
| `Shift+?` | Show shortcuts help | `use-keyboard-shortcuts.ts` → `KeyboardShortcutsHelp` |
| `Esc` | Close dialog / cancel | Per dialog (`QuickAdd`, `CommandPalette`) |

In-app help mirrors this table (`apps/web/src/components/shortcuts/keyboard-shortcuts-help.tsx`).

## Notes

- **Cmd vs Ctrl**: `Cmd` on Mac, `Ctrl` elsewhere. The hook treats both
  the same (`event.ctrlKey || event.metaKey`).
- **Bare `N`**: only fires when the focus is NOT in an input, textarea,
  or content-editable element (guarded in the hook).
- **`?action=new`**: read client-side by the projects page
  (`apps/web/src/app/[locale]/(pages)/projects/page.tsx`); used by the
  palette and the `Cmd/Ctrl+Shift+N` shortcut.
- **`ordo:open-search`**: custom `document` event from the palette's
  `search` action; the TopBar listens and opens SmartSearch
  (`apps/web/src/components/shared/topbar.tsx`).
- **No `V` views / `Space` focus keys**: ODD 007 proposed them, but they
  don't exist in the code — deliberately NOT documented here.
