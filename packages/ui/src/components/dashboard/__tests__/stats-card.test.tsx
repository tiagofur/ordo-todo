/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatsCard } from '../stats-card';
import { CheckSquare } from 'lucide-react';

const base = {
    title: 'Done',
    value: 12,
    icon: CheckSquare,
} as const;

describe('StatsCard', () => {
    it('activates via keyboard when clickable', () => {
        const onClick = vi.fn();
        render(<StatsCard {...base} onClick={onClick} />);
        const card = screen.getByRole('button', { name: /done 12/i });
        fireEvent.keyDown(card, { key: 'Enter' });
        fireEvent.keyDown(card, { key: ' ' });
        expect(onClick).toHaveBeenCalledTimes(2);
    });

    it('is not focusable without onClick', () => {
        render(<StatsCard {...base} />);
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
});
