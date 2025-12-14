import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useThemeColors } from "@/app/data/hooks/use-theme-colors.hook";
import { useWorkspaces } from "@/app/hooks/api/use-workspaces";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import Card from "@/app/components/shared/card.component";
import { useState } from "react";
import type { Workspace } from "@ordo-todo/api-client";

const TYPE_CONFIG = {
  PERSONAL: { label: "Personal", color: "#06b6d4", icon: "briefcase" as const },
  WORK: { label: "Trabajo", color: "#a855f7", icon: "folder" as const },
  TEAM: { label: "Equipo", color: "#ec4899", icon: "users" as const },
};

export default function WorkspacesScreen() {
  const colors = useThemeColors();
  const { data: workspaces, isLoading } = useWorkspaces();

  const handleWorkspacePress = (workspace: Workspace) => {
    // Navigate using username/slug pattern
    if (workspace.owner?.username) {
      router.push(`/screens/(internal)/${workspace.owner.username}/${workspace.slug}`);
    } else {
      // Fallback
      router.push(`/screens/(internal)/workspaces/${workspace.id}`);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primaryLight]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={styles.greeting}>Mis Workspaces 🏢</Text>
          <Text style={styles.title}>Espacios de Trabajo</Text>
        </Animated.View>
      </LinearGradient>

      {/* Workspaces List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {workspaces?.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="briefcase" size={64} color={colors.textMuted} style={{ opacity: 0.5 }} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No tienes workspaces aún
            </Text>
          </View>
        ) : (
          workspaces?.map((workspace: Workspace, index: number) => {
            const typeInfo = TYPE_CONFIG[workspace.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.PERSONAL;
            return (
              <Animated.View
                key={workspace.id}
                entering={FadeInDown.delay(200 + index * 100).springify()}
              >
                <Card onPress={() => handleWorkspacePress(workspace)} style={styles.workspaceCard}>
                  <View style={styles.cardHeader}>
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: `${typeInfo.color}20` },
                      ]}
                    >
                      <Feather name={typeInfo.icon} size={24} color={typeInfo.color} />
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={[styles.workspaceName, { color: colors.text }]}>
                        {workspace.name}
                      </Text>
                      {workspace.description && (
                        <Text
                          style={[styles.workspaceDescription, { color: colors.textSecondary }]}
                          numberOfLines={2}
                        >
                          {workspace.description}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <View style={[styles.badge, { backgroundColor: `${typeInfo.color}15` }]}>
                      <Text style={[styles.badgeText, { color: typeInfo.color }]}>
                        {typeInfo.label}
                      </Text>
                    </View>
                    {workspace.owner?.username && (
                      <Text style={[styles.username, { color: colors.textMuted }]}>
                        @{workspace.owner.username}
                      </Text>
                    )}
                  </View>
                </Card>
              </Animated.View>
            );
          })
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  greeting: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    opacity: 0.9,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  workspaceCard: {
    marginBottom: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  workspaceName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  workspaceDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  username: {
    fontSize: 12,
    fontWeight: "600",
  },
});
