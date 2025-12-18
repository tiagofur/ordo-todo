import { LucideIcon } from "lucide-react";
interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}
export declare function EmptyState({ icon: Icon, title, description, actionLabel, onAction, className, }: EmptyStateProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=empty-state.d.ts.map