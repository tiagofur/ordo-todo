'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';
export function createNotesHooks(apiClient) {
    function useNotes(workspaceId) {
        return useQuery({
            queryKey: queryKeys.notes(workspaceId),
            queryFn: () => apiClient.getNotes(workspaceId),
            enabled: !!workspaceId,
        });
    }
    function useNote(id) {
        return useQuery({
            queryKey: queryKeys.note(id),
            queryFn: () => apiClient.getNote(id),
            enabled: !!id,
        });
    }
    function useCreateNote() {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: (data) => apiClient.createNote(data),
            onSuccess: (note) => {
                queryClient.invalidateQueries({ queryKey: queryKeys.notes(note.workspaceId) });
            },
        });
    }
    function useUpdateNote() {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: ({ id, data }) => apiClient.updateNote(id, data),
            onSuccess: (note) => {
                queryClient.invalidateQueries({ queryKey: queryKeys.note(note.id) });
                queryClient.invalidateQueries({ queryKey: queryKeys.notes(note.workspaceId) });
            },
        });
    }
    function useDeleteNote() {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: (id) => apiClient.deleteNote(id),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['notes'] });
            },
        });
    }
    return {
        useNotes,
        useNote,
        useCreateNote,
        useUpdateNote,
        useDeleteNote,
    };
}
