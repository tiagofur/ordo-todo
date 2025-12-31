# @ordo-todo/i18n

Shared internationalization package for Ordo-Todo applications.

Provides centralized translations for all supported languages (EN, ES, PT-BR) with utilities for format conversion between different i18n libraries.

## Features

- Single source of truth for all translations
- Support for 3 languages: English, Spanish, Portuguese (Brazil)
- Type-safe translation keys
- Format conversion utilities (next-intl ↔ i18next)
- Nested translation structure
- Utilities for key flattening and path lookup

## Installation

```bash
npm install @ordo-todo/i18n
```

## Quick Start

### Next.js (Web App)

Web app uses next-intl with JSON format directly:

```typescript
// apps/web/src/i18n/request.ts
import { getRequestConfig } from "next-intl/server";
import { locales } from "@ordo-todo/i18n";

export default getRequestConfig(async ({ locale }) => ({
  messages: locales[locale as keyof typeof locales],
}));
```

```typescript
// apps/web/src/app/[locale]/page.tsx
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('Common');

  return <div>{t('welcome')}</div>;
}
```

### React Native (Mobile App)

Mobile app uses i18next with transformed format:

```typescript
// apps/mobile/app/lib/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { locales, transformTranslations, flattenKeys } from "@ordo-todo/i18n";

// Transform translations to i18next format
const resources = {
  en: {
    translation: flattenKeys(transformTranslations(locales.en, "i18next")),
  },
  es: {
    translation: flattenKeys(transformTranslations(locales.es, "i18next")),
  },
  "pt-br": {
    translation: flattenKeys(
      transformTranslations(locales["pt-br"], "i18next"),
    ),
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
```

```typescript
// apps/mobile/app/(tabs)/index.tsx
import { useTranslation } from 'react-i18next';

export default function HomeScreen() {
  const { t } = useTranslation();

  return <Text>{t('Common.welcome')}</Text>;
}
```

### Electron (Desktop App)

Desktop app uses i18next similar to mobile:

```typescript
// apps/desktop/src/i18n.ts
import i18n from "i18next";
import { locales, transformTranslations, flattenKeys } from "@ordo-todo/i18n";

const resources = {
  en: {
    translation: flattenKeys(transformTranslations(locales.en, "i18next")),
  },
  es: {
    translation: flattenKeys(transformTranslations(locales.es, "i18next")),
  },
  "pt-br": {
    translation: flattenKeys(
      transformTranslations(locales["pt-br"], "i18next"),
    ),
  },
};

i18n.init({
  resources,
  lng: "en",
  fallbackLng: "en",
});

export default i18n;
```

## Supported Locales

| Locale  | Name      | Region              |
| ------- | --------- | ------------------- |
| `en`    | English   | Global              |
| `es`    | Español   | Spain/Latin America |
| `pt-br` | Português | Brazil              |

## Available Translations

The package includes translations for all major features:

- **Common** - Shared labels, buttons, navigation
- **Auth** - Login, register, password reset
- **Workspace** - Workspaces, members, invitations
- **Project** - Projects, workflows, boards
- **Task** - Tasks, subtasks, priorities, statuses
- **Tag** - Tags and categorization
- **Timer** - Pomodoro timer, sessions
- **Analytics** - Reports, metrics, statistics
- **Habit** - Habit tracking
- **Goal** - Objectives, OKRs, key results
- **CustomFields** - Custom field types
- **Notifications** - Push notifications
- **Settings** - User preferences, app settings

## Utilities

### `transformTranslations(translations, format)`

Converts interpolation syntax between next-intl and i18next formats:

```typescript
import { transformTranslations } from "@ordo-todo/i18n";
import en from "@ordo-todo/i18n/locales/en";

// Convert to i18next format
const i18nextFormat = transformTranslations(en, "i18next");
// {var} becomes {{var}}

// Convert back to next-intl format
const nextIntlFormat = transformTranslations(i18nextFormat, "next-intl");
// {{var}} becomes {var}
```

### `convertInterpolation(text, format)`

Converts interpolation syntax for a single string:

```typescript
import { convertInterpolation } from "@ordo-todo/i18n";

const i18nextText = convertInterpolation("{name} has {count} tasks", "i18next");
// "{{name}} has {{count}} tasks"

const nextIntlText = convertInterpolation(
  "{{name}} has {{count}} tasks",
  "next-intl",
);
// "{name} has {count} tasks"
```

### `flattenKeys(translations, prefix, separator)`

