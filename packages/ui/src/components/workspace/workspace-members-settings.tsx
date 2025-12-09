"use client";

import { useState } from "react";
import { Plus, Mail, Trash2, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";

import { Button } from "../ui/button.js";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar.js";
import { Badge } from "../ui/badge.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu.js";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table.js";
import { InviteMemberDialog, InviteFormValues } from "./invite-member-dialog.js";

export interface WorkspaceMember {
  id: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
  joinedAt: string;
  user?: {
    name?: string;
    email?: string;
    image?: string;
  };
}

export interface WorkspaceInvitation {
  id: string;
  email: string;
  role: "ADMIN" | "MEMBER" | "VIEWER";
  status: "PENDING" | "ACCEPTED" | "EXPIRED";
  createdAt: string;
}

export interface WorkspaceMembersSettingsLabels {
  loading?: string;
  membersTitle?: string;
  membersDescription?: string;
  inviteMember?: string;
  user?: string;
  role?: string;
  joined?: string;
  email?: string;
  status?: string;
  sent?: string;
  remove?: string;
  confirmRemove?: string;
  invitationsTitle?: string;
  invitationsDescription?: string;
  unknownUser?: string;
  inviteDialog?: {
    title?: string;
    description?: string;
    emailLabel?: string;
    roleLabel?: string;
    cancel?: string;
    invite?: string;
    copied?: string;
    done?: string;
  };
}

export interface WorkspaceMembersSettingsProps {
  members?: WorkspaceMember[];
  invitations?: WorkspaceInvitation[];
  isLoading?: boolean;
  onInviteMember: (data: InviteFormValues) => Promise<{ devToken?: string } | void>;
  onRemoveMember: (userId: string) => Promise<void>;
  onDeleteInvitation?: (invitationId: string) => Promise<void>;
  isInvitePending?: boolean;
  isRemovePending?: boolean;
  labels?: WorkspaceMembersSettingsLabels;
  baseUrl?: string;
  onInviteCopied?: () => void;
}

export function WorkspaceMembersSettings({
  members = [],
  invitations = [],
  isLoading = false,
  onInviteMember,
  onRemoveMember,
  onDeleteInvitation,
  isInvitePending = false,
  labels = {},
  baseUrl = "",
  onInviteCopied,
}: WorkspaceMembersSettingsProps) {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  if (isLoading) {
    return <div className="p-8 text-center">{labels.loading ?? "Loading..."}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">
            {labels.membersTitle ?? "Team Members"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {labels.membersDescription ?? "Manage who has access to this workspace."}
          </p>
        </div>
        <Button onClick={() => setIsInviteDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {labels.inviteMember ?? "Invite Member"}
        </Button>
      </div>

      {/* Members List */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{labels.user ?? "User"}</TableHead>
              <TableHead>{labels.role ?? "Role"}</TableHead>
              <TableHead>{labels.joined ?? "Joined"}</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.user?.image} />
                      <AvatarFallback>
                        {member.user?.name?.charAt(0) ||
                          member.user?.email?.charAt(0) ||
                          "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {member.user?.name || labels.unknownUser || "Unknown User"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {member.user?.email}
                      </span>
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
                          onClick={() => {
                            if (confirm(labels.confirmRemove ?? "Are you sure you want to remove this member?")) {
                              onRemoveMember(member.userId);
                            }
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {labels.remove ?? "Remove"}
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
      {invitations.length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">
              {labels.invitationsTitle ?? "Pending Invitations"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {labels.invitationsDescription ?? "Invitations that haven't been accepted yet."}
            </p>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{labels.email ?? "Email"}</TableHead>
                  <TableHead>{labels.role ?? "Role"}</TableHead>
                  <TableHead>{labels.status ?? "Status"}</TableHead>
                  <TableHead>{labels.sent ?? "Sent"}</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
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
                      {onDeleteInvitation && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onDeleteInvitation(invitation.id)}
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
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        onSubmit={onInviteMember}
        isPending={isInvitePending}
        labels={labels.inviteDialog}
        baseUrl={baseUrl}
        onCopy={onInviteCopied}
      />
    </div>
  );
}
