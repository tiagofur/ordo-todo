import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuickAddTask } from './QuickAddTask';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockMutateAsync = vi.fn();

vi.mock('@/lib/shared-hooks', () => ({
  useTasks: () => ({ data: [] }),
  useCreateTask: () => ({ mutateAsync: mockMutateAsync }),
  useProjects: () => ({
    data: [
      { id: 'proj-1', name: 'Work', slug: 'work', color: '#000' },
      { id: 'proj-2', name: 'Personal', slug: 'personal', color: '#111' },
    ],
  }),
  useTags: () => ({ data: [] }),
}));

interface MockParsed {
  title: string;
  dueAt?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  projectHint?: string;
  recurrence?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  needsConfirmation?: boolean;
}

const mockParseState: { parsed: MockParsed | null; isParsing: boolean } = {
  parsed: null,
  isParsing: false,
};

vi.mock('@/hooks/use-parse-task', () => ({
  useParseTask: () => ({
    parsed: mockParseState.parsed,
    isParsing: mockParseState.isParsing,
  }),
}));

vi.mock('@ordo-todo/core', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@ordo-todo/core')>();
  return {
    ...actual,
    toCalendarDateString: (value: string) => value.slice(0, 10),
    serializeCalendarDateForApi: (value: string) =>
      `${value}T00:00:00.000Z`,
  };
});

describe('QuickAddTask NL prefill (S5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParseState.parsed = null;
    mockParseState.isParsing = false;
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <QuickAddTask isOpen={false} onClose={vi.fn()} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('shows parsed preview badges while typing', async () => {
    mockParseState.parsed = {
      title: 'informe',
      dueAt: '2026-10-23T09:00:00.000Z',
      priority: 'HIGH',
      projectHint: 'personal',
    };
    render(<QuickAddTask isOpen={true} onClose={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('What needs to be done?'), {
      target: { value: 'informe viernes 9h #personal' },
    });

    await waitFor(() => {
      expect(screen.getByText('10/23/2026')).toBeDefined();
      expect(screen.getByText('HIGH')).toBeDefined();
      expect(screen.getByText('#personal')).toBeDefined();
    });
  });

  it('prefills the due date from the NL parse on submit', async () => {
    mockParseState.parsed = {
      title: 'informe',
      dueAt: '2026-10-23T09:00:00.000Z',
      priority: 'MEDIUM',
    };
    mockMutateAsync.mockResolvedValue({ id: 'task-1' });
    render(<QuickAddTask isOpen={true} onClose={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('What needs to be done?'), {
      target: { value: 'informe viernes 9h' },
    });

    await waitFor(() => {
      expect(screen.getByText('10/23/2026')).toBeDefined();
    });

    fireEvent.click(screen.getByText('Add Task'));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          dueDate: '2026-10-23T00:00:00.000Z',
        }),
      );
    });
  });

  it('resolves the project from the #hint on submit', async () => {
    mockParseState.parsed = {
      title: 'comprar leche',
      projectHint: 'personal',
      priority: 'MEDIUM',
    };
    mockMutateAsync.mockResolvedValue({ id: 'task-1' });
    render(<QuickAddTask isOpen={true} onClose={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('What needs to be done?'), {
      target: { value: 'comprar leche #personal' },
    });
    fireEvent.click(screen.getByText('Add Task'));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ projectId: 'proj-2' }),
      );
    });
  });

  it('shows the review hint when confidence is low', async () => {
    mockParseState.parsed = {
      title: 'xyzzy',
      priority: 'MEDIUM',
      needsConfirmation: true,
    };
    render(<QuickAddTask isOpen={true} onClose={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('What needs to be done?'), {
      target: { value: 'xyzzy' },
    });

    await waitFor(() => {
      expect(screen.getByText('Review before creating')).toBeDefined();
    });
  });
});
