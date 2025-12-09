"use client";

import { useState } from "react";
import { Button, Avatar, AvatarFallback, AvatarImage, Badge, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ordo-todo/ui";
import { useTranslations } from "next-intl";
import { Plus, Mail, User, Shield, Trash2, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";

import { useWorkspaceMembers, useWorkspaceInvitations, useRemoveWorkspaceMember } from "@/lib/api-hooks";
import { InviteMemberDialog } from "./invite-member-dialog";

interface WorkspaceMembersSettingsProps {
  workspaceId: string;
}

export function WorkspaceMembersSettings({ workspaceId }: WorkspaceMembersSettingsProps) {
  const t = useTranslations("WorkspaceMembersSettings");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  
  const { data: members, isLoading: isLoadingMembers } = useWorkspaceMembers(workspaceId);
  const { data: invitations, isLoading: isLoadingInvitations } = useWorkspaceInvitations(workspaceId);
  const removeMemberMutation = useRemoveWorkspaceMember();

  const handleRemoveMember = async (userId: string) => {
    if (confirm(t("confirmRemove"))) {
      await removeMemberMutation.mutateAsync({ workspaceId, userId });
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
        <Button onClick={() => setIsInviteDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("inviteMember")}
        </Button>
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
            {members?.map((member: any) => (
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
                      <span className="font-medium">{member.user?.name || t("unknownUser")}</span>
                      <span className="text-xs text-muted-foreground">{member.user?.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {member.role.toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(member.joinedAt), "MMM d, yyyy")}
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
                {invitations.map((invitation: any) => (
                  <TableRow key={invitation.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{invitation.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {invitation.role.toLowerCase()}
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
