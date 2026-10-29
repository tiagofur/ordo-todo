/// <reference types="@testing-library/jest-dom" />
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import '../src/i18n';
import App from '../entrypoints/popup/App';

// Contenedor aislado: captura y API mockeadas; auth real vía fakeBrowser.
vi.mock('../src/lib/capture', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/lib/capture')>();
  return {
    ...actual,
    getActivePageContext: vi.fn().mockResolvedValue({
      title: 'PR #449 · ordo-todo',
      url: 'https://github.com/tiagofur/ordo-todo/pull/449',
      selection: 'El guard acotado',
    }),
  };
});
vi.mock('../src/lib/api-client', () => ({
  apiClient: {
    getWorkspaces: vi.fn().mockResolvedValue([{ id: 'w1', name: 'W' }]),
    getProjects: vi
      .fn()
      .mockResolvedValue([{ id: 'p1', name: 'Work', color: '#3b82f6' }]),
    createTask: vi.fn().mockResolvedValue({ id: 't1' }),
  },
}));

import { apiClient } from '../src/lib/api-client';

const validTokens = {
  accessToken: 'live-access',
  refreshToken: 'live-refresh',
  expiresAt: Date.now() + 3600_000,
  scope: 'read tasks:write',
};

beforeEach(async () => {
  await fakeBrowser.reset();
  vi.mocked(apiClient.createTask).mockClear();
});

describe('popup App (ODD 024 S2: captura en popup)', () => {
  it('sin sesión muestra el botón de login, no el diálogo', async () => {
    render(<App />);
    expect(await screen.findByRole('button', { name: /sign in|iniciar sesión/i })).toBeDefined();
    expect(screen.queryByPlaceholderText(/qué necesitas hacer|what needs to be done/i)).toBeNull();
  });

  it('con sesión monta el diálogo con el prefill de la pestaña activa', async () => {
    await fakeBrowser.storage.session.set({
      ordoTokens: validTokens,
      ordoSession: { email: 'owner@ordotodo.app' },
    });

    render(<App />);

    const titleInput = await screen.findByPlaceholderText(
      /qué necesitas hacer|what needs to be done/i,
    );
    await waitFor(() => expect((titleInput as HTMLInputElement).value).toBe('PR #449 · ordo-todo'));
    expect(
      (screen.getByPlaceholderText(/add details|añade detalles/i) as HTMLTextAreaElement)
        .value,
    ).toContain('https://github.com/tiagofur/ordo-todo/pull/449');
  });

  it('crear desde el popup envía express (projectId null) y muestra confirmación', async () => {
    await fakeBrowser.storage.session.set({
      ordoTokens: validTokens,
      ordoSession: { email: 'owner@ordotodo.app' },
    });

    render(<App />);
    const createButton = await screen.findByRole('button', {
      name: /create task|crear tarea/i,
    });
    fireEvent.click(createButton);

    await waitFor(() =>
      expect(screen.getByText(/task created|tarea creada/i)).toBeDefined(),
    );

    expect(apiClient.createTask).toHaveBeenCalledTimes(1);
    const payload = vi.mocked(apiClient.createTask).mock.calls[0][0] as Record<string, unknown>;
    expect(payload.title).toBe('PR #449 · ordo-todo');
    expect(payload.projectId).toBeNull();
  });
});
