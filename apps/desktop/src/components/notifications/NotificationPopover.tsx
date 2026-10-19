import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, ScrollArea, Popover, PopoverContent, PopoverTrigger } from "@ordo-todo/ui";
import { Bell, CheckCheck, Inbox } from "lucide-react";
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "@/lib/shared-hooks";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export function NotificationPopover() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const { data: notifications = [], isLoading } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();

  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const formatTime = (date: string | Date | null | undefined) => {
    if (!date) return "";
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return "";
      return formatDistanceToNow(dateObj, {
        addSuffix: true,
        locale: es,
      });
    } catch {
      return "";
    }
  };

  const unreadNumber = typeof unreadCount === "number" ? unreadCount : 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 hover:bg-muted hover:scale-105"
          aria-label="Notificaciones"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadNumber > 0 && (
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-pink-500 ring-2 ring-background animate-pulse" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-84 p-0 shadow-2xl border border-border/80">
        <div className="flex items-center justify-between p-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">Notificaciones</h4>
            {unreadNumber > 0 && (
              <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-full">
                {unreadNumber} nuevas
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                setOpen(false);
                navigate("/notifications");
              }}
            >
              Ver todas
            </Button>
            {unreadNumber > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsRead.isPending}
                title="Marcar todas como leídas"
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                Leídas
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[320px]">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Cargando notificaciones...
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[220px] text-muted-foreground">
              <Inbox className="h-10 w-10 mb-2 opacity-20" />
              <p className="text-sm">Sin notificaciones pendientes</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {notifications.map((notification: any) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-3.5 hover:bg-muted/60 transition-colors cursor-pointer relative",
                    !notification.isRead && "bg-blue-500/5 dark:bg-blue-900/10"
                  )}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                >
                  <div className="flex gap-2.5">
                    <div
                      className={cn(
                        "mt-1.5 h-2 w-2 rounded-full shrink-0",
                        !notification.isRead ? "bg-primary" : "bg-transparent"
                      )}
                    />
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="text-xs font-semibold leading-tight text-foreground">
                        {notification.title}
                      </p>
                      {notification.message && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
