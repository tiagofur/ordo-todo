"use client";

import { useTranslations } from "next-intl";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Badge,
  Button,
  Separator,
} from "@ordo-todo/ui";

import { useAdminUser } from "@/hooks/use-admin";

interface AdminUserDetailDialogProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="truncate text-sm font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}

export function AdminUserDetailDialog({
  userId,
  open,
  onOpenChange,
}: AdminUserDetailDialogProps) {
  const t = useTranslations("Admin.users");
  const { data: user, isLoading } = useAdminUser(open ? userId : null);

  const formatDate = (value: string | null) =>
    value ? format(new Date(value), "MMM d, yyyy HH:mm") : t("never");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl bg-background p-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("detailTitle")}</DialogTitle>
          <DialogDescription className="truncate">
            {user?.email ?? ""}
          </DialogDescription>
        </DialogHeader>

        {isLoading || !user ? (
          <p className="py-4 text-sm text-muted-foreground">{t("loading")}</p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={user.status === "ACTIVE" ? "secondary" : "destructive"}
              >
                {t(
                  user.status === "ACTIVE" ? "statusActive" : "statusBlocked"
                )}
              </Badge>
              <Badge variant="outline">
                {t(`plan.${user.plan.toLowerCase()}`)}
              </Badge>
            </div>

            <div>
              <DetailRow label={t("columnName")} value={user.name || "—"} />
              <DetailRow label={t("columnUsername")} value={user.username} />
              <DetailRow label={t("columnEmail")} value={user.email} />
              <DetailRow
                label={t("detailCreatedAt")}
                value={formatDate(user.createdAt)}
              />
              <DetailRow
                label={t("columnLastLogin")}
                value={formatDate(user.lastLoginAt)}
              />
              <DetailRow
                label={t("detailBlockedAt")}
                value={formatDate(user.blockedAt)}
              />
            </div>

            <Separator />

            <div>
              <DetailRow label={t("detailTasks")} value={String(user.counts.tasks)} />
              <DetailRow
                label={t("detailWorkspaces")}
                value={String(user.counts.workspaces)}
              />
              <DetailRow label={t("detailLocale")} value={user.locale} />
              <DetailRow label={t("detailTimezone")} value={user.timezone} />
              <DetailRow
                label={t("detailInviteCode")}
                value={user.inviteCode ?? t("detailNoInvite")}
              />
              <DetailRow
                label={t("detailInvitedAt")}
                value={
                  user.invitedAt ? formatDate(user.invitedAt) : t("never")
                }
              />
            </div>

            <div className="flex justify-end pt-1">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t("close")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
