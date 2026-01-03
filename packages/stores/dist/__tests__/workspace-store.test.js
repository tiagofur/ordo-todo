import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkspaceStore, getSelectedWorkspaceId, setSelectedWorkspaceId } from '../workspace-store.js';
describe('useWorkspaceStore', () => {
    beforeEach(() => {
        useWorkspaceStore.setState({ selectedWorkspaceId: null });
    });
    it('should initialize with null', () => {
        expect(useWorkspaceStore.getState().selectedWorkspaceId).toBe(null);
    });
    it('should set selected workspace id', () => {
        useWorkspaceStore.getState().setSelectedWorkspaceId('ws-1');
        expect(useWorkspaceStore.getState().selectedWorkspaceId).toBe('ws-1');
    });
    it('should work with helper functions', () => {
        setSelectedWorkspaceId('ws-2');
        expect(getSelectedWorkspaceId()).toBe('ws-2');
        setSelectedWorkspaceId(null);
        expect(getSelectedWorkspaceId()).toBe(null);
    });
});
