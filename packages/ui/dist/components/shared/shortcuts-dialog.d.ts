export interface ShortcutItem {
    keys: string[];
    description: string;
    category: string;
}
interface ShortcutsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    shortcuts?: ShortcutItem[];
    labels?: {
        title?: string;
        description?: string;
        footer?: string;
    };
}
export declare function ShortcutsDialog({ open, onOpenChange, shortcuts, labels, }: ShortcutsDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=shortcuts-dialog.d.ts.map