"use client";

import { useState, useMemo } from "react";
import { Button, Avatar, AvatarFallback, AvatarImage, Badge, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ordo-todo/ui";
import { useTranslations } from "next-intl";
import { Plus, Mail, User, Shield, Trash2, MoreHorizontal, Crown } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { useWorkspaceMembers, useWorkspaceInvitations, useRemoveWorkspaceMember, useWorkspace } from "@/lib/api-hooks";
import { InviteMemberDialog } from "./invite-member-dialog";
import { getErrorMessage } from "@/lib/error-handler";
import { useWorkspacePermissions } from "@/hooks/use-workspace-permissions";
import type { WorkspaceMember, WorkspaceInvitation } from "@ordo-todo/api-client";

interface WorkspaceOwner {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
}

interface WorkspaceMembersSettingsProps {
  workspaceId: string;
  owner?: WorkspaceOwner | null;
  workspaceCreatedAt?: Date | string;
}

export function WorkspaceMembersSettings({ workspaceId, owner, workspaceCreatedAt }: WorkspaceMembersSettingsProps) {
  const t = useTranslations("WorkspaceMembersSettings");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const { data: workspace } = useWorkspace(workspaceId);
  const { data: members, isLoading: isLoadingMembers } = useWorkspaceMembers(workspaceId);
  const { data: invitations, isLoading: isLoadingInvitations } = useWorkspaceInvitations(workspaceId);
  const removeMemberMutation = useRemoveWorkspaceMember();
  const permissions = useWorkspacePermissions(workspace);

  // Combine owner with members list
  const allMembers = useMemo(() => {
    const membersList = members || [];

    // Get owner from prop or from workspace data
    const workspaceOwner = owner || workspace?.owner;
    const ownerCreatedAt = workspaceCreatedAt || workspace?.createdAt;

    // Check if owner is already in members list
    const ownerAlreadyInList = membersList.some(
      (m: WorkspaceMember) => m.userId === workspaceOwner?.id || m.role === "OWNER"
    );

    // If owner exists and is not in the list, add them at the beginning
    if (workspaceOwner && !ownerAlreadyInList) {
      // Create a virtual owner member entry
      const ownerMember = {
        id: `owner-${workspaceOwner.id}`,
        userId: workspaceOwner.id,
        workspaceId: workspaceId,
        role: "OWNER" as const,
        joinedAt: new Date(ownerCreatedAt || new Date()),
        user: {
          id: workspaceOwner.id,
          name: workspaceOwner.name,
          email: workspaceOwner.email,
          image: 'image' in workspaceOwner ? (workspaceOwner as any).image ?? null : null,
        },
      };
      return [ownerMember, ...membersList];
    }

    // If owner is already in the list, ensure they appear first
    if (workspaceOwner && ownerAlreadyInList) {
      const ownerMember = membersList.find((m: { role: string }) => m.role === "OWNER");
      const otherMembers = membersList.filter((m: { role: string }) => m.role !== "OWNER");

      if (ownerMember) {
        return [ownerMember, ...otherMembers];
      }
    }

    return membersList;
  }, [members, owner, workspace, workspaceCreatedAt]);

  const getRoleLabel = (role: string): string => {
    const key = role.toLowerCase() as "owner" | "admin" | "member" | "viewer";
    return t(`roles.${key}`);
  };

  const handleRemoveMember = async (userId: string) => {
    if (confirm(t("confirmRemove"))) {
      try {
        await removeMemberMutation.mutateAsync({ workspaceId, userId });
        toast.success(t("removeSuccess"));
      } catch (error) {
        toast.error(getErrorMessage(error, t("removeError")));
      }
    }
  };

  if (isLoadingMembers || isLoadingInvitations) {
    return <div className="p-8 text-center">{t("loading")}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{t("membersTitle")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("membersDescription")}
          </p>
        </div>
        {permissions.canInvite && (
          <Button onClick={() => setIsInviteDialogOpen(true)} size="icon" className="sm:w-auto sm:px-4">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{t("inviteMember")}</span>
          </Button>
        )}
      </div>

      {/* Members List */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("user")}</TableHead>
              <TableHead>{t("role")}</TableHead>
              <TableHead>{t("joined")}</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allMembers.map((member: WorkspaceMember) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.user?.image ?? undefined} />
                      <AvatarFallback>
                        {member.user?.name?.charAt(0) || member.user?.email?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{member.user?.name || t("unknownUser")}</span>
                      <span className="text-xs text-muted-foreground">{member.user?.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={member.role === "OWNER" ? "default" : "outline"} className={member.role === "OWNER" ? "bg-amber-500/10 text-amber-600 border-amber-500/30" : ""}>
                    {member.role === "OWNER" && <Crown className="mr-1 h-3 w-3" />}
                    {getRoleLabel(member.role)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(member.joinedAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  {member.role !== "OWNER" && permissions.canManageMembers && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleRemoveMember(member.userId)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("remove")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Invitations List */}
      {invitations && invitations.length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">{t("invitationsTitle")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("invitationsDescription")}
            </p>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("email")}</TableHead>
                  <TableHead>{t("role")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{t("sent")}</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation: WorkspaceInvitation) => (
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
                      {format(new Date(invitation.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
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
