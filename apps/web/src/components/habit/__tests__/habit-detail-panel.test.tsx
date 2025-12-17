import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HabitDetailPanel } from '../habit-detail-panel';

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children, open }: any) => open ? <div>{children}</div> : null,
  SheetContent: ({ children }: any) => <div>{children}</div>,
  SheetHeader: ({ children }: any) => <div>{children}</div>,
  SheetTitle: ({ children }: any) => <div>{children}</div>,
}));

// Mock API hooks
const mockUpdateHabit = { mutateAsync: vi.fn().mockResolvedValue({}) };
const mockDeleteHabit = { mutateAsync: vi.fn().mockResolvedValue({}) };
const mockPauseHabit = { mutateAsync: vi.fn().mockResolvedValue({}) };
const mockResumeHabit = { mutateAsync: vi.fn().mockResolvedValue({}) };

const mockHabitData = {
  id: 'habit-1',
  name: 'Test Habit',
  description: 'Test Description',
  frequency: 'DAILY',
  currentStreak: 5,
  longestStreak: 10,
  isActive: true,
  isPaused: false,
  color: '#10B981',
};

const mockStatsData = {
  totalCompletions: 42,
  completionRate: 85,
  calendarData: [],
};

vi.mock('@/lib/api-hooks', () => ({
  useHabit: () => ({ data: mockHabitData, isLoading: false }),
  useHabitStats: () => ({ data: mockStatsData, isLoading: false }),
  useUpdateHabit: () => mockUpdateHabit,
  useDeleteHabit: () => mockDeleteHabit,
  usePauseHabit: () => mockPauseHabit,
  useResumeHabit: () => mockResumeHabit,
}));

describe('HabitDetailPanel Component', () => {
  const defaultProps = {
    habitId: 'habit-1',
    open: true,
    onOpenChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render habit details', () => {
    render(<HabitDetailPanel {...defaultProps} />);
    
    expect(screen.getByText('Test Habit')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    
    // Check stats
    expect(screen.getByText('5')).toBeInTheDocument(); // Current streak
    expect(screen.getByText('10')).toBeInTheDocument(); // Longest streak
    expect(screen.getByText('42')).toBeInTheDocument(); // Total completions
    expect(screen.getByText('85%')).toBeInTheDocument(); // Completion rate
  });

  it('should handle pause action', async () => {
    render(<HabitDetailPanel {...defaultProps} />);
    
    const pauseButton = screen.getByText('actions.pause');
    fireEvent.click(pauseButton);
    
    expect(mockPauseHabit.mutateAsync).toHaveBeenCalledWith('habit-1');
  });

  it('should handle delete action', async () => {
    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockImplementation(() => true);

    render(<HabitDetailPanel {...defaultProps} />);
    
    const deleteButton = screen.getByText('actions.delete');
    fireEvent.click(deleteButton);
    
    expect(mockDeleteHabit.mutateAsync).toHaveBeenCalledWith('habit-1');
  });

  it('should switch to edit mode when clicking edit', () => {
    render(<HabitDetailPanel {...defaultProps} />);
    
    const editButton = screen.getByText('actions.edit');
    fireEvent.click(editButton);
    
    // Check if inputs appear (checking by value since labels might be keys)
    expect(screen.getByDisplayValue('Test Habit')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
  });
});
