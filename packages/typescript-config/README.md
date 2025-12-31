# @ordo-todo/typescript-config

Shared TypeScript configuration for Ordo-Todo monorepo.

Provides base TypeScript configs extended by Web, Mobile, Desktop, and packages.

## Installation

```bash
npm install -D @ordo-todo/typescript-config
```

## Usage

### Package Configuration

For shared packages:

```json
{
  "extends": "@ordo-todo/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### Next.js Configuration

For Next.js apps:

```json
{
  "extends": "@ordo-todo/typescript-config/nextjs.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### React Library Configuration

For React packages and desktop:

```json
{
  "extends": "@ordo-todo/typescript-config/react-library.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

## Configuration Files

### base.json

Base TypeScript configuration shared by all projects.

**Key Settings:**

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["es2022", "DOM", "DOM.Iterable"],
    "noUncheckedIndexedAccess": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

**Features:**

- **Strict Mode**: All strict type checking enabled
- **No Unchecked Indexed Access**: Prevents undefined errors on array/object access
- **Isolated Modules**: Ensures files can be compiled independently
- **Declarations**: Generates type definitions for packages
- **ES2022 Target**: Modern JavaScript features

### nextjs.json

Configuration for Next.js applications, extends `base.json`.

**Additional Settings:**

```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowJs": true,
    "jsx": "preserve",
    "noEmit": true
  }
}
```

**Features:**

- **Next.js Plugin**: Next.js type checking
- **Bundler Resolution**: Optimized for bundlers
- **Allow JS**: Enables JavaScript imports
- **Preserve JSX**: Keeps JSX for Next.js transformation
- **No Emit**: Next.js handles compilation

### react-library.json

Configuration for React libraries, extends `base.json`.

**Additional Settings:**

```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "react-jsx"
  }
}
```

**Features:**

- **React JSX**: Modern JSX transformation for React

## TypeScript Strict Mode

The base configuration enables all strict type checking options:

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true
}
```

**Enabled Checks:**

- `noImplicitAny` - Disallows implicit `any` types
- `strictNullChecks` - Enforces strict null checking
- `strictFunctionTypes` - Strict function type checking
- `strictBindCallApply` - Strict bind/call/apply checking
- `strictPropertyInitialization` - Strict property initialization
- `noImplicitThis` - Disallows implicit `this`
- `alwaysStrict` - Always use strict mode
- `noUnusedLocals` - Error on unused locals
- `noUnusedParameters` - Error on unused parameters
- `noImplicitReturns` - Error on implicit returns
- `noFallthroughCasesInSwitch` - Error on fallthrough cases

## Example Configurations

### Package Configuration

```json
{
  "extends": "@ordo-todo/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### Web App Configuration

```json
{
  "extends": "@ordo-todo/typescript-config/nextjs.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Mobile App Configuration

```json
{
  "extends": "@ordo-todo/typescript-config/base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowJs": true,
    "lib": ["es2022"],
    "types": ["react-native", "jest"]
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", "dist"]
}
```

### Desktop App Configuration

```json
{
  "extends": "@ordo-todo/typescript-config/react-library.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "types": ["electron", "node"]
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

## Path Aliases

Configure path aliases in `tsconfig.json`:

```json
{
  "extends": "@ordo-todo/typescript-config/nextjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@ordo-todo/*": ["../../packages/*/src"]
    }
  }
}
```

## Imports Pattern

### Packages

Use relative imports with `.js` extension in packages:

```typescript
// Correct
import { Button } from "../ui/button.js";
import { UserService } from "./user.service.js";

// Incorrect
import { Button } from "../ui/button";
import { UserService } from "./user.service";
```

### Apps

Import from workspace packages:

```typescript
// Correct
import { Button } from "@ordo-todo/ui";
import { useTasks } from "@/lib/hooks";
import { apiClient } from "@/lib/api-client";

// Incorrect
import { Button } from "../../packages/ui/src/components/ui/button";
import { useTasks } from "../hooks";
```

## Type Checking

Run type checking with:

```bash
# Type check all packages
npm run check-types

# Type check specific package
npm run check-types --filter=@ordo-todo/core

# Type check web app
npm run check-types --filter=@ordo-todo/web

# Type check mobile app
npm run check-types --filter=@ordo-todo/mobile

# Type check desktop app
npm run check-types --filter=@ordo-todo/desktop
```

## Common Issues

### No Unchecked Indexed Access

When accessing arrays or objects, TypeScript will enforce checking for `undefined`:

```typescript
// Error: Object is possibly 'undefined'
const firstItem = array[0];

// Fix: Use optional chaining
const firstItem = array[0];

// Or: Use non-null assertion (if you're sure it exists)
const firstItem = array[0]!;
```

### Strict Null Checks

Check for null/undefined before using values:

```typescript
// Error: Object is possibly 'null'
const email = user.email;

// Fix: Use optional chaining
const email = user?.email;

// Or: Check for null
if (user) {
  const email = user.email;
}
```

### Isolated Modules

Don't use module-level code that depends on other modules:

```typescript
// Incorrect: Module-level side effects
const value = calculateValue(); // Depends on other module

// Correct: Export function instead
function calculate() {
  return calculateValue();
}
```

## Development

```bash
# Build package
npm run build --filter=@ordo-todo/typescript-config

# Type check
npm run check-types --filter=@ordo-todo/typescript-config
```

## Related Documentation

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [tsconfig.json Schema](https://json.schemastore.org/tsconfig)
- [CLAUDE.md](/CLAUDE.md) - Project guidelines

## License

Part of the Ordo-Todo monorepo.
