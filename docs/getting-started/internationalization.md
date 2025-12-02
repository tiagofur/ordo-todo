# Internationalization (i18n) Guide

## Overview

Ordo-Todo uses `next-intl` for internationalization across all web applications. This guide covers best practices, implementation patterns, and how to add new languages.

## Supported Languages

- **English (en)** - Default language
- **Spanish (es)** - Español
- **Portuguese (pt-BR)** - Português (Brasil)

## Architecture

### Message Files Location

All translation files are stored in:
```
apps/web/messages/
├── en.json
├── es.json
└── pt-br.json
```

### Configuration

The i18n configuration is set up in `apps/web/src/i18n/`:

**`navigation.ts`** - Routing configuration:
```typescript
import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
    locales: ['en', 'es', 'pt-br'],  // Add new locales here
    defaultLocale: 'es'
});

export const { Link, redirect, usePathname, useRouter } =
    createNavigation(routing);
```

**`request.ts`** - Message loading:
```typescript
import { getRequestConfig } from 'next-intl/server';
import { routing } from './navigation';

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;

    // Ensure that a valid locale is used
    if (!locale || !routing.locales.includes(locale as any)) {
        locale = routing.defaultLocale;
    }

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default
    };
});
```

**Important**: After adding a new locale to `navigation.ts`, you must restart the development server for changes to take effect.

## Implementation Best Practices

### 1. Component Translation Pattern

Always use the `useTranslations` hook with a namespace:

```typescript
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('MyComponent');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

### 2. Message File Structure

Organize translations by component namespace:

```json
{
  "MyComponent": {
    "title": "My Title",
    "description": "My description",
    "nested": {
      "key": "Nested value"
    }
  }
}
```

### 3. Accessing Nested Keys

Use dot notation for nested translations:

```typescript
const t = useTranslations('MyComponent');
return <span>{t('nested.key')}</span>;
```

### 4. Dynamic Values

Use placeholders for dynamic content:

```json
{
  "greeting": "Hello, {name}!"
}
```

```typescript
t('greeting', { name: userName })
```

### 5. Pluralization

Handle plural forms correctly:

```json
{
  "items": {
    "zero": "No items",
    "one": "One item",
    "other": "{count} items"
  }
}
```

```typescript
t('items', { count: itemCount })
```

### 6. Date and Time Formatting

Use `next-intl` formatting utilities:

```typescript
import { useFormatter } from 'next-intl';

