import type { CreateNoteDto, UpdateNoteDto } from '@ordo-todo/api-client';
import type { ApiClient } from '../types';
export declare function createNotesHooks(apiClient: ApiClient): {
    useNotes: (workspaceId: string) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").Note[], Error>;
    useNote: (id: string) => import("@tanstack/react-query").UseQueryResult<import("@ordo-todo/api-client").Note, Error>;
    useCreateNote: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").Note, Error, CreateNoteDto, unknown>;
    useUpdateNote: () => import("@tanstack/react-query").UseMutationResult<import("@ordo-todo/api-client").Note, Error, {
        id: string;
        data: UpdateNoteDto;
    }, unknown>;
    useDeleteNote: () => import("@tanstack/react-query").UseMutationResult<void, Error, string, unknown>;
};
//# sourceMappingURL=use-notes.d.ts.map