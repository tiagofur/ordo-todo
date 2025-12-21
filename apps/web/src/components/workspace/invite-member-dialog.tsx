"use client";

import { useState } from "react";
import { Input, Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ordo-todo/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Copy, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useInviteMember } from "@/lib/api-hooks";

import { inviteMemberSchema } from "@ordo-todo/core";

// We can extend or use the schema directly. Since the core schema has generic messages,
// we might want to override them or just use them.
// For now, let's use the core schema directly but we can wrap it if needed.
const formSchema = inviteMemberSchema;

type InviteFormValues = z.infer<typeof formSchema>;

interface InviteMemberDialogProps {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteMemberDialog({
  workspaceId,
  open,
  onOpenChange,
}: InviteMemberDialogProps) {
  const t = useTranslations("InviteMemberDialog");
  const inviteMemberMutation = useInviteMember();
  const [invitedToken, setInvitedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      role: "MEMBER",
    },
  });

  const onSubmit = async (data: InviteFormValues) => {
    try {
      const result = await inviteMemberMutation.mutateAsync({
        workspaceId,
        data,
      });
      
      // For MVP/Dev, we might get a token back to display
      // In production with email service, we would just show success message
      if (result.devToken) {
        setInvitedToken(result.devToken);
        toast.success(t("successWithToken"));
      } else {
        toast.success(t("success"));
        onOpenChange(false);
        form.reset();
      }
    } catch (error: any) {
      toast.error(error?.message || t("error"));
    }
  };

  const copyToClipboard = () => {
    if (invitedToken) {
      // Construct the full URL
      const url = `${window.location.origin}/invitations/accept?token=${invitedToken}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success(t("copied"));
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setInvitedToken(null);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden bg-background border-border">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>
              {t("description")}
            </DialogDescription>
          </DialogHeader>
        </div>

        {!invitedToken ? (
          <Form {...form}>
            <form id="invite-form" onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("emailLabel")}</FormLabel>
                    <FormControl>
                      <Input placeholder="colleague@example.com" {...field} />
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
                    <FormLabel>{t("roleLabel")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("rolePlaceholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ADMIN">{t("roles.admin")}</SelectItem>
                        <SelectItem value="MEMBER">{t("roles.member")}</SelectItem>
                        <SelectItem value="VIEWER">{t("roles.viewer")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>

            <div className="p-6 pt-4 border-t bg-background">
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                >
                  {t("cancel")}
                </Button>
                <Button type="submit" form="invite-form" disabled={inviteMemberMutation.isPending}>
                  {inviteMemberMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t("invite")}
                </Button>
              </DialogFooter>
            </div>
          </Form>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div className="rounded-md bg-muted p-4">
                <p className="text-sm font-medium mb-2">{t("inviteLink")}</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-background p-2 text-xs font-mono border break-all">
                    {`${window.location.origin}/invitations/accept?token=${invitedToken}`}
                  </code>
                  <Button size="icon" variant="outline" onClick={copyToClipboard}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {t("devTokenNote")}
                </p>
              </div>
            </div>
            <div className="p-6 pt-4 border-t bg-background">
              <DialogFooter>
                <Button onClick={handleClose}>{t("done")}</Button>
              </DialogFooter>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
