import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommandPalette } from '../command-palette';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

const mockPush = vi.fn();
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockMutate = vi.fn();
vi.mock('@/lib/api-hooks', () => ({
  useStartTimer: () => ({ mutate: mockMutate }),
}));

describe('CommandPalette (S3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the 8 canonical actions', () => {
    render(<CommandPalette open={true} onClose={vi.fn()} />);

    for (const id of [
      'actions.go-dashboard',
      'actions.go-tasks',
      'actions.go-projects',
      'actions.go-calendar',
      'actions.new-task',
      'actions.new-project',
      'actions.start-timer',
      'actions.search',
    ]) {
      expect(screen.getByText(id)).toBeDefined();
    }
  });

  it('should filter actions by query', () => {
    render(<CommandPalette open={true} onClose={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('placeholder'), {
      target: { value: 'go-tasks' },
    });

    expect(screen.getByText('actions.go-tasks')).toBeDefined();
    expect(screen.queryByText('actions.go-calendar')).toBeNull();
  });

  it('should run navigation on click and close', () => {
    const onClose = vi.fn();
    render(<CommandPalette open={true} onClose={onClose} />);

    fireEvent.click(screen.getByText('actions.go-tasks'));

    expect(mockPush).toHaveBeenCalledWith('/tasks');
    expect(onClose).toHaveBeenCalled();
  });

  it('should dispatch the search event for the search action', () => {
    const listener = vi.fn();
    document.addEventListener('ordo:open-search', listener);
    render(<CommandPalette open={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByText('actions.search'));

    expect(listener).toHaveBeenCalled();
    document.removeEventListener('ordo:open-search', listener);
  });

  it('should render nothing when closed', () => {
    const { container } = render(
      <CommandPalette open={false} onClose={vi.fn()} />,
    );

    expect(container.innerHTML).toBe('');
  });

  it('should reset the filter when reopened', () => {
    const { rerender } = render(
      <CommandPalette open={true} onClose={vi.fn()} />,
    );

    fireEvent.change(screen.getByPlaceholderText('placeholder'), {
      target: { value: 'go-tasks' },
    });
    expect(screen.queryByText('actions.go-calendar')).toBeNull();

    rerender(<CommandPalette open={false} onClose={vi.fn()} />);
    rerender(<CommandPalette open={true} onClose={vi.fn()} />);

    expect(screen.getByText('actions.go-calendar')).toBeDefined();
  });

  it('should open Quick-Add and close the palette for new-task', () => {
    const onClose = vi.fn();
    const onNewTask = vi.fn();
    render(
      <CommandPalette open={true} onClose={onClose} onNewTask={onNewTask} />,
    );

    fireEvent.click(screen.getByText('actions.new-task'));

    expect(onNewTask).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('should navigate to the project dialog for new-project', () => {
    render(<CommandPalette open={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByText('actions.new-project'));

    expect(mockPush).toHaveBeenCalledWith('/projects?action=new');
  });

  it('should start a WORK timer for start-timer', () => {
    render(<CommandPalette open={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByText('actions.start-timer'));

    expect(mockMutate).toHaveBeenCalledWith({ type: 'WORK' });
  });

  it('should run the first filtered action on Enter', () => {
    const onClose = vi.fn();
    render(<CommandPalette open={true} onClose={onClose} />);

    const input = screen.getByPlaceholderText('placeholder');
    fireEvent.change(input, { target: { value: 'go-tasks' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockPush).toHaveBeenCalledWith('/tasks');
    expect(onClose).toHaveBeenCalled();
  });
});
