import { beforeEach, describe, expect, it } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { getOptions, saveOptions } from '../src/lib/options';

beforeEach(async () => {
  await fakeBrowser.reset();
});

describe('options (ODD 024 S5)', () => {
  it('empieza vacío y persiste en storage.sync', async () => {
    expect(await getOptions()).toEqual({});

    await saveOptions({ defaultProjectId: 'proj-42', language: 'es' });

    expect(await getOptions()).toEqual({ defaultProjectId: 'proj-42', language: 'es' });
    // storage.sync de verdad (legible fuera del módulo)
    const raw = await fakeBrowser.storage.sync.get('ordoOptions');
    expect(raw.ordoOptions.language).toBe('es');
  });

  it('saveOptions hace merge sin perder claves previas', async () => {
    await saveOptions({ language: 'pt-br' });
    await saveOptions({ defaultProjectId: 'p1' });

    expect(await getOptions()).toEqual({ language: 'pt-br', defaultProjectId: 'p1' });
  });
});
