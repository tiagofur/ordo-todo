import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWorkspaceStore } from '../workspace-store';

describe('useWorkspaceStore', () => {
    beforeEach(() => {
        // Reset store before each test
        const { setState } = useWorkspaceStore;
        setState({
            selectedWorkspaceId: null,
        });
        localStorage.clear();
    });

    it('should initialize with null selectedWorkspaceId', () => {
        const { result } = renderHook(() => useWorkspaceStore());

        expect(result.current.selectedWorkspaceId).toBeNull();
    });

    it('should set selected workspace ID', () => {
        const { result } = renderHook(() => useWorkspaceStore());

        act(() => {
            result.current.setSelectedWorkspaceId('workspace-123');
        });

        expect(result.current.selectedWorkspaceId).toBe('workspace-123');
    });

    it('should persist selectedWorkspaceId to localStorage', () => {
        const { result } = renderHook(() => useWorkspaceStore());

        act(() => {
            result.current.setSelectedWorkspaceId('workspace-456');
        });

        // Check if it's stored in localStorage
        const stored = localStorage.getItem('workspace-storage');
        expect(stored).toBeTruthy();

        if (stored) {
            const parsed = JSON.parse(stored);
            expect(parsed.state.selectedWorkspaceId).toBe('workspace-456');
        }
    });
});
