import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateHabitDialog } from '../create-habit-dialog';

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div>{children}</div> : null,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <div>{children}</div>,
}));

// Mock API hooks
const mockCreateHabit = { mutateAsync: vi.fn().mockResolvedValue({}) };

vi.mock('@/lib/api-hooks', () => ({
  useCreateHabit: () => mockCreateHabit,
}));

describe('CreateHabitDialog Component', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form fields', () => {
    render(<CreateHabitDialog {...defaultProps} />);
    
    expect(screen.getByLabelText('form.name')).toBeInTheDocument();
    expect(screen.getByLabelText('form.description')).toBeInTheDocument();
    expect(screen.getByLabelText('form.reminder')).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    render(<CreateHabitDialog {...defaultProps} />);
    
    const submitButton = screen.getByText('form.create');
    fireEvent.click(submitButton);
    
    // Check for validation error (using waitFor because react-hook-form is async)
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
    
    expect(mockCreateHabit.mutateAsync).not.toHaveBeenCalled();
  });

  it('should submit form with valid data', async () => {
    render(<CreateHabitDialog {...defaultProps} />);
    
    // Fill form
    fireEvent.change(screen.getByLabelText('form.name'), { target: { value: 'New Habit' } });
    fireEvent.change(screen.getByLabelText('form.description'), { target: { value: 'Description' } });
    
    // Select frequency (assuming buttons render with translated labels)
    const dailyButton = screen.getByText('frequency.daily');
    fireEvent.click(dailyButton);
    
    // Submit
    const submitButton = screen.getByText('form.create');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockCreateHabit.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New Habit',
        description: 'Description',
        frequency: 'DAILY',
      }));
    });
  });
});
