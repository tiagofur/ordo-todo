'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
    CreateNoteDto,
    UpdateNoteDto,
} from '@ordo-todo/api-client';

import { queryKeys } from '../query-keys';
import type { ApiClient } from '../types';

export function createNotesHooks(apiClient: ApiClient) {
    function useNotes(workspaceId: string) {
        return useQuery({
            queryKey: queryKeys.notes(workspaceId),
            queryFn: () => apiClient.getNotes(workspaceId),
            enabled: !!workspaceId,
        });
    }

    function useNote(id: string) {
        return useQuery({
            queryKey: queryKeys.note(id),
            queryFn: () => apiClient.getNote(id),
            enabled: !!id,
        });
    }

    function useCreateNote() {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: (data: CreateNoteDto) => apiClient.createNote(data),
            onSuccess: (note) => {
                queryClient.invalidateQueries({ queryKey: queryKeys.notes(note.workspaceId) });
            },
        });
    }

    function useUpdateNote() {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: ({ id, data }: { id: string; data: UpdateNoteDto }) =>
                apiClient.updateNote(id, data),
            onSuccess: (note) => {
                queryClient.invalidateQueries({ queryKey: queryKeys.note(note.id) });
                queryClient.invalidateQueries({ queryKey: queryKeys.notes(note.workspaceId) });
            },
        });
    }

    function useDeleteNote() {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: (id: string) => apiClient.deleteNote(id),
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
