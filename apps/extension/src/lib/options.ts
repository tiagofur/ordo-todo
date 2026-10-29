import { storage } from 'wxt/utils/storage';

export interface ExtensionOptions {
  /** Proyecto para la captura contextual; null/undefined = express. */
  defaultProjectId?: string | null;
  /** 'auto' usa el idioma del navegador. */
  language?: 'auto' | 'es' | 'en' | 'pt-br';
}

const optionsItem = storage.defineItem<ExtensionOptions>('sync:ordoOptions', {
  fallback: {},
});

export async function getOptions(): Promise<ExtensionOptions> {
  return optionsItem.getValue();
}

export async function saveOptions(patch: ExtensionOptions): Promise<void> {
  const current = await optionsItem.getValue();
  await optionsItem.setValue({ ...current, ...patch });
}
