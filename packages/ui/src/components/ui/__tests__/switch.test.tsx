/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Switch } from '../switch';

describe('Switch', () => {
    it('calls onCheckedChange exactly once per click', () => {
        const onCheckedChange = vi.fn();
        render(<Switch checked={false} onCheckedChange={onCheckedChange} />);
        fireEvent.click(screen.getByRole('switch'));
        expect(onCheckedChange).toHaveBeenCalledTimes(1);
        expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it('does not toggle when disabled', () => {
        const onCheckedChange = vi.fn();
        render(<Switch checked={false} onCheckedChange={onCheckedChange} disabled />);
        fireEvent.click(screen.getByRole('switch'));
        expect(onCheckedChange).not.toHaveBeenCalled();
    });

    it('reflects the checked state via aria-checked', () => {
        const { rerender } = render(<Switch checked={false} />);
        expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
        rerender(<Switch checked />);
        expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    });
});
