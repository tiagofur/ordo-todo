/**
 * i18n Provider for Mobile
 * 
 * Wraps the app with i18next provider and handles language detection.
 * Must be initialized at the root level of the app.
 * 
 * @example
 * ```tsx
 * // In _layout.tsx
 * import { I18nProvider } from '@/providers/i18n-provider';
 * 
 * export default function RootLayout() {
 *   return (
 *     <I18nProvider>
 *       <Stack />
 *     </I18nProvider>
 *   );
 * }
 * ```
 */

import { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../lib/i18n';

interface I18nProviderProps {
  children: ReactNode;
}

/**
 * I18n Provider component
 * Initializes i18next and provides translation context to the app
 */
export function I18nProvider({ children }: I18nProviderProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // i18n is already initialized in the lib/i18n.ts import
    // We just need to wait for it to be ready
    if (i18n.isInitialized) {
      setIsReady(true);
    } else {
      i18n.on('initialized', () => {
        setIsReady(true);
      });
    }

    return () => {
      i18n.off('initialized');
    };
  }, []);

  // We can render immediately since i18n.init() is synchronous
  // The isReady state is just for safety
  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}

export default I18nProvider;
