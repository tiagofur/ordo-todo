/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickAdd, type QuickAddParsed } from '../quick-add';

const labels = {
  placeholder: 'Type a task',
  hint: 'Enter creates · Esc closes · Tab cycles fields',
  confirmHint: 'Review before creating',
};

const parsed: QuickAddParsed = {
  title: 'informe',
  dueAt: '2026-10-23T09:00:00.000Z',
  priority: 'HIGH',
  projectHint: 'trabajo',
  recurrence: 'WEEKLY',
};

const expectedDate = new Date(
  parsed.dueAt as string,
).toLocaleDateString();

interface SetupOverrides {
  open?: boolean;
  value?: string;
  parsed?: QuickAddParsed | null;
  isParsing?: boolean;
}

function setup(overrides: SetupOverrides = {}) {
  const props = {
    open: true,
    value: 'informe viernes 9h #trabajo',
    parsed,
    isParsing: false,
    onSubmit: vi.fn(),
    onInputChange: vi.fn(),
    onClose: vi.fn(),
    labels,
    ...overrides,
  };
  return { ...render(<QuickAdd {...props} />), props };
}

describe('QuickAdd', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when closed', () => {
    const { container } = setup({ open: false });
    expect(container.innerHTML).toBe('');
  });

  it('submits the trimmed input on Enter', () => {
    const { props } = setup({ value: '  informe  ' });
    fireEvent.keyDown(screen.getByPlaceholderText(labels.placeholder), {
      key: 'Enter',
    });
    expect(props.onSubmit).toHaveBeenCalledWith('informe');
  });

  it('does not submit blank input on Enter', () => {
    const { props } = setup({ value: '   ' });
    fireEvent.keyDown(screen.getByPlaceholderText(labels.placeholder), {
      key: 'Enter',
    });
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it('closes on Escape', () => {
    const { props } = setup();
    fireEvent.keyDown(screen.getByPlaceholderText(labels.placeholder), {
      key: 'Escape',
    });
    expect(props.onClose).toHaveBeenCalled();
  });

  it('closes on backdrop click but not on dialog click', () => {
    const { container, props } = setup();
    fireEvent.click(screen.getByPlaceholderText(labels.placeholder));
    expect(props.onClose).not.toHaveBeenCalled();
    const backdrop = container.firstElementChild;
    if (!backdrop) throw new Error('backdrop missing');
    fireEvent.click(backdrop);
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('shows inferred-field chips and the confirmation hint', () => {
    setup({ parsed: { ...parsed, needsConfirmation: true } });
    expect(screen.getByText(expectedDate)).toBeDefined();
    expect(screen.getByText('HIGH')).toBeDefined();
    expect(screen.getByText('#trabajo')).toBeDefined();
    expect(screen.getByText('WEEKLY')).toBeDefined();
    expect(screen.getByText(labels.confirmHint)).toBeDefined();
    expect(screen.getByText(labels.hint)).toBeDefined();
  });

  it('hides the default MEDIUM priority chip', () => {
    setup({ parsed: { ...parsed, priority: 'MEDIUM' } });
    expect(screen.queryByText('MEDIUM')).toBeNull();
  });

  it('cycles focus through inferred fields with Tab', async () => {
    const user = userEvent.setup();
    setup();
    const input = screen.getByPlaceholderText(labels.placeholder);
    await user.click(input);
    expect(input).toHaveFocus();
    await user.tab();
    expect(screen.getByText(expectedDate)).toHaveFocus();
    await user.tab();
    expect(screen.getByText('HIGH')).toHaveFocus();
    await user.tab();
    expect(screen.getByText('#trabajo')).toHaveFocus();
    await user.tab();
    expect(screen.getByText('WEEKLY')).toHaveFocus();
  });

  it('shows a spinner while parsing', () => {
    const { container } = setup({ isParsing: true });
    expect(container.querySelector('.animate-spin')).not.toBeNull();
  });
});
