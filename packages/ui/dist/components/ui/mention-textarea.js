"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../../utils/index.js";
import { Textarea } from "./textarea.js";
import { Command, CommandGroup, CommandItem, CommandList, } from "./command.js";
import { Popover, PopoverContent, PopoverTrigger, } from "./popover.js";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar.js";
export const MentionTextarea = React.forwardRef(({ className, users, onMention, onChange, value, ...props }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [cursorPosition, setCursorPosition] = React.useState(0);
    const textareaRef = React.useRef(null);
    // Combine refs
    React.useImperativeHandle(ref, () => textareaRef.current);
    const handleChange = (e) => {
        const newValue = e.target.value;
        const newCursorPosition = e.target.selectionStart;
        // Check if we are typing a mention
        const lastAt = newValue.lastIndexOf("@", newCursorPosition - 1);
        if (lastAt !== -1) {
            const textAfterAt = newValue.substring(lastAt + 1, newCursorPosition);
            // If there are no spaces (or maybe allow spaces for names?), let's assume single word for now or until space
            if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
                setOpen(true);
                setQuery(textAfterAt);
                setCursorPosition(lastAt);
            }
            else {
                setOpen(false);
            }
        }
        else {
            setOpen(false);
        }
        if (onChange) {
            onChange(e);
        }
    };
    const handleSelectUser = (user) => {
        if (!textareaRef.current)
            return;
        const currentValue = textareaRef.current.value;
        const beforeMention = currentValue.substring(0, cursorPosition);
        const afterMention = currentValue.substring(textareaRef.current.selectionStart);
        // Insert mention
        const mention = `@${user.name} `;
        const newValue = beforeMention + mention + afterMention;
        // Update textarea value manually (since it's uncontrolled or controlled from parent)
        // We need to trigger onChange for parent
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
        nativeInputValueSetter?.call(textareaRef.current, newValue);
        const event = new Event('input', { bubbles: true });
        textareaRef.current.dispatchEvent(event);
        setOpen(false);
        // Focus back and set cursor
        textareaRef.current.focus();
        if (onMention) {
            onMention(user.id);
        }
    };
    const filteredUsers = users.filter((user) => user.name?.toLowerCase().includes(query.toLowerCase()));
    return (_jsx("div", { className: "relative w-full", children: _jsxs(Popover, { open: open && filteredUsers.length > 0, onOpenChange: setOpen, children: [_jsx(PopoverTrigger, { asChild: true, children: _jsx("div", { className: "w-full", children: _jsx(Textarea, { ref: textareaRef, className: cn("w-full", className), onChange: handleChange, value: value, ...props }) }) }), _jsx(PopoverContent, { className: "p-0 w-[200px]", align: "start", onOpenAutoFocus: (e) => e.preventDefault(), children: _jsx(Command, { children: _jsx(CommandList, { children: _jsx(CommandGroup, { heading: "Suggestions", children: filteredUsers.map((user) => (_jsxs(CommandItem, { onSelect: () => handleSelectUser(user), className: "flex items-center gap-2 cursor-pointer", children: [_jsxs(Avatar, { className: "h-6 w-6", children: [_jsx(AvatarImage, { src: user.image }), _jsx(AvatarFallback, { children: user.name?.[0] })] }), _jsx("span", { className: "truncate", children: user.name })] }, user.id))) }) }) }) })] }) }));
});
MentionTextarea.displayName = "MentionTextarea";
