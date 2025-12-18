interface Assignee {
    id: string;
    name: string;
    image?: string;
    email?: string;
}
interface Member {
    id: string;
    role?: string;
    user: Assignee;
}
interface AssigneeSelectorProps {
    taskId: string;
    currentAssignee?: Assignee | null;
    members?: Member[];
    isLoading?: boolean;
    onAssign?: (userId: string | null) => Promise<void> | void;
    variant?: 'compact' | 'full';
    labels?: {
        assign?: string;
        unassign?: string;
        membersLabel?: string;
        noMembers?: string;
        loading?: string;
        unassigned?: string;
        assignedTo?: string;
        selectMember?: string;
        assignedRemoved?: string;
    };
}
export declare function AssigneeSelector({ taskId, currentAssignee, members, isLoading, onAssign, variant, labels, }: AssigneeSelectorProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=assignee-selector.d.ts.map