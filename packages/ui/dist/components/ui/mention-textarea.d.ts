import * as React from "react";
interface User {
    id: string;
    name: string;
    image?: string;
}
interface MentionTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    users: User[];
    onMention?: (userId: string) => void;
}
export declare const MentionTextarea: React.ForwardRefExoticComponent<MentionTextareaProps & React.RefAttributes<HTMLTextAreaElement>>;
export {};
//# sourceMappingURL=mention-textarea.d.ts.map