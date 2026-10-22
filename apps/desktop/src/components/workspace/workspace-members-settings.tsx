import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Mail, MoreHorizontal, Shield, Trash2, LogOut } from "lucide-react";
import { format } from "date-fns";
import { es, enUS, ptBR } from "date-fns/locale";

import {
  Button,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ordo-todo/ui";
import { InviteMemberDialog } from "./invite-member-dialog";
import {
  useWorkspaceMembers,
  useWorkspaceInvitations,
  useRemoveWorkspaceMember,
  useChangeWorkspaceMemberRole,
  useCancelWorkspaceInvitation,
  useLeaveWorkspace,
  useCurrentUser,
  useWorkspace,
} from "@/hooks/api";
import { toast } from "sonner";

interface WorkspaceMembersSettingsProps {
  workspaceId: string;
  owner?: { id: string; name?: string | null; email?: string | null; image?: string | null };
  workspaceCreatedAt?: string | Date;
}

export function WorkspaceMembersSettings({ workspaceId, owner }: WorkspaceMembersSettingsProps) {
  const { t, i18n } = (useTranslation as any)();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  
  const { data: members = [], isLoading: isLoadingMembers } = useWorkspaceMembers(workspaceId);
  const { data: invitations = [], isLoading: isLoadingInvitations } = useWorkspaceInvitations(workspaceId);
  const { data: workspace } = useWorkspace(workspaceId);
  const { data: currentUser } = useCurrentUser();
  const removeMemberMutation = useRemoveWorkspaceMember();
  const changeRoleMutation = useChangeWorkspaceMemberRole();
  const cancelInvitationMutation = useCancelWorkspaceInvitation();
  const leaveMutation = useLeaveWorkspace();

  const ownerId = workspace?.ownerId ?? owner?.id;
  const isCurrentUserOwner = !!currentUser && currentUser.id === ownerId;
  const currentUserIsMember = members.some(
    (m: { userId?: string }) => m.userId === currentUser?.id,
  );
  // W6: any member except the owner may leave
  const canLeave = currentUserIsMember && !isCurrentUserOwner;
  
  const locale = i18n.language === 'es' ? es : i18n.language === 'pt-BR' ? ptBR : enUS;

  const getRoleLabel = (role: string): string => {
    const key = role.toLowerCase() as "owner" | "admin" | "member" | "viewer";
    return t(`WorkspaceMembersSettings.roles.${key}`);
  };

  const handleRemoveMember = async (userId: string) => {
    if (confirm(t("WorkspaceMembersSettings.confirmRemove"))) {
      try {
        await removeMemberMutation.mutateAsync({ workspaceId, userId });
        toast.success(t("WorkspaceMembersSettings.memberRemoved"));
      } catch (error) {
        toast.error(t("WorkspaceMembersSettings.errorRemoving"));
      }
    }
  };

  const handleChangeRole = async (
    userId: string,
    role: "ADMIN" | "MEMBER" | "VIEWER",
  ) => {
    try {
      await changeRoleMutation.mutateAsync({ workspaceId, userId, role });
      toast.success(t("WorkspaceMembersSettings.roleChangeSuccess"));
    } catch {
      toast.error(t("WorkspaceMembersSettings.roleChangeError"));
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm(t("WorkspaceMembersSettings.cancelInvitationConfirm"))) return;
    try {
      await cancelInvitationMutation.mutateAsync({ workspaceId, invitationId });
      toast.success(t("WorkspaceMembersSettings.cancelSuccess"));
    } catch {
      toast.error(t("WorkspaceMembersSettings.cancelError"));
    }
  };

  const handleLeave = async () => {
    if (!confirm(t("WorkspaceMembersSettings.confirmLeave"))) return;
    try {
      await leaveMutation.mutateAsync({ workspaceId });
      toast.success(t("WorkspaceMembersSettings.leaveSuccess"));
      // Reload so the workspace switcher re-selects a workspace the user
      // still belongs to
      window.location.reload();
    } catch {
      toast.error(t("WorkspaceMembersSettings.leaveError"));
    }
  };

  if (isLoadingMembers || isLoadingInvitations) {
    return <div className="p-8 text-center">{t("WorkspaceMembersSettings.loading")}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{t("WorkspaceMembersSettings.membersTitle")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("WorkspaceMembersSettings.membersDescription")}
          </p>
        </div>
        <Button onClick={() => setIsInviteDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("WorkspaceMembersSettings.inviteMember")}
        </Button>
      </div>

      {/* Members List */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("WorkspaceMembersSettings.user")}</TableHead>
              <TableHead>{t("WorkspaceMembersSettings.role")}</TableHead>
              <TableHead>{t("WorkspaceMembersSettings.joined")}</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  {t("WorkspaceMembersSettings.noMembers")}
                </TableCell>
              </TableRow>
            ) : (
              members.map((member: any) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.user?.image} />
                        <AvatarFallback>
                          {member.user?.name?.charAt(0) || member.user?.email?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{member.user?.name || t("WorkspaceMembersSettings.unknownUser")}</span>
                        <span className="text-xs text-muted-foreground">{member.user?.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getRoleLabel(member.role)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(member.joinedAt), "PP", { locale })}
                  </TableCell>
                  <TableCell>
                    {member.role !== "OWNER" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {(["ADMIN", "MEMBER", "VIEWER"] as const).map((role) => (
                            <DropdownMenuItem
                              key={role}
                              disabled={member.role === role}
                              onClick={() => handleChangeRole(member.userId, role)}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              {getRoleLabel(role)}
                              {member.role === role && " ✓"}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600"
                            onClick={() => handleRemoveMember(member.userId)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t("WorkspaceMembersSettings.remove")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Leave workspace (W6): any member except the owner */}
      {canLeave && (
        <div className="flex justify-end border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-600"
            onClick={handleLeave}
            disabled={leaveMutation.isPending}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t("WorkspaceMembersSettings.leave")}
          </Button>
        </div>
      )}

      {/* Invitations List */}
      {invitations && invitations.length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">{t("WorkspaceMembersSettings.invitationsTitle")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("WorkspaceMembersSettings.invitationsDescription")}
            </p>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("WorkspaceMembersSettings.email")}</TableHead>
                  <TableHead>{t("WorkspaceMembersSettings.role")}</TableHead>
                  <TableHead>{t("WorkspaceMembersSettings.status")}</TableHead>
                  <TableHead>{t("WorkspaceMembersSettings.sent")}</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation: any) => (
                  <TableRow key={invitation.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{invitation.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getRoleLabel(invitation.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={invitation.status === "PENDING" ? "secondary" : "outline"}
                        className="capitalize"
                      >
                        {invitation.status.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(invitation.createdAt), "PP", { locale })}
                    </TableCell>
                    <TableCell>
                      {invitation.status === "PENDING" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleCancelInvitation(invitation.id)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <InviteMemberDialog 
        workspaceId={workspaceId}
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
      />
    </div>
  );
}
