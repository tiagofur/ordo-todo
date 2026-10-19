import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { QuickAddDialog } from '../quick-add-dialog';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, string>) =>
    params?.title ? `${key}:${params.title}` : key,
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mockMutate = vi.fn();

interface MockParsed {
  title: string;
  dueAt?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  projectHint?: string;
  recurrence?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
}

const mockParseState: { parsed: MockParsed | null } = { parsed: null };

// State objects are referenced inside mock closures (evaluated at call
// time, after module init) — same pattern as the mockMutate usage.
vi.mock('@/hooks/use-parse-task', () => ({
  useParseTask: (input: string) => ({
    parsed: input.length >= 3 ? mockParseState.parsed : null,
    isParsing: false,
  }),
}));

const mockProjectsState: {
  projects: Array<{ id: string; name: string; slug: string }>;
} = { projects: [] };

vi.mock('@/lib/api-hooks', () => ({
  useCreateTask: () => ({ mutate: mockMutate }),
  useAllProjects: () => ({ data: mockProjectsState.projects }),
}));

const defaultParsed: MockParsed = {
  title: 'informe',
  dueAt: '2026-10-23T09:00:00.000Z',
  priority: 'MEDIUM',
};

const oneProject = [{ id: 'proj-1', name: 'Work', slug: 'work' }];

function typeAndSubmit(value = 'informe viernes 9h') {
  const input = screen.getByPlaceholderText('placeholder');
  fireEvent.change(input, { target: { value } });
  fireEvent.keyDown(input, { key: 'Enter' });
}

describe('QuickAddDialog (S2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParseState.parsed = { ...defaultParsed };
    mockProjectsState.projects = [...oneProject];
  });

  it('creates a task with the parsed due date and dismisses immediately', async () => {
    const onClose = vi.fn();
    render(<QuickAddDialog open={true} onClose={onClose} />);
    typeAndSubmit();

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'informe',
          projectId: 'proj-1',
          dueDate: '2026-10-23T09:00:00.000Z',
        }),
        expect.anything(),
      );
      // Optimistic: dismissed without waiting for the mutation.
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('shows parsed badges while typing', async () => {
    render(<QuickAddDialog open={true} onClose={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('placeholder'), {
      target: { value: 'informe viernes 9h' },
    });

    await waitFor(() => {
      expect(screen.getByText('10/23/2026')).toBeDefined();
    });
  });

  it('closes on Escape without creating', () => {
    const onClose = vi.fn();
    render(<QuickAddDialog open={true} onClose={onClose} />);

    fireEvent.keyDown(screen.getByPlaceholderText('placeholder'), {
      key: 'Escape',
    });

    expect(onClose).toHaveBeenCalled();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('resolves the project from the #hint instead of the first project', async () => {
    mockProjectsState.projects = [
      { id: 'proj-1', name: 'Work', slug: 'work' },
      { id: 'proj-2', name: 'Personal', slug: 'personal' },
    ];
    mockParseState.parsed = {
      title: 'comprar leche',
      projectHint: 'personal',
      priority: 'MEDIUM',
    };
    render(<QuickAddDialog open={true} onClose={vi.fn()} />);
    typeAndSubmit('comprar leche #personal');

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({ projectId: 'proj-2' }),
        expect.anything(),
      );
    });
  });

  it('falls back to the first project without a hint', async () => {
    mockProjectsState.projects = [
      { id: 'proj-1', name: 'Work', slug: 'work' },
      { id: 'proj-2', name: 'Personal', slug: 'personal' },
    ];
    render(<QuickAddDialog open={true} onClose={vi.fn()} />);
    typeAndSubmit();

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({ projectId: 'proj-1' }),
        expect.anything(),
      );
    });
  });

  it('warns and does not create when there are no projects', () => {
    mockProjectsState.projects = [];
    const onClose = vi.fn();
    render(<QuickAddDialog open={true} onClose={onClose} />);
    typeAndSubmit();

    expect(mockMutate).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('noProject');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('passes recurrence through to the created task', async () => {
    mockParseState.parsed = {
      title: 'regar plantas',
      recurrence: 'WEEKLY',
      priority: 'MEDIUM',
    };
    render(<QuickAddDialog open={true} onClose={vi.fn()} />);
    typeAndSubmit('regar plantas toda semana');

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          recurrence: { pattern: 'WEEKLY' },
        }),
        expect.anything(),
      );
    });
  });
});
