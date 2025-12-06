"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  id: string;
  name: string;
  image?: string;
}

interface MentionTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  users: User[];
  onMention?: (userId: string) => void;
}

export const MentionTextarea = React.forwardRef<
  HTMLTextAreaElement,
  MentionTextareaProps
>(({ className, users, onMention, onChange, value, ...props }, ref) => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [cursorPosition, setCursorPosition] = React.useState(0);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  // Combine refs
  React.useImperativeHandle(ref, () => textareaRef.current!);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
      } else {
        setOpen(false);
      }
    } else {
      setOpen(false);
    }

    if (onChange) {
      onChange(e);
    }
  };

  const handleSelectUser = (user: User) => {
    if (!textareaRef.current) return;

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

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative w-full">
      <Popover open={open && filteredUsers.length > 0} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="w-full">
             <Textarea
              ref={textareaRef}
              className={cn("w-full", className)}
              onChange={handleChange}
              value={value}
              {...props}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="p-0 w-[200px]" 
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()} // Don't steal focus from textarea
        >
          <Command>
            <CommandList>
              <CommandGroup heading="Suggestions">
                {filteredUsers.map((user) => (
                  <CommandItem
                    key={user.id}
                    onSelect={() => handleSelectUser(user)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.image} />
                      <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className="truncate">{user.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
});

MentionTextarea.displayName = "MentionTextarea";
