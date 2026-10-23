"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ordo-todo/ui";
import { Ban, Copy, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  useDeactivateInviteCode,
  useInviteCodes,
} from "@/hooks/use-admin";
import { useConfirm } from "@/components/shared/confirm-dialog";
import { CreateInviteCodeDialog } from "./create-invite-code-dialog";
import { getErrorMessage } from "@/lib/error-handler";

export function AdminInviteCodesTable() {
  const t = useTranslations("Admin.codes");
  const { confirm, ConfirmModal } = useConfirm();
  const [createOpen, setCreateOpen] = useState(false);

  const { data: codes, isLoading } = useInviteCodes();
  const deactivateCode = useDeactivateInviteCode();

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(t("copied"));
    } catch {
      toast.error(t("copyError"));
    }
  };

  const handleDeactivate = async (codeId: string, code: string) => {
    const ok = await confirm({
      title: t("deactivateConfirmTitle"),
      description: t("deactivateConfirmDescription", { code }),
      confirmLabel: t("deactivate"),
      variant: "destructive",
    });
    if (!ok) return;
    try {
      await deactivateCode.mutateAsync(codeId);
      toast.success(t("deactivateSuccess"));
    } catch (error) {
      toast.error(getErrorMessage(error, t("actionError")));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)} className="rounded-xl gap-2">
          <Plus className="h-4 w-4" />
          {t("create")}
        </Button>
      </div>

      <div className="rounded-xl border border-border/80">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("columnCode")}</TableHead>
              <TableHead>{t("columnLabel")}</TableHead>
              <TableHead>{t("columnUses")}</TableHead>
              <TableHead>{t("columnRedemptions")}</TableHead>
              <TableHead>{t("columnExpiresAt")}</TableHead>
              <TableHead>{t("columnStatus")}</TableHead>
              <TableHead className="w-[100px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  <span className="text-sm text-muted-foreground">
                    {t("loading")}
                  </span>
                </TableCell>
              </TableRow>
            ) : !codes || codes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  <span className="text-sm text-muted-foreground">
                    {t("empty")}
                  </span>
                </TableCell>
              </TableRow>
            ) : (
              codes.map((inviteCode) => (
                <TableRow key={inviteCode.id}>
                  <TableCell>
                    <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs font-semibold">
                      {inviteCode.code}
                    </code>
                  </TableCell>
                  <TableCell className="text-sm">
                    {inviteCode.label || t("noLabel")}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {inviteCode.usedCount}/{inviteCode.maxUses}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {inviteCode.redemptions}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {inviteCode.expiresAt
                      ? format(new Date(inviteCode.expiresAt), "MMM d, yyyy")
                      : t("neverExpires")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={inviteCode.isActive ? "secondary" : "outline"}
                    >
                      {inviteCode.isActive
                        ? t("statusActive")
                        : t("statusInactive")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleCopy(inviteCode.code)}
                        aria-label={t("copy")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {inviteCode.isActive && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleDeactivate(inviteCode.id, inviteCode.code)
                          }
                          aria-label={t("deactivate")}
                          disabled={deactivateCode.isPending}
                        >
                          <Ban className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateInviteCodeDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
      <ConfirmModal />
    </div>
  );
}
