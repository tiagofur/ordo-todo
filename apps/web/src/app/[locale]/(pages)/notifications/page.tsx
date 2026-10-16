
"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/shared/app-layout";
import { Button, ScrollArea, Card } from "@ordo-todo/ui";
import { CheckCheck, Inbox, Bell, Loader2 } from "lucide-react";
import { useNotifications, useUnreadNotificationsCount, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from "@/lib/api-hooks";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { es, enUS, ptBR } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";
import { Notification } from "@ordo-todo/api-client";

export default function NotificationsPage() {
  const t = useTranslations('Notifications');
  const locale = useLocale();
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

      return formatDistanceToNow(dateObj, {
        addSuffix: true,
        locale: localeMap[locale] || enUS
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
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="w-6 h-6 text-pink-500" />
              {t('title')}
            </h1>
            <p className="text-muted-foreground">Stay updated with your team activity.</p>
          </div>
          {(unreadCount as number) > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
              className="gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              {t('markAllRead')}
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 pb-2 border-b border-border/50">
            <Button 
                variant={filter === 'all' ? 'secondary' : 'ghost'} 
                size="sm"
                onClick={() => setFilter('all')}
            >
                All
            </Button>
            <Button 
                variant={filter === 'unread' ? 'secondary' : 'ghost'} 
                size="sm"
                onClick={() => setFilter('unread')}
                className="relative"
            >
                Unread
                {(unreadCount as number) > 0 && (
                    <span className="ml-2 bg-pink-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                        {unreadCount as number}
                    </span>
                )}
            </Button>
        </div>

        {/* Content */}
        <div className="space-y-4">
             {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                </div>
             ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-card/50 rounded-xl border border-dashed border-border">
                    <Inbox className="w-12 h-12 mb-4 opacity-20" />
                    <p>{filter === 'unread' ? "You're all caught up!" : t('empty')}</p>
                </div>
             ) : (
                <div className="space-y-2">
                    {filteredNotifications.map((notification: Notification) => (
                        <Card 
                            key={notification.id}
                            className={cn(
                                "p-4 transition-all duration-200 cursor-default hover:shadow-md",
                                !notification.isRead ? "bg-card border-l-4 border-l-pink-500" : "bg-card/50 opacity-80"
                            )}
                        >
                            <div className="flex gap-4">
                                <div className={cn(
                                    "mt-1 w-2 h-2 rounded-full shrink-0",
                                    !notification.isRead ? "bg-pink-500" : "bg-transparent"
                                )} />
                                
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className={cn("font-medium", !notification.isRead && "font-semibold")}>
                                            {notification.title}
                                        </h4>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                                            {formatTime(notification.createdAt)}
                                        </span>
                                    </div>
                                    
                                    {notification.message && (
                                        <p className="text-sm text-muted-foreground">
                                            {notification.message}
                                        </p>
                                    )}

                                    {!notification.isRead && (
                                        <div className="pt-2 flex justify-end">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-6 text-xs"
                                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                                            >
                                                Mark as read
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
    </AppLayout>
  );
}
