import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useThemeColors } from "@/app/data/hooks/use-theme-colors.hook";
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "@/app/lib/shared-hooks";
import { formatDistanceToNow } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import i18n from "@/app/lib/i18n";

export default function NotificationsScreen() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);

  const { data: notifications = [], isLoading, refetch } = useNotifications();
  const { data: unreadData } = useUnreadNotificationsCount();
  const unreadCount = (unreadData as any)?.count || 0;
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id, {
      onSuccess: () => {
        console.log("Notification marked as read");
      },
      onError: (error: any) => {
        console.error("Error marking notification as read:", error);
      },
    });
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate(undefined, {
      onSuccess: () => {
        console.log("All notifications marked as read");
      },
      onError: (error: any) => {
        console.error("Error marking all as read:", error);
      },
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatTime = (date: Date | string) => {
    const currentLocale = i18n.language;
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: currentLocale === "es" ? es : enUS,
    });
  };

  const getNotificationIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      TASK_ASSIGNED: "check-square",
      TASK_MENTIONED: "at-sign",
      TASK_COMPLETED: "check-circle",
      TASK_DUE_SOON: "clock",
      TASK_OVERDUE: "alert-circle",
      COMMENT_ADDED: "message-square",
      WORKSPACE_INVITATION: "mail",
      PROJECT_SHARED: "share-2",
      REPORT_READY: "file-text",
    };
    return iconMap[type] || "bell";
  };

  const getNotificationColor = (type: string) => {
    const colorMap: Record<string, string> = {
      TASK_ASSIGNED: "#3B82F6",
      TASK_MENTIONED: "#8B5CF6",
      TASK_COMPLETED: "#10B981",
      TASK_DUE_SOON: "#F59E0B",
      TASK_OVERDUE: "#EF4444",
      COMMENT_ADDED: "#6366F1",
      WORKSPACE_INVITATION: "#EC4899",
      PROJECT_SHARED: "#14B8A6",
      REPORT_READY: "#F97316",
    };
    return colorMap[type] || colors.textMuted;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t("Notifications.title")}
        </Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {/* Mark all as read button */}
      {unreadCount > 0 && (
        <TouchableOpacity
          style={[
            styles.markAllButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={handleMarkAllAsRead}
          disabled={markAllAsRead.isPending}
        >
          <Feather name="check-check" size={16} color={colors.primary} />
          <Text style={[styles.markAllText, { color: colors.primary }]}>
            {t("Notifications.markAllRead")}
          </Text>
        </TouchableOpacity>
      )}

      {/* Notifications List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {isLoading ? (
          <View style={styles.centerContainer}>
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>
              {t("Notifications.loading")}
            </Text>
          </View>
        ) : (notifications as any[]).length === 0 ? (
          <View style={styles.centerContainer}>
            <Feather
              name="bell-off"
              size={48}
              color={colors.textMuted}
              style={styles.emptyIcon}
            />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {t("Notifications.empty")}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              Te avisaremos cuando haya novedades
            </Text>
          </View>
        ) : (
          (notifications as any[]).map((notification: any) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationItem,
                {
                  backgroundColor: !notification.read
                    ? colors.primary + "08"
                    : colors.surface,
                  borderLeftColor: !notification.read
                    ? colors.primary
                    : colors.border,
                },
              ]}
              onPress={() =>
                !notification.read && handleMarkAsRead(notification.id)
              }
              activeOpacity={0.7}
            >
              <View style={styles.notificationContent}>
                {/* Icon */}
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor:
                        getNotificationColor(notification.type) + "15",
                    },
                  ]}
                >
                  <Feather
                    name={getNotificationIcon(notification.type)}
                    size={20}
                    color={getNotificationColor(notification.type)}
                  />
                </View>

                {/* Text Content */}
                <View style={styles.textContent}>
                  <View style={styles.titleRow}>
                    <Text
                      style={[
                        styles.title,
                        {
                          color: colors.text,
                          fontWeight: !notification.read ? "700" : "500",
                        },
                      ]}
                      numberOfLines={2}
                    >
                      {notification.title}
                    </Text>
                  </View>
                  {notification.message && (
                    <Text
                      style={[styles.message, { color: colors.textMuted }]}
                      numberOfLines={3}
                    >
                      {notification.message}
                    </Text>
                  )}
                  <Text style={[styles.timestamp, { color: colors.textMuted }]}>
                    {formatTime(notification.createdAt)}
                  </Text>
                </View>

                {/* Unread indicator */}
                {!notification.read && (
                  <View
                    style={[
                      styles.unreadIndicator,
                      { backgroundColor: colors.primary },
                    ]}
                  />
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginRight: 8,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    margin: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.4,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    borderLeftWidth: 4,
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  textContent: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
