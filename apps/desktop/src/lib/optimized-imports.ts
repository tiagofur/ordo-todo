/**
 * Optimized Imports Configuration
 *
 * Centralized import optimization for better tree-shaking and bundle size
 */

import { lazy, type ComponentType } from 'react';
// React imports - optimized
export {
  useState, useEffect, useCallback, useMemo, useRef,
  createContext, useContext, useReducer,
  Fragment, Suspense,
} from 'react';

export { lazy };

// React Router imports - tree-shakable
export {
  createBrowserRouter,
  RouterProvider,
  useNavigate,
  useLocation,
  useParams,
  Navigate
} from 'react-router-dom';

// Zustand imports - minimal
export { create } from 'zustand';
export type { StateCreator } from 'zustand';

// TanStack Query imports - tree-shakable
export {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query';

// Date utilities - tree-shakable
export {
  format,
  formatDistanceToNow,
  formatRelative,
  addDays,
  subDays,
  startOfDay,
  endOfDay,
  isToday,
  isValid
} from 'date-fns';

// UI Components - optimized imports
export {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Progress,
  Alert,
  AlertDescription,
  Switch,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@ordo-todo/ui';

// Optimized API client imports
export {
  apiClient
} from '@/lib/api-client';

// Utility imports - tree-shakable
export { clsx } from 'clsx';
export { twMerge } from 'tailwind-merge';
export { cva } from 'class-variance-authority';

// Form and validation
export { useForm } from 'react-hook-form';
import { z } from 'zod';
export { z };

// Toast notifications
export { toast } from 'sonner';

// Internationalization
export { useTranslation } from 'react-i18next';

// Electron API - conditional import
export const electronAPI = typeof window !== 'undefined' && window.electronAPI
  ? window.electronAPI
  : null;

// Performance utilities
export const performance = {
  now: () => (typeof window !== 'undefined' ? window.performance.now() : Date.now()),
  mark: (name: string) => {
    if (typeof window !== 'undefined' && window.performance.mark) {
      window.performance.mark(name);
    }
  },
  measure: (name: string, startMark?: string, endMark?: string) => {
    if (typeof window !== 'undefined' && window.performance.measure) {
      return window.performance.measure(name, startMark, endMark);
    }
    return 0;
  }
};

// Environment detection
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';

// Platform detection
export const platform = {
  isElectron: typeof window !== 'undefined' && !!window.electronAPI,
  isWeb: typeof window !== 'undefined' && !window.electronAPI,
  isNode: typeof process !== 'undefined' && process.versions?.node,
};

// Constants for bundle optimization
export const LAZY_LOAD_THRESHOLD = 100000; // 100KB
export const CHUNK_SIZE = 50000; // 50KB chunks for code splitting

// Optimized chunk loader utility
export function createLazyChunk<T extends ComponentType<any>>(
  importer: () => Promise<{ default: T }>,
  chunkName?: string
) {
  return lazy(importer);
}

// Preload strategy for critical chunks
export function preloadChunks(chunkNames: string[]) {
  if (typeof window === 'undefined') return;

  chunkNames.forEach(chunkName => {
    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = `/assets/${chunkName}.js`;
    document.head.appendChild(link);
  });
}

// Bundle optimization utilities
export const bundleOptimization = {
  // Tree shaking utilities
  isUsed: (importPath: string, usedExports: Set<string>) => {
    // This would be used by build tools to determine if an export is used
    return true; // Placeholder
  },

  // Dead code elimination hints
  unused: (variable: any, reason: string) => {
    if (isDevelopment) {
      console.warn(`Unused variable detected: ${variable} - ${reason}`);
    }
  },

  // Bundle size tracking
  trackSize: (chunkName: string, size: number) => {
    if (isDevelopment) {
      console.log(`Chunk "${chunkName}" size: ${(size / 1024).toFixed(2)}KB`);
    }
  },
};