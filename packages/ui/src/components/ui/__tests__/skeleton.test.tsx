/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Skeleton } from '../skeleton';

describe('Skeleton', () => {
    it('is hidden from assistive tech by default', () => {
        const { container } = render(<Skeleton data-testid="sk" />);
        expect(screen.getByTestId('sk')).toHaveAttribute('aria-hidden', 'true');
        expect(container.textContent).toBe('');
    });
});