const format = useFormatter();
const formattedDate = format.dateTime(date, {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
```

## Adding a New Language

Follow these steps to add support for a new language:

### Step 1: Create Message File

1. Copy the English message file to create a new language file:
   ```bash
   cp apps/web/messages/en.json apps/web/messages/[locale].json
   ```
   
   For example, for French:
   ```bash
   cp apps/web/messages/en.json apps/web/messages/fr.json
   ```

2. Translate all strings in the new file to the target language

### Step 2: Update Routing Configuration

Add the new locale to `apps/web/src/i18n/navigation.ts`:

```typescript
export const routing = defineRouting({
    locales: ['en', 'es', 'pt-br', 'fr'],  // Add your new locale here
    defaultLocale: 'es'
});
```

**Important**: The locale name in the `locales` array must match the message file name (without `.json`).

### Step 3: Restart Development Server

After updating the routing configuration, you **must** restart the development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

The new locale will not work until the server is restarted.

### Step 4: Test Translations

1. Navigate to `http://localhost:3000/[locale]/` to test the new language
   - Example: `http://localhost:3000/fr/` for French
   
2. Verify all components render correctly with the new translations

3. Check for:
   - Missing translation keys
   - Layout issues with longer/shorter text
   - Date and number formatting
   - Pluralization rules

### Step 5: Update Documentation

If adding a new language, update:
- `README.md` - Add to supported languages list
- `docs/getting-started/internationalization.md` - Add to supported languages
- `docs/getting-started/QUICKSTART.md` - Update i18n section

### Common Locale Codes

- `en` - English
- `es` - Spanish
- `pt-br` - Portuguese (Brazil)
- `fr` - French
- `de` - German
- `it` - Italian
- `ja` - Japanese
- `zh-cn` - Chinese (Simplified)
- `ar` - Arabic (requires RTL support)

## Translation Workflow

### For New Components

1. **Extract all hardcoded strings** from the component
2. **Create a namespace** in the message files (en.json, es.json, pt-br.json)
3. **Add translation keys** with descriptive names
4. **Import `useTranslations`** in the component
5. **Replace hardcoded strings** with `t('key')` calls
6. **Test in all languages**

### Example Workflow

**Before:**
```typescript
export function TaskCard() {
  return (
    <div>
      <h2>Task Details</h2>
      <button>Save</button>
      <button>Cancel</button>
    </div>
  );
}
```

**After:**

1. Add to `en.json`:
```json
{
  "TaskCard": {
    "title": "Task Details",
    "save": "Save",
    "cancel": "Cancel"
  }
}
```

2. Add to `es.json`:
```json
{
  "TaskCard": {
    "title": "Detalles de la Tarea",
    "save": "Guardar",
    "cancel": "Cancelar"
  }
}
```

3. Add to `pt-br.json`:
```json
{
  "TaskCard": {
    "title": "Detalhes da Tarefa",
    "save": "Salvar",
    "cancel": "Cancelar"
  }
}
```

4. Update component:
```typescript
import { useTranslations } from 'next-intl';

export function TaskCard() {
  const t = useTranslations('TaskCard');
  
  return (
    <div>
      <h2>{t('title')}</h2>
      <button>{t('save')}</button>
      <button>{t('cancel')}</button>
    </div>
  );
}
```

## Common Patterns

### Optional Props with Fallback

Allow components to accept custom text while providing translated defaults:

```typescript
interface Props {
  title?: string;
  description?: string;
}

export function Dialog({ title, description }: Props) {
  const t = useTranslations('Dialog');
  
  return (
    <div>
      <h2>{title || t('defaultTitle')}</h2>
      <p>{description || t('defaultDescription')}</p>
    </div>
  );
}
```

### Toast Notifications

Translate toast messages:

```typescript
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

const t = useTranslations('Notifications');

toast.success(t('saveSuccess'), {
  description: t('saveSuccessDescription')
});
```

### Form Validation

Translate validation messages:

```typescript
const schema = z.object({
  email: z.string().email(t('validation.invalidEmail')),
  password: z.string().min(8, t('validation.passwordTooShort'))
});
```

## Naming Conventions

### Namespace Names

- Use **PascalCase** for component namespaces: `TaskCard`, `UserProfile`
- Use **camelCase** for feature namespaces: `authentication`, `dashboard`

### Translation Keys

- Use **camelCase** for keys: `title`, `description`, `saveButton`
- Use descriptive names: `emptyStateMessage` instead of `message1`
- Group related keys: `validation.required`, `validation.invalid`

### File Organization

Keep message files organized:

```json
{
  "ComponentName": {
    "section1": {
      "title": "...",
      "description": "..."
    },
    "section2": {
      "title": "...",
      "description": "..."
    },
    "buttons": {
      "save": "...",
      "cancel": "...",
      "delete": "..."
    }
  }
}
```

## Testing Translations

### Manual Testing

1. Switch between languages in the UI
2. Verify all text displays correctly
3. Check for layout issues with longer translations
4. Test RTL languages if applicable

### Automated Testing

Check for missing translations:

```bash
# Compare keys between language files
node scripts/check-translations.js
```

## Common Issues and Solutions

### Issue: Missing Translation Key

**Error:** `Translation key not found: ComponentName.missingKey`

**Solution:** Add the key to all language files

### Issue: Hydration Mismatch

**Error:** Text content does not match server-rendered HTML

**Solution:** Ensure translations are loaded on both server and client

### Issue: Dynamic Content Not Updating

**Problem:** Translations don't update when locale changes

**Solution:** Ensure you're using `useTranslations` hook, not importing messages directly

## Performance Considerations

1. **Lazy load translations** for large applications
2. **Use namespaces** to split translations into smaller chunks
3. **Avoid inline translations** in loops - extract to constants
4. **Cache formatted dates/numbers** when possible

## Migration Guide

### Converting Existing Components

1. **Identify all user-facing strings**
2. **Create translation keys** in all language files
3. **Import `useTranslations`**
4. **Replace strings** with `t()` calls
5. **Test thoroughly**

### Bulk Migration Script

For large-scale migrations, consider creating a script to:
- Extract strings from components
- Generate translation keys
- Update component files

## Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [CLDR Plural Rules](https://cldr.unicode.org/index/cldr-spec/plural-rules)

## Contributing

When adding new features:

1. ✅ Add translations for **all supported languages**
2. ✅ Use **descriptive translation keys**
3. ✅ Follow the **established patterns**
4. ✅ Test in **all languages**
5. ✅ Update this documentation if adding new patterns
