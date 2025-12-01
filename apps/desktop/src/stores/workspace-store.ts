import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WorkspaceStore {
    selectedWorkspaceId: string | null;
    setSelectedWorkspaceId: (id: string | null) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>()(
    persist(
        (set) => ({
            selectedWorkspaceId: null,
            setSelectedWorkspaceId: (id) => set({ selectedWorkspaceId: id }),
        }),
        {
            name: "workspace-storage",
        }
    )
);
