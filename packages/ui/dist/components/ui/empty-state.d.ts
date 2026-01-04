import { LucideIcon } from "lucide-react";
interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}
export declare function EmptyState({ icon: Icon, title, description, actionLabel, onAction, className, }: EmptyStateProps): React.ReactElement;
export {};
//# sourceMappingURL=empty-state.d.ts.map