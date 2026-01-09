import type { CreateNoteDto, UpdateNoteDto } from '@ordo-todo/api-client';
import type { ApiClient } from '../types';
export declare function createNotesHooks(apiClient: ApiClient): {
    useNotes: (workspaceId: string) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useNote: (id: string) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useCreateNote: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, CreateNoteDto, unknown>;
    useUpdateNote: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, {
        id: string;
        data: UpdateNoteDto;
    }, unknown>;
    useDeleteNote: () => import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
};
//# sourceMappingURL=use-notes.d.ts.map