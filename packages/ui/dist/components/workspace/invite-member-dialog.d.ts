import * as z from "zod";
declare const inviteMemberSchema: z.ZodObject<{
    email: z.ZodString;
    role: z.ZodEnum<{
        ADMIN: "ADMIN";
        MEMBER: "MEMBER";
        VIEWER: "VIEWER";
    }>;
}, z.core.$strip>;
export type InviteFormValues = z.infer<typeof inviteMemberSchema>;
export interface InviteMemberDialogLabels {
    title?: string;
    description?: string;
    emailLabel?: string;
    emailPlaceholder?: string;
    roleLabel?: string;
    rolePlaceholder?: string;
    roles?: {
        admin?: string;
        member?: string;
        viewer?: string;
    };
    cancel?: string;
    invite?: string;
    inviteLink?: string;
    devTokenNote?: string;
    done?: string;
    copied?: string;
}
export interface InviteMemberDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: InviteFormValues) => Promise<{
        devToken?: string;
    } | void>;
    isPending?: boolean;
    labels?: InviteMemberDialogLabels;
    /** Base URL for invitation link (e.g., window.location.origin) */
    baseUrl?: string;
    /** Callback when invitation link is copied */
    onCopy?: () => void;
}
export declare function InviteMemberDialog({ open, onOpenChange, onSubmit, isPending, labels, baseUrl, onCopy, }: InviteMemberDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=invite-member-dialog.d.ts.map