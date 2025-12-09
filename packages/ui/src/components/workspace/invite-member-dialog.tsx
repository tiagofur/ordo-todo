"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Copy, Check } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog.js";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form.js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select.js";
import { Input } from "../ui/input.js";
import { Button } from "../ui/button.js";

// Schema for form validation
const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]),
});

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
  onSubmit: (data: InviteFormValues) => Promise<{ devToken?: string } | void>;
  isPending?: boolean;
  labels?: InviteMemberDialogLabels;
  /** Base URL for invitation link (e.g., window.location.origin) */
  baseUrl?: string;
  /** Callback when invitation link is copied */
  onCopy?: () => void;
}

export function InviteMemberDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending = false,
  labels = {},
  baseUrl = "",
  onCopy,
}: InviteMemberDialogProps) {
  const [invitedToken, setInvitedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "MEMBER",
    },
  });

  const handleSubmit = async (data: InviteFormValues) => {
    try {
      const result = await onSubmit(data);

      // For MVP/Dev, we might get a token back to display
      if (result && result.devToken) {
        setInvitedToken(result.devToken);
      } else {
        onOpenChange(false);
        form.reset();
      }
    } catch {
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{labels.title ?? "Invite Team Member"}</DialogTitle>
          <DialogDescription>
            {labels.description ?? "Send an invitation to join this workspace."}
          </DialogDescription>
        </DialogHeader>

        {!invitedToken ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{labels.emailLabel ?? "Email"}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={labels.emailPlaceholder ?? "colleague@example.com"}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{labels.roleLabel ?? "Role"}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={labels.rolePlaceholder ?? "Select a role"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ADMIN">
                          {labels.roles?.admin ?? "Admin"}
                        </SelectItem>
                        <SelectItem value="MEMBER">
                          {labels.roles?.member ?? "Member"}
                        </SelectItem>
                        <SelectItem value="VIEWER">
                          {labels.roles?.viewer ?? "Viewer"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  {labels.cancel ?? "Cancel"}
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {labels.invite ?? "Send Invitation"}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md bg-muted p-4">
              <p className="text-sm font-medium mb-2">
                {labels.inviteLink ?? "Invitation Link"}
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-background p-2 text-xs font-mono border overflow-x-auto">
                  {inviteUrl}
                </code>
                <Button size="icon" variant="outline" onClick={copyToClipboard}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {labels.devTokenNote ?? "Share this link with the person you're inviting."}
              </p>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleClose}>{labels.done ?? "Done"}</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
