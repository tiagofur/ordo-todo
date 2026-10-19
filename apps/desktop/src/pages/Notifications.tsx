
import React, { useState } from "react";
import { Button, Card, cn } from "@ordo-todo/ui";
import { CheckCheck, Inbox, Bell, Loader2 } from "lucide-react";
import { useNotifications, useUnreadNotificationsCount, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from "@/lib/shared-hooks";
import { formatDistanceToNow } from "date-fns";
import { es, enUS, ptBR } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { Notification } from "@ordo-todo/api-client";

export const Notifications = () => {
  const { t, i18n } = useTranslation();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const { data: notifications = [], isLoading } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    markAsRead.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const formatTime = (date: string | Date | null | undefined) => {
    if (!date) return '';

    const localeMap: Record<string, typeof enUS> = {
      es: es,
      'pt-br': ptBR,
      en: enUS
    };

    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return '';

      // Use current language or fallback to 'en'
      const currentFnLang = i18n.language.split('-')[0];
      const selectedLocale = localeMap[currentFnLang] || enUS;

      return formatDistanceToNow(dateObj, {
        addSuffix: true,
        locale: selectedLocale
      });
    } catch (error) {
      console.error('Error formatting date:', error, 'date value:', date);
      return '';
    }
  };

  const filteredNotifications = notifications.filter((n: Notification) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header - Apple Style Unified Pattern */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-pink-500 text-white shadow-sm shadow-pink-500/25 shrink-0">
            <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground m-0 leading-tight truncate">
              {t("Notifications.title") || "Notificaciones"}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate">
              {t("Notifications.subtitle") || "Mantente al día con la actividad de tu equipo y tareas"}
            </p>
          </div>
        </div>

        {(unreadCount as number) > 0 && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsRead.isPending}
            className="rounded-xl border-border/60 hover:bg-accent/50 gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-pink-500" />
            <span>{t("Notifications.markAllRead") || "Marcar todas como leídas"}</span>
          </Button>
        )}
      </div>

      {/* Filters - Apple Segmented Pill */}
      <div className="inline-flex items-center gap-1.5 rounded-2xl border border-border/60 bg-card p-1 shadow-xs">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={cn(
            "flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer",
            filter === 'all'
              ? "bg-pink-500 text-white shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <span>{t("Notifications.filterAll") || "Todas"}</span>
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={cn(
            "flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer",
            filter === 'unread'
              ? "bg-pink-500 text-white shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <span>{t("Notifications.filterUnread") || "No leídas"}</span>
          {(unreadCount as number) > 0 && (
            <span className={cn(
              "px-1.5 py-0.2 rounded-full text-[10px] font-bold tabular-nums",
              filter === 'unread' ? "bg-white/20 text-white" : "bg-pink-500 text-white"
            )}>
              {unreadCount as number}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-card/40 rounded-2xl border border-dashed border-border/60 p-8 text-center">
            <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3 text-muted-foreground/60">
              <Inbox className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {filter === 'unread' ? (t("Notifications.emptyUnread") || "¡Estás al día! No tienes notificaciones pendientes") : (t("Notifications.emptyAll") || "No tienes notificaciones en este momento")}
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              {t("Notifications.subtitle") || "Mantente al día con la actividad de tu equipo y tareas"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification: Notification) => (
              <Card 
                key={notification.id}
                className={cn(
                  "rounded-2xl border p-4 sm:p-5 transition-all duration-200 cursor-default shadow-xs",
                  !notification.isRead 
                    ? "border-pink-500/30 bg-card shadow-pink-500/5 hover:border-pink-500/50" 
                    : "border-border/60 bg-card/60 opacity-85 hover:border-border hover:opacity-100"
                )}
              >
                <div className="flex items-start gap-3.5">
                  <div className={cn(
                    "mt-1.5 h-2 w-2 rounded-full shrink-0",
                    !notification.isRead ? "bg-pink-500 shadow-xs shadow-pink-500/50" : "bg-muted-foreground/30"
                  )} />
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-start gap-3">
                      <h4 className={cn("text-sm text-foreground", !notification.isRead ? "font-semibold" : "font-medium")}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                    
                    {notification.message && (
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {notification.message}
                      </p>
                    )}

                    {!notification.isRead && (
                      <div className="pt-2 flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-xs rounded-xl hover:bg-pink-500/10 hover:text-pink-500 text-muted-foreground cursor-pointer"
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                        >
                          {t("Notifications.markAsRead") || "Marcar como leída"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