Flattens nested translation objects to dot-notation keys:

```typescript
import { flattenKeys } from "@ordo-todo/i18n";

const flat = flattenKeys({
  Settings: {
    title: "Settings",
    theme: {
      light: "Light",
    },
  },
});

// Result:
// {
//   "Settings.title": "Settings",
//   "Settings.theme.light": "Light"
// }
```

### `getByPath(translations, path)`

Gets translation value by dot-notation path:

```typescript
import { getByPath } from "@ordo-todo/i18n";
import en from "@ordo-todo/i18n/locales/en";

const value = getByPath(en, "Settings.theme.light");
// "Light"
```

## Types

### `Dictionary`

Type representing the full structure of translations:

```typescript
import type { Dictionary } from "@ordo-todo/i18n";

function validateTranslation(
  key: string,
  value: string,
): value is Dictionary[keyof Dictionary] {
  return value in en;
}
```

### `SupportedLocale`

Union type of supported locales:

```typescript
import type { SupportedLocale } from "@ordo-todo/i18n";

function setLocale(locale: SupportedLocale) {
  // locale is 'en' | 'es' | 'pt-br'
}
```

## Adding New Translations

### 1. Add to English (Base)

```json
// packages/i18n/src/locales/en.json
{
  "NewFeature": {
    "title": "New Feature",
    "description": "Feature description",
    "actions": {
      "create": "Create",
      "edit": "Edit"
    }
  }
}
```

### 2. Translate to Spanish

```json
// packages/i18n/src/locales/es.json
{
  "NewFeature": {
    "title": "Nueva Funcionalidad",
    "description": "Descripción de la funcionalidad",
    "actions": {
      "create": "Crear",
      "edit": "Editar"
    }
  }
}
```

### 3. Translate to Portuguese

```json
// packages/i18n/src/locales/pt-br.json
{
  "NewFeature": {
    "title": "Nova Funcionalidade",
    "description": "Descrição da funcionalidade",
    "actions": {
      "create": "Criar",
      "edit": "Editar"
    }
  }
}
```

### 4. Use in Components

```typescript
// Web (next-intl)
const t = useTranslations("NewFeature");
console.log(t("title")); // "New Feature"
console.log(t("actions.create")); // "Create"

// Mobile/Desktop (i18next)
const { t } = useTranslation();
console.log(t("NewFeature.title")); // "New Feature"
console.log(t("NewFeature.actions.create")); // "Create"
```

## Interpolation

### Next.js Format

```typescript
// Translation
{
  "Task": {
    "createdBy": "Created by {name} at {date}"
  }
}

// Usage
const t = useTranslations('Task');
t('createdBy', { name: 'John', date: '2025-12-31' });
// "Created by John at 2025-12-31"
```

### i18next Format

```typescript
// Translation
{
  "Task": {
    "createdBy": "Created by {{name}} at {{date}}"
  }
}

// Usage
const { t } = useTranslation();
t('Task.createdBy', { name: 'John', date: '2025-12-31' });
// "Created by John at 2025-12-31"
```

### Plurals

**Next.js:**

```json
{
  "Task": {
    "count": "{count, plural, =0 {No tasks} =1 {One task} other {{count} tasks}}"
  }
}
```

**i18next:**

```json
{
  "Task": {
    "count_one": "One task",
    "count_other": "{{count}} tasks",
    "count_zero": "No tasks"
  }
}
```

## Validation

The project includes a validation script to check for missing translations:

```bash
# Validate all locales
npm run validate-translations

# Check output for missing keys
# ✅ All translations are complete
# ❌ Missing keys in es: Task.newField
```

## File Structure

```
packages/i18n/src/
├── locales/
│   ├── en.json        # English (base)
│   ├── es.json        # Spanish
│   └── pt-br.json     # Portuguese (Brazil)
├── index.ts           # Main exports
├── types.ts           # TypeScript types
└── utils.ts           # Utility functions
```

## Development

```bash
# Build the package
npm run build --filter=@ordo-todo/i18n

# Watch mode
cd packages/i18n && npm run dev

# Type check
npm run check-types --filter=@ordo-todo/i18n

# Validate translations
npm run validate-translations
```

## Related Documentation

- [SHARED-CODE-ARCHITECTURE.md](/docs/SHARED-CODE-ARCHITECTURE.md) - Architecture overview
- [Core Package](/packages/core/README.md) - Business logic
- [Hooks Package](/packages/hooks/README.md) - React Query hooks

## License

Part of the Ordo-Todo monorepo.
