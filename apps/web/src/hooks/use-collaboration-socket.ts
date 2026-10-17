"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { config } from "@/config";

export interface UserPresence {
  userId: string;
  userName: string;
  workspaceId: string;
  taskId?: string;
  lastSeen: string | Date;
}

export interface TaskUpdateEvent {
  taskId: string;
  changes: any;
  updatedBy: {
    userId: string;
    userName: string;
  };
  timestamp: string | Date;
}

interface UseCollaborationSocketOptions {
  workspaceId?: string | null;
  taskId?: string | null;
  onTaskUpdated?: (event: TaskUpdateEvent) => void;
  enabled?: boolean;
}

export function useCollaborationSocket({
  workspaceId,
  taskId,
  onTaskUpdated,
  enabled = true,
}: UseCollaborationSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [workspaceUsers, setWorkspaceUsers] = useState<UserPresence[]>([]);
  const [taskUsers, setTaskUsers] = useState<UserPresence[]>([]);

  const onTaskUpdatedRef = useRef(onTaskUpdated);
  useEffect(() => {
    onTaskUpdatedRef.current = onTaskUpdated;
  }, [onTaskUpdated]);

  useEffect(() => {
    if (typeof window === "undefined" || !enabled) return;

    let origin = config.api.baseURL;
    try {
      if (origin.startsWith("http")) {
        origin = new URL(origin).origin;
      } else {
        origin = window.location.origin;
      }
    } catch {
      origin = window.location.origin;
    }

    const socket = io(`${origin}/collaboration`, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      if (workspaceId) {
        socket.emit("join-workspace", { workspaceId });
      }
      if (taskId) {
        socket.emit("join-task", { taskId, workspaceId });
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      setWorkspaceUsers([]);
      setTaskUsers([]);
    });

    socket.on("presence-update", (users: UserPresence[]) => {
      setWorkspaceUsers(users || []);
    });

    socket.on("task-presence", (users: UserPresence[]) => {
      setTaskUsers(users || []);
    });

    socket.on("task-updated", (event: TaskUpdateEvent) => {
      onTaskUpdatedRef.current?.(event);
    });

    return () => {
      if (taskId) {
        socket.emit("leave-task", { taskId });
      }
      if (workspaceId) {
        socket.emit("leave-workspace", { workspaceId });
      }
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [enabled]);

  // Manage workspace room joins/leaves
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !socket.connected || !workspaceId) return;

    socket.emit("join-workspace", { workspaceId });

    return () => {
      socket.emit("leave-workspace", { workspaceId });
    };
  }, [workspaceId]);

  // Manage task room joins/leaves
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !socket.connected || !taskId) return;

    socket.emit("join-task", { taskId, workspaceId });

    return () => {
      socket.emit("leave-task", { taskId });
      setTaskUsers([]);
    };
  }, [taskId, workspaceId]);

  const broadcastTaskUpdate = useCallback(
    (changes: any) => {
      const socket = socketRef.current;
      if (socket?.connected && taskId && workspaceId) {
        socket.emit("task-update", {
          taskId,
          changes,
          workspaceId,
        });
      }
    },
    [taskId, workspaceId]
  );

  return {
    isConnected,
    workspaceUsers,
    taskUsers,
    broadcastTaskUpdate,
  };
}
