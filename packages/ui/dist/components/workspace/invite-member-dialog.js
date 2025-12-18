"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Copy, Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "../ui/dialog.js";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "../ui/form.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "../ui/select.js";
import { Input } from "../ui/input.js";
import { Button } from "../ui/button.js";
// Schema for form validation
const inviteMemberSchema = z.object({
    email: z.string().email("Invalid email address"),
    role: z.enum(["ADMIN", "MEMBER", "VIEWER"]),
});
export function InviteMemberDialog({ open, onOpenChange, onSubmit, isPending = false, labels = {}, baseUrl = "", onCopy, }) {
    const [invitedToken, setInvitedToken] = useState(null);
    const [copied, setCopied] = useState(false);
    const form = useForm({
        resolver: zodResolver(inviteMemberSchema),
        defaultValues: {
            email: "",
            role: "MEMBER",
        },
    });
    const handleSubmit = async (data) => {
        try {
            const result = await onSubmit(data);
            // For MVP/Dev, we might get a token back to display
            if (result && result.devToken) {
                setInvitedToken(result.devToken);
            }
            else {
                onOpenChange(false);
                form.reset();
            }
        }
        catch {
            // Error handling should be done by parent via onSubmit
        }
    };
    const copyToClipboard = () => {
        if (invitedToken && baseUrl) {
            const url = `${baseUrl}/invitations/accept?token=${invitedToken}`;
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            onCopy?.();
        }
    };
    const handleClose = () => {
        onOpenChange(false);
        setInvitedToken(null);
        form.reset();
    };
    const inviteUrl = invitedToken && baseUrl
        ? `${baseUrl}/invitations/accept?token=${invitedToken}`
        : "";
    return (_jsx(Dialog, { open: open, onOpenChange: handleClose, children: _jsxs(DialogContent, { className: "sm:max-w-[425px]", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: labels.title ?? "Invite Team Member" }), _jsx(DialogDescription, { children: labels.description ?? "Send an invitation to join this workspace." })] }), !invitedToken ? (_jsx(Form, { ...form, children: _jsxs("form", { onSubmit: form.handleSubmit(handleSubmit), className: "space-y-4", children: [_jsx(FormField, { control: form.control, name: "email", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: labels.emailLabel ?? "Email" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: labels.emailPlaceholder ?? "colleague@example.com", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "role", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: labels.roleLabel ?? "Role" }), _jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: labels.rolePlaceholder ?? "Select a role" }) }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "ADMIN", children: labels.roles?.admin ?? "Admin" }), _jsx(SelectItem, { value: "MEMBER", children: labels.roles?.member ?? "Member" }), _jsx(SelectItem, { value: "VIEWER", children: labels.roles?.viewer ?? "Viewer" })] })] }), _jsx(FormMessage, {})] })) }), _jsxs("div", { className: "flex justify-end gap-2 pt-4", children: [_jsx(Button, { type: "button", variant: "outline", onClick: handleClose, children: labels.cancel ?? "Cancel" }), _jsxs(Button, { type: "submit", disabled: isPending, children: [isPending && _jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), labels.invite ?? "Send Invitation"] })] })] }) })) : (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "rounded-md bg-muted p-4", children: [_jsx("p", { className: "text-sm font-medium mb-2", children: labels.inviteLink ?? "Invitation Link" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("code", { className: "flex-1 rounded bg-background p-2 text-xs font-mono border overflow-x-auto", children: inviteUrl }), _jsx(Button, { size: "icon", variant: "outline", onClick: copyToClipboard, children: copied ? _jsx(Check, { className: "h-4 w-4" }) : _jsx(Copy, { className: "h-4 w-4" }) })] }), _jsx("p", { className: "text-xs text-muted-foreground mt-2", children: labels.devTokenNote ?? "Share this link with the person you're inviting." })] }), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { onClick: handleClose, children: labels.done ?? "Done" }) })] }))] }) }));
}
