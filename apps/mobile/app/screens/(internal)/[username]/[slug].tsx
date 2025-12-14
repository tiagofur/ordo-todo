import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useThemeColors } from "@/app/data/hooks/use-theme-colors.hook";
import { useWorkspaceBySlug } from "@/app/hooks/api/use-workspaces";
import { useProjects } from "@/app/hooks/api/use-projects";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import Card from "@/app/components/shared/card.component";
import type { Project } from "@ordo-todo/api-client";

const TYPE_CONFIG = {
  PERSONAL: { color: "#06b6d4", icon: "briefcase" as const },
  WORK: { color: "#a855f7", icon: "folder" as const },
  TEAM: { color: "#ec4899", icon: "users" as const },
};

export default function WorkspaceDetailScreen() {
  const colors = useThemeColors();
  const { username, slug } = useLocalSearchParams();

  // Use workspace by slug (the backend endpoint supports username/slug)
  const { data: workspace, isLoading: isLoadingWorkspace } = useWorkspaceBySlug(username as string, slug as string);
  const { data: projects, isLoading: isLoadingProjects } = useProjects(workspace?.id);

  const handleProjectPress = (project: Project) => {
    // Navigate using username/slug/projects/projectSlug pattern
    if (project.slug) {
      router.push(`/screens/(internal)/${username}/${slug}/projects/${project.slug}`);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoadingWorkspace) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!workspace) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={64} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>Workspace no encontrado</Text>
        <Pressable onPress={handleBack} style={[styles.button, { backgroundColor: colors.primary }]}>
          <Text style={styles.buttonText}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  const typeInfo = TYPE_CONFIG[workspace.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.PERSONAL;
  const stats = workspace.stats || { projectCount: 0, taskCount: 0, memberCount: 0 };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[typeInfo.color, `${typeInfo.color}dd`]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </Pressable>

        <Animated.View entering={FadeInDown.delay(100)} style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Feather name={typeInfo.icon} size={32} color="#fff" />
          </View>
          <Text style={styles.workspaceName}>{workspace.name}</Text>
          {workspace.description && (
            <Text style={styles.workspaceDescription}>{workspace.description}</Text>
          )}
          {workspace.owner?.username && (
            <Text style={styles.ownerUsername}>@{workspace.owner.username}</Text>
          )}
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.projectCount}</Text>
            <Text style={styles.statLabel}>Proyectos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.taskCount}</Text>
            <Text style={styles.statLabel}>Tareas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.memberCount}</Text>
            <Text style={styles.statLabel}>Miembros</Text>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Projects Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Proyectos</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoadingProjects ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
        ) : projects?.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="folder" size={48} color={colors.textMuted} style={{ opacity: 0.5 }} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No hay proyectos en este workspace
            </Text>
          </View>
        ) : (
          projects?.map((project: Project, index: number) => (
            <Animated.View
              key={project.id}
              entering={FadeInDown.delay(300 + index * 100).springify()}
            >
              <Card onPress={() => handleProjectPress(project)} style={styles.projectCard}>
                <View style={styles.projectHeader}>
                  <View
                    style={[
                      styles.projectIcon,
                      { backgroundColor: `${project.color || typeInfo.color}20` },
                    ]}
                  >
                    <Feather name="folder" size={20} color={project.color || typeInfo.color} />
                  </View>
                  <View style={styles.projectInfo}>
                    <Text style={[styles.projectName, { color: colors.text }]}>
                      {project.name}
                    </Text>
                    {project.description && (
                      <Text
                        style={[styles.projectDescription, { color: colors.textSecondary }]}
                        numberOfLines={2}
                      >
                        {project.description}
                      </Text>
                    )}
                  </View>
                  <Feather name="chevron-right" size={20} color={colors.textMuted} />
                </View>
              </Card>
            </Animated.View>
          ))
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
    padding: 20,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  headerContent: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  workspaceName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  workspaceDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  ownerUsername: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 8,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.9,
    marginTop: 4,
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  projectCard: {
    marginBottom: 12,
    padding: 12,
  },
  projectHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  projectIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  projectDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
});
