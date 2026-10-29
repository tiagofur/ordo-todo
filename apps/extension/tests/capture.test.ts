import { describe, expect, it } from 'vitest';
import { buildPrefill } from '../src/lib/capture';

describe('buildPrefill (ODD 024 S2)', () => {
  it('título = título de la página; descripción = URL + selección', () => {
    const prefill = buildPrefill({
      title: 'PR #449 · ordo-todo',
      url: 'https://github.com/tiagofur/ordo-todo/pull/449',
      selection: 'El guard acotado acepta api full',
    });

    expect(prefill.initialTitle).toBe('PR #449 · ordo-todo');
    expect(prefill.initialDescription).toBe(
      'https://github.com/tiagofur/ordo-todo/pull/449\n\nEl guard acotado acepta api full',
    );
  });

  it('sin selección la descripción es solo la URL', () => {
    const prefill = buildPrefill({
      title: 'Artículo',
      url: 'https://example.com/a',
    });
    expect(prefill.initialDescription).toBe('https://example.com/a');
  });

  it('sin título cae al host de la URL; sin nada queda vacío', () => {
    expect(buildPrefill({ title: '', url: 'https://example.com/b' }).initialTitle).toBe(
      'https://example.com/b',
    );
    expect(buildPrefill({ title: '  ', url: '' })).toEqual({
      initialTitle: '',
      initialDescription: '',
    });
  });

  it('recorta espacios del título y la selección', () => {
    const prefill = buildPrefill({
      title: '  Título con espacios  ',
      url: ' https://e.com ',
      selection: '  nota  ',
    });
    expect(prefill.initialTitle).toBe('Título con espacios');
    expect(prefill.initialDescription).toBe('https://e.com\n\nnota');
  });
});
