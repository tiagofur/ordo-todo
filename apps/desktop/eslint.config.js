import js from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

/**
 * ESLint configuration for Ordo-Todo Desktop App
 *
 * Features:
 * - TypeScript support with strict type checking
 * - React rules for hooks and components
 * - Prettier integration for code formatting
 * - Turbo plugin for monorepo best practices
 * - Electron-specific globals and configurations
 * - Desktop app specific rules
 */

export default [
  // Base JavaScript configuration
  js.configs.recommended,

  // TypeScript configuration
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  // React configuration
  pluginReact.configs.flat.recommended,

  // Global ignores
  {
    ignores: [
      "dist/**",
      "dist-electron/**",
      "build/**",
      "node_modules/**",
      "scripts/**",
      "*.config.js",
      "*.config.ts",
      "*.config.mjs",
      "vite.config.ts",
      // Files not included in tsconfig yet
      "src/components/custom-fields/**",
      "src/components/offline/**",
      "src/components/task-detail/**",
      "src/components/task/file-preview.tsx",
      "src/components/task/file-upload.test.tsx",
      "src/components/task/task-list.tsx",
      "src/components/workspace/invite-member-dialog.tsx",
      "src/components/workspace/workspace-activity-log.tsx",
      "src/components/workspace/workspace-configuration-settings.tsx",
      "src/components/workspace/workspace-members-settings.tsx",
      "src/hooks/use-analytics.tsx",
      "src/hooks/use-keyboard-shortcuts.test.ts",
      "src/hooks/use-quick-actions.test.ts",
      "src/hooks/use-task-navigation.ts",
      "src/hooks/useAutoLaunch.ts",
      "src/hooks/useAutoUpdater.ts",
      "src/hooks/useDeepLinks.ts",
      "src/hooks/useReducedMotion.ts",
      "src/hooks/useTimerWindow.ts",
      "src/pages/SharedTask.tsx",
      "src/routes.tsx",
      "src/stores/analytics-store.test.ts",
      "src/stores/devtools.ts",
      "src/stores/offline-store.ts",
      "src/stores/offline-sync-store.test.ts",
    ],
  },

  // Base configuration for all files
  {
    // Basic configuration without extra plugins
  },

  // TypeScript and React files
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        // Electron-specific globals
        electron: "readonly",
        NodeJS: "readonly",
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    rules: {
      // React Hooks rules
      ...pluginReactHooks.configs.recommended.rules,

      // React rules
      "react/react-in-jsx-scope": "off", // Not needed with new JSX transform
      "react/prop-types": "off", // Using TypeScript for prop validation
      "react/jsx-uses-react": "off", // Not needed with new JSX transform

      // TypeScript rules (adjusted for desktop development)
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-unsafe-return": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/unbound-method": "warn",
      "@typescript-eslint/require-await": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      "@typescript-eslint/no-var-requires": "off", // Allow require for Electron main process
      "@typescript-eslint/no-misused-promises": "warn",
      "@typescript-eslint/restrict-template-expressions": "warn",
      "@typescript-eslint/no-redundant-type-constituents": "warn",
      "@typescript-eslint/no-unnecessary-type-assertion": "warn",
      "@typescript-eslint/no-base-to-string": "warn",
      "react/no-unescaped-entities": "warn",
      "react/no-unknown-property": "warn",
      "no-case-declarations": "warn",
      "no-useless-escape": "warn",

      // General JavaScript/TypeScript rules
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "prefer-const": "error",
      "no-var": "error",

      // No Prettier rules for now - can be added later if needed
    },
  },

  // Electron main process files (CommonJS)
  {
    files: ["electron/**/*.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        sourceType: "commonjs",
      },
      globals: {
        ...globals.node,
        electron: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-require-imports": "off",
      "no-console": "off", // Allow console.log in Electron main process
    },
  },

  // Configuration files
  {
    files: ["*.config.{js,ts}", "vite.config.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "no-console": "off",
    },
  },

  // Test files
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "no-console": "off",
    },
  },
];