import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useDesignTokens } from "@/app/lib/use-design-tokens";
import { useWorkspaces } from "@/app/lib/shared-hooks";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown, LinearTransition } from "react-native-reanimated";
import Card from "@/app/components/shared/card.component";
import { useWorkspaceStore } from "@/app/lib/stores";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "@/app/lib/hooks/use-media-query";

export default function WorkspacesScreen() {
  const { colors } = useDesignTokens();
  const { data: workspaces, isLoading } = useWorkspaces();
  const { setSelectedWorkspaceId } = useWorkspaceStore();
  const { t } = useTranslation();
  const { isTablet } = useMediaQuery();

  const handleWorkspacePress = (workspace: any) => {
    setSelectedWorkspaceId(workspace.id);

    // Navigate using username/slug pattern
    if (workspace.owner?.username) {
      router.push(
        `/screens/(internal)/${workspace.owner.username}/${workspace.slug}`,
      );
    } else {
      router.push(`/screens/(internal)/workspaces/${workspace.id}`);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.section.workspaces} />
      </View>
    );
  }

  const renderItem = ({ item: workspace, index }: { item: any, index: number }) => {
    const workspaceColor = workspace.color || colors.section.workspaces;
    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100).springify()}
        style={isTablet ? { flex: 1, marginHorizontal: 8 } : { marginHorizontal: 20 }}
      >
        <Card
          onPress={() => handleWorkspacePress(workspace)}
          style={styles.workspaceCard}
          padding={16}
        >
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.iconBox,
                { backgroundColor: workspaceColor, shadowColor: workspaceColor, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
              ]}
            >
              <Feather
                name="briefcase"
                size={24}
                color="#FFF"
              />
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.workspaceName, { color: colors.foreground }]}>
                {workspace.name}
              </Text>
              {workspace.description && (
                <Text
                  style={[styles.workspaceDescription, { color: colors.mutedForeground }]}
                  numberOfLines={2}
                >
                  {workspace.description}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.cardFooter}>
            {workspace.owner?.username ? (
              <Text style={[styles.username, { color: colors.mutedForeground }]}>
                @{workspace.owner.username}
              </Text>
            ) : (
              <View /> 
            )}
          </View>
        </Card>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
       <Animated.FlatList
        key={isTablet ? 'tablet' : 'mobile'}
        numColumns={isTablet ? 2 : 1}
        columnWrapperStyle={isTablet ? { gap: 0, paddingHorizontal: 12 } : undefined}
        itemLayoutAnimation={LinearTransition}
        data={workspaces}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <View style={styles.headerMain}>
              <View style={[styles.headerIcon, { backgroundColor: colors.section.workspaces, shadowColor: colors.section.workspaces, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 }]}>
                <Feather name="briefcase" size={26} color="#FFF" />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t("Mobile.workspaces.title")}</Text>
                <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
                  Tus espacios de colaboración
                </Text>
              </View>
            </View>
          </View>
        }
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.muted }]}>
                <Feather name="briefcase" size={48} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyText, { color: colors.foreground }]}>
              {t("Mobile.workspaces.noWorkspaces")}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
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
  listContent: {
    paddingBottom: 100,
  },
  headerContainer: {
    padding: 24,
    paddingTop: 20,
    marginBottom: 8,
  },
  headerMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2
  },
  workspaceCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  workspaceName: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  workspaceDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500'
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.03)'
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: 'uppercase'
  },
  username: {
    fontSize: 12,
    fontWeight: "700",
  },
  emptyState: {
    padding: 60,
    alignItems: "center",
    justifyContent: "center",
    gap: 16
  },
  emptyIconContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: 'center'
  },
});
