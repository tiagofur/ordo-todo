import { describe, expect, it } from 'vitest';
import { buildMenuTaskPayload } from '../src/lib/menu';

const TAB = { title: 'PR #449 · ordo-todo', url: 'https://github.com/x/y' };

describe('buildMenuTaskPayload (ODD 024 S3)', () => {
  it('selección → título = selectionText, descripción = URL de página', () => {
    const payload = buildMenuTaskPayload(
      { menuItemId: 'ordo-add-task', selectionText: 'Revisar el guard', pageUrl: 'https://github.com/x/y/files' },
      TAB,
    );
    expect(payload).toEqual({
      title: 'Revisar el guard',
      description: 'https://github.com/x/y/files',
      projectId: null,
    });
  });

  it('enlace → título de pestaña, descripción = linkUrl', () => {
    const payload = buildMenuTaskPayload(
      { menuItemId: 'ordo-add-task', linkUrl: 'https://example.com/doc', pageUrl: 'https://github.com/x/y' },
      TAB,
    );
    expect(payload?.title).toBe('PR #449 · ordo-todo');
    expect(payload?.description).toBe('https://example.com/doc');
  });

  it('enlace sin título de pestaña cae a la URL del enlace', () => {
    const payload = buildMenuTaskPayload(
      { menuItemId: 'ordo-add-task', linkUrl: 'https://example.com/doc', pageUrl: 'https://github.com/x/y' },
      { title: '', url: '' },
    );
    expect(payload?.title).toBe('https://example.com/doc');
  });

  it('página → título + URL de la pestaña', () => {
    const payload = buildMenuTaskPayload(
      { menuItemId: 'ordo-add-task', pageUrl: 'https://github.com/x/y' },
      TAB,
    );
    expect(payload).toEqual({
      title: 'PR #449 · ordo-todo',
      description: 'https://github.com/x/y',
      projectId: null,
    });
  });

  it('usa el proyecto por defecto de opciones si existe', () => {
    const payload = buildMenuTaskPayload(
      { menuItemId: 'ordo-add-task', selectionText: 'S' },
      TAB,
      'proj-42',
    );
    expect(payload?.projectId).toBe('proj-42');
  });

  it('sin nada útil devuelve null', () => {
    expect(buildMenuTaskPayload({ menuItemId: 'x' }, { title: '', url: '' })).toBeNull();
  });
});
