<<<<<<< HEAD
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

/**
 * ESLint configuration for Ordo-Todo Web App (Next.js 16)
 *
 * Features:
 * - TypeScript support with strict type checking
 * - React rules for hooks and components
 * - Next.js specific rules
 * - Turbo plugin for monorepo best practices
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
      "build/**",
      "node_modules/**",
      ".next/**",
      "out/**",
      "scripts/**",
      "*.config.js",
      "*.config.ts",
      "*.config.mjs",
    ],
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
=======
// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "public/**",
      "scripts/**",
      "*.config.js",
      "*.config.mjs",
      "*.config.ts",
      "migration-helper.js",
      ".test-setup.tsx",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      "@next/next": nextPlugin,
      "react": reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
>>>>>>> 369e5be5e7078c39eb391ce85b27fb8aefcb732e
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
<<<<<<< HEAD
=======
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@next/next/no-img-element": "warn",
      "@next/next/no-html-link-for-pages": "warn",
      "no-case-declarations": "warn",
    },
>>>>>>> 369e5be5e7078c39eb391ce85b27fb8aefcb732e
    settings: {
      react: {
        version: "detect",
      },
    },
<<<<<<< HEAD
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

      // TypeScript rules (adjusted for web development)
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

      // General JavaScript/TypeScript rules
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "prefer-const": "error",
      "no-var": "error",
    },
  },

  // Configuration files
  {
    files: ["*.config.{js,ts,mjs}"],
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
=======
  }
);
>>>>>>> 369e5be5e7078c39eb391ce85b27fb8aefcb732e
