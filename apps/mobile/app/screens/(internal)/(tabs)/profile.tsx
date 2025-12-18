import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  ZoomIn,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/lib/api-client";
import UserAvatar from "../../../components/shared/user-avatar.component";
import useSession from "../../../data/hooks/use-session.hook";
import { useThemeColors } from "@/app/data/hooks/use-theme-colors.hook";
import Card from "@/app/components/shared/card.component";
import { useTranslation } from "react-i18next";

// Profile options will be built with translations in the component

export default function Profile() {
  const { user, endSession } = useSession();
  const colors = useThemeColors();
  const { t } = useTranslation();

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiClient.getDashboardStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Build profile options with translations
  const PROFILE_OPTIONS = useMemo(() => [
    { icon: "heart", label: "Bienestar", color: "#ec4899", route: "/screens/(internal)/wellbeing" },
    { icon: "users", label: "Carga de Trabajo", color: "#f97316", route: "/screens/(internal)/workload" },
    { icon: "bell", label: t('Mobile.profileOptions.notifications'), color: "#667EEA", hasSwitch: true },
    { icon: "moon", label: t('Mobile.profileOptions.darkMode'), color: "#9F7AEA", hasSwitch: true },
    { icon: "settings", label: t('Mobile.profileOptions.settings'), color: "#4299E1" },
    { icon: "help-circle", label: t('Mobile.profileOptions.help'), color: "#48BB78" },
    { icon: "info", label: t('Mobile.profileOptions.about'), color: "#ED8936" },
  ], [t]);

  const profileStats = useMemo(() => [
    { 
      icon: "check-circle", 
      label: t('Mobile.profileOptions.completed'), 
      value: stats?.tasks?.toString() || "0", 
      color: "#48BB78" 
    },
    { 
      icon: "clock", 
      label: t('Mobile.profileOptions.focusMinutes'), 
      value: stats?.minutes?.toString() || "0", 
      color: "#ED8936" 
    },
    { 
      icon: "target", 
      label: t('Mobile.profileOptions.pomodoros'), 
      value: stats?.pomodoros?.toString() || "0", 
      color: "#667EEA" 
    },
  ], [stats, t]);

  const handleLogout = () => {
    Alert.alert(
      t('Mobile.profileOptions.logoutTitle'),
      t('Mobile.profileOptions.logoutMessage'),
      [
        {
          text: t('Mobile.profileOptions.cancel'),
          style: "cancel",
        },
        {
          text: t('Mobile.profileOptions.exit'),
          style: "destructive",
          onPress: () => {
            endSession();
            router.replace("/");
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>{t('Mobile.profileOptions.loading')}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header con gradiente */}
        <Animated.View entering={FadeIn.duration(600)}>
          <LinearGradient
            colors={[colors.primary, colors.primaryLight]}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Animated.View entering={ZoomIn.delay(200).springify()}>
              <View style={styles.avatarContainer}>
                <UserAvatar name={user.name || ""} size={100} />
                <View style={styles.avatarBadge}>
                  <Feather name="check" size={16} color="#FFFFFF" />
                </View>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300)}>
              <Text style={styles.userName}>{user.name}</Text>
              {user.username && (
                <Text style={styles.userUsername}>@{user.username}</Text>
              )}
              <Text style={styles.userEmail}>{user.email}</Text>
            </Animated.View>
          </LinearGradient>
        </Animated.View>

        {/* Estadísticas */}
        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          style={styles.statsContainer}
        >
          {profileStats.map((stat, index) => (
            <Animated.View
              key={stat.label}
              entering={FadeInDown.delay(500 + index * 100).springify()}
              style={{ flex: 1 }}
            >
              <Card padding={16} style={styles.statCard}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: `${stat.color}20` },
                  ]}
                >
                  <Feather name={stat.icon as any} size={24} color={stat.color} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {stat.value}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {stat.label}
                </Text>
              </Card>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Opciones del perfil */}
        <Animated.View entering={FadeInDown.delay(700)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('Mobile.profileOptions.settings')}
          </Text>

          {PROFILE_OPTIONS.map((option, index) => (
            <Animated.View
              key={option.label}
              entering={FadeInDown.delay(800 + index * 80).springify()}
            >
              <Card
                onPress={() => {
                  if ((option as any).route) {
                    router.push((option as any).route);
                  } else {
                    console.log(option.label);
                  }
                }}
                style={styles.optionCard}
                padding={16}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionLeft}>
                    <View
                      style={[
                        styles.optionIconContainer,
                        { backgroundColor: `${option.color}15` },
                      ]}
                    >
                      <Feather
                        name={option.icon as any}
                        size={20}
                        color={option.color}
                      />
                    </View>
                    <Text style={[styles.optionLabel, { color: colors.text }]}>
                      {option.label}
                    </Text>
                  </View>
                  <Feather
                    name="chevron-right"
                    size={20}
                    color={colors.textMuted}
                  />
                </View>
              </Card>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Botón de cerrar sesión */}
        <Animated.View entering={FadeInDown.delay(1200)}>
          <Pressable onPress={handleLogout}>
            <Card
              style={{ ...styles.logoutCard, borderColor: colors.error }}
              padding={16}
              variant="outlined"
            >
              <View style={styles.logoutContent}>
                <View
                  style={[
                    styles.logoutIconContainer,
                    { backgroundColor: `${colors.error}15` },
                  ]}
                >
                  <Feather name="log-out" size={20} color={colors.error} />
                </View>
                <Text style={[styles.logoutText, { color: colors.error }]}>
                  {t('Mobile.profileOptions.logout')}
                </Text>
              </View>
            </Card>
          </Pressable>
        </Animated.View>

        {/* Versión */}
        <Animated.View
          entering={FadeIn.delay(1400)}
          style={styles.versionContainer}
        >
          <Text style={[styles.versionText, { color: colors.textMuted }]}>
            {t('Mobile.profileOptions.version')} 1.0.0
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 24,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#48BB78",
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  userName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
    textAlign: "center",
  },
  userEmail: {
    fontSize: 15,
    color: "#FFFFFF",
    opacity: 0.9,
    textAlign: "center",
  },
  userUsername: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.8,
    marginBottom: 4,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    alignItems: "center",
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  optionCard: {
    marginBottom: 12,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  logoutCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  logoutContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  logoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700",
  },
  versionContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  versionText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
