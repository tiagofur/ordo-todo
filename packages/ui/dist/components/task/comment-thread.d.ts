interface Comment {
    id: string | number;
    content: string;
    createdAt: Date | string;
    updatedAt?: Date | string;
    author: {
        id: string;
        name: string;
        email?: string;
        image?: string;
    };
}
interface MentionUser {
    id: string;
    name: string;
    image?: string;
}
interface CommentThreadProps {
    taskId: string;
    comments?: Comment[];
    currentUserId?: string;
    users?: MentionUser[];
    onCreate?: (content: string) => Promise<void> | void;
    onUpdate?: (commentId: string, content: string) => Promise<void> | void;
    onDelete?: (commentId: string) => Promise<void> | void;
    locale?: string;
    labels?: {
        title?: string;
        edited?: string;
        placeholder?: string;
        shortcut?: string;
        empty?: string;
        confirmDelete?: string;
        actions?: {
            edit?: string;
            delete?: string;
            save?: string;
            saving?: string;
            cancel?: string;
            send?: string;
            sending?: string;
        };
    };
}
export declare function CommentThread({ taskId, comments, currentUserId, users, onCreate, onUpdate, onDelete, locale, labels, }: CommentThreadProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=comment-thread.d.ts.map