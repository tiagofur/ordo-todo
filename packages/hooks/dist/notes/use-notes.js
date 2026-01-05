'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotesHooks = createNotesHooks;
const react_query_1 = require("@tanstack/react-query");
const query_keys_1 = require("../query-keys");
function createNotesHooks(apiClient) {
    function useNotes(workspaceId) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.notes(workspaceId),
            queryFn: () => apiClient.getNotes(workspaceId),
            enabled: !!workspaceId,
        });
    }
    function useNote(id) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.note(id),
            queryFn: () => apiClient.getNote(id),
            enabled: !!id,
        });
    }
    function useCreateNote() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (data) => apiClient.createNote(data),
            onSuccess: (note) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.notes(note.workspaceId) });
            },
        });
    }
    function useUpdateNote() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: ({ id, data }) => apiClient.updateNote(id, data),
            onSuccess: (note) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.note(note.id) });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.notes(note.workspaceId) });
            },
        });
    }
    function useDeleteNote() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
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
