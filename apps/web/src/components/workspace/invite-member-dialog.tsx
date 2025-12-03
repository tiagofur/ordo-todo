"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Copy, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useInviteMember } from "@/lib/api-hooks";

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

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
    resolver: zodResolver(inviteSchema),
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        {!invitedToken ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                >
                  {t("cancel")}
                </Button>
                <Button type="submit" disabled={inviteMemberMutation.isPending}>
                  {inviteMemberMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t("invite")}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md bg-muted p-4">
              <p className="text-sm font-medium mb-2">{t("inviteLink")}</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-background p-2 text-xs font-mono border">
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
            <div className="flex justify-end">
              <Button onClick={handleClose}>{t("done")}</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
