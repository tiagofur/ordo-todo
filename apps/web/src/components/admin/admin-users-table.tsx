"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ordo-todo/ui";
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  Crown,
  Gift,
  MoreHorizontal,
  Search,
  ShieldOff,
} from "lucide-react";
import { toast } from "sonner";

import {
  useAdminUsers,
  useBlockUser,
  useGrantPro,
  useRevokePro,
  useUnblockUser,
} from "@/hooks/use-admin";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useConfirm } from "@/components/shared/confirm-dialog";
import { AdminUserDetailDialog } from "./admin-user-detail-dialog";
import { getErrorMessage } from "@/lib/error-handler";
import type { AdminUserListItem } from "@/lib/api-client";

const PAGE_LIMIT = 10;

export function AdminUsersTable() {
  const t = useTranslations("Admin.users");
  const { confirm, ConfirmModal } = useConfirm();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [grantProUser, setGrantProUser] = useState<AdminUserListItem | null>(
    null
  );

  const { data, isLoading } = useAdminUsers({
    search: debouncedSearch,
    page,
    limit: PAGE_LIMIT,
  });
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();
  const grantPro = useGrantPro();
  const revokePro = useRevokePro();

  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleBlock = async (user: AdminUserListItem) => {
    const ok = await confirm({
      title: t("blockConfirmTitle"),
      description: t("blockConfirmDescription", { email: user.email }),
      confirmLabel: t("block"),
      variant: "destructive",
    });
    if (!ok) return;
    try {
      await blockUser.mutateAsync(user.id);
      toast.success(t("blockSuccess"));
    } catch (error) {
      toast.error(getErrorMessage(error, t("actionError")));
    }
  };

  const handleUnblock = async (user: AdminUserListItem) => {
    try {
      await unblockUser.mutateAsync(user.id);
      toast.success(t("unblockSuccess"));
    } catch (error) {
      toast.error(getErrorMessage(error, t("actionError")));
    }
  };

  const handleRevokePro = async (user: AdminUserListItem) => {
    try {
      await revokePro.mutateAsync(user.id);
      toast.success(t("revokeProSuccess"));
    } catch (error) {
      toast.error(getErrorMessage(error, t("actionError")));
    }
  };

  const handleRowClick = (user: AdminUserListItem) => {
    setSelectedUserId(user.id);
    setDetailOpen(true);
  };

  const renderStatusBadge = (user: AdminUserListItem) => (
    <Badge variant={user.status === "ACTIVE" ? "secondary" : "destructive"}>
      {user.status === "ACTIVE" ? t("statusActive") : t("statusBlocked")}
    </Badge>
  );

  const renderPlanBadge = (user: AdminUserListItem) => (
    <Badge
      variant="outline"
      className={
        user.plan === "PRO"
          ? "border-amber-400 bg-amber-100 text-amber-600 dark:bg-amber-900"
          : undefined
      }
    >
      {user.plan === "PRO" && <Crown className="mr-1 h-3 w-3" />}
      {t(`plan.${user.plan.toLowerCase()}`)}
    </Badge>
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder={t("searchPlaceholder")}
          className="rounded-xl pl-9"
          aria-label={t("searchPlaceholder")}
        />
      </div>

      <div className="rounded-xl border border-border/80">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("columnUser")}</TableHead>
              <TableHead>{t("columnStatus")}</TableHead>
              <TableHead>{t("columnPlan")}</TableHead>
              <TableHead>{t("columnLastLogin")}</TableHead>
              <TableHead>{t("columnCreatedAt")}</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  <span className="text-sm text-muted-foreground">
                    {t("loading")}
                  </span>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  <span className="text-sm text-muted-foreground">
                    {t("empty")}
                  </span>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer"
                  onClick={() => handleRowClick(user)}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name || "—"}</span>
                      <span className="text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{renderStatusBadge(user)}</TableCell>
                  <TableCell>{renderPlanBadge(user)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.lastLoginAt
                      ? format(new Date(user.lastLoginAt), "MMM d, yyyy")
                      : t("never")}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(user.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label={t("actions")}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.status === "ACTIVE" ? (
                          <DropdownMenuItem
                            onClick={() => handleBlock(user)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            {t("block")}
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleUnblock(user)}>
                            <ShieldOff className="mr-2 h-4 w-4" />
                            {t("unblock")}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => setGrantProUser(user)}>
                          <Gift className="mr-2 h-4 w-4" />
                          {t("grantPro")}
                        </DropdownMenuItem>
                        {user.plan === "PRO" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleRevokePro(user)}
                            >
                              <Crown className="mr-2 h-4 w-4" />
                              {t("revokePro")}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {t("totalUsers", { total })}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
            aria-label={t("previousPage")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm tabular-nums text-muted-foreground">
            {t("pageInfo", { page, totalPages })}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
            aria-label={t("nextPage")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AdminUserDetailDialog
        userId={selectedUserId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <GrantProDialog
        key={grantProUser?.id ?? "none"}
        user={grantProUser}
        onOpenChange={(open) => !open && setGrantProUser(null)}
        onConfirm={async (days) => {
          if (!grantProUser) return;
          try {
            await grantPro.mutateAsync({ userId: grantProUser.id, data: { days } });
            toast.success(t("grantProSuccess"));
            setGrantProUser(null);
          } catch (error) {
            toast.error(getErrorMessage(error, t("actionError")));
          }
        }}
        isPending={grantPro.isPending}
      />

      <ConfirmModal />
    </div>
  );
}

type GrantProOption = "30" | "90" | "unlimited";

function GrantProDialog({
  user,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  user: AdminUserListItem | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (days: number | null) => void | Promise<void>;
  isPending: boolean;
}) {
  const t = useTranslations("Admin.users");
  const [option, setOption] = useState<GrantProOption>("30");

  const options: { value: GrantProOption; label: string }[] = [
    { value: "30", label: t("pro30Days") },
    { value: "90", label: t("pro90Days") },
    { value: "unlimited", label: t("proUnlimited") },
  ];

  return (
    <Dialog
      open={Boolean(user)}
      onOpenChange={(open) => {
        if (!open) onOpenChange(false);
      }}
    >
      <DialogContent className="rounded-2xl bg-background p-6 sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("grantProTitle")}</DialogTitle>
          <DialogDescription className="truncate">
            {user?.email ?? ""}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {options.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setOption(value)}
              className={`flex w-full items-center justify-between rounded-xl border-2 px-4 py-2.5 text-left text-sm font-medium transition-all cursor-pointer ${
                option === value
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border/70 text-muted-foreground hover:bg-muted/40"
              }`}
            >
              <span>{label}</span>
              {option === value && (
                <span className="h-3.5 w-3.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button
            onClick={() =>
              onConfirm(option === "unlimited" ? null : Number(option))
            }
            disabled={isPending}
          >
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
