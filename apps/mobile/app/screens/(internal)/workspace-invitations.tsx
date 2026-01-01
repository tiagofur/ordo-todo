import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useThemeColors } from "@/app/data/hooks/use-theme-colors.hook";
import {
  useWorkspaceInvitations,
  useAcceptInvitation,
} from "@/app/lib/shared-hooks";

export default function WorkspaceInvitationsScreen() {
  const colors = useThemeColors();
  const [email, setEmail] = useState("");
  const [showInviteForm, setShowInviteForm] = useState(false);

  const {
    data: invitations = [],
    isLoading,
    refetch,
  } = useWorkspaceInvitations();
  const acceptInvitation = useAcceptInvitation();

  const pendingInvitations = invitations.filter(
    (inv) => inv.status === "PENDING",
  );
  const acceptedInvitations = invitations.filter(
    (inv) => inv.status === "ACCEPTED",
  );

  const handleAccept = async (invitationId: string) => {
    Alert.alert("Aceptar Invitación", "¿Quieres unirte a este workspace?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Aceptar",
        style: "default",
        onPress: async () => {
          // TODO: Implement accept invitation when token is available
          Alert.alert("Info", "Feature en desarrollo");
        },
      },
    ]);
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pendiente";
      case "ACCEPTED":
        return "Aceptada";
      case "EXPIRED":
        return "Expirada";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "#F59E0B"; // orange
      case "ACCEPTED":
        return "#10B981"; // green
      case "EXPIRED":
        return "#6B7280"; // gray
      default:
        return colors.textMuted;
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Invitaciones
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: colors.textMuted }]}
          >
            {pendingInvitations.length} pendientes
          </Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => refetch()}
        >
          <Feather name="refresh-cw" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : pendingInvitations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather
              name="inbox"
              size={64}
              color={colors.textMuted}
              style={styles.emptyIcon}
            />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Sin invitaciones pendientes
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: colors.textMuted }]}
            >
              Las invitaciones a tus workspaces aparecerán aquí
            </Text>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Pendientes ({pendingInvitations.length})
            </Text>
            {pendingInvitations.map((invitation) => (
              <View
                key={invitation.id}
                style={[
                  styles.invitationCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View style={styles.invitationContent}>
                  <Text
                    style={[styles.workspaceId, { color: colors.text }]}
                  >
                    {invitation.workspaceId}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(invitation.status) + "15" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(invitation.status) },
                      ]}
                    >
                      {formatStatus(invitation.status)}
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.acceptButton,
                    { backgroundColor: "#10B981" },
                  ]}
                  onPress={() => handleAccept(invitation.id)}
                  disabled={acceptInvitation.isPending}
                >
                  {acceptInvitation.isPending ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Feather name="check" size={18} color="#FFFFFF" />
                  )}
                </TouchableOpacity>

                {/* Time Info */}
                <View style={styles.timeInfo}>
                  <Feather name="clock" size={14} color={colors.textMuted} />
                  <Text style={[styles.timeText, { color: colors.textMuted }]}>
                    Expira en {new Date(invitation.expiresAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Past Invitations */}
        {acceptedInvitations.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Historial ({acceptedInvitations.length})
            </Text>
            {acceptedInvitations.slice(0, 10).map((invitation) => (
              <View
                key={invitation.id}
                style={[
                  styles.pastInvitationItem,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Text
                  style={[styles.workspaceId, { color: colors.text }]}
                >
                  {invitation.workspaceId}
                </Text>
                <View
                  style={[
                    styles.pastStatusBadge,
                    { backgroundColor: getStatusColor(invitation.status) + "15" },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(invitation.status) },
                    ]}
                  >
                    {formatStatus(invitation.status)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
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
    justifyContent: "space-between",
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.3,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  invitationCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  invitationContent: {
    flex: 1,
    gap: 8,
  },
  workspaceId: {
    fontSize: 16,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "500",
  },
  invitationActions: {
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptButton: {
    backgroundColor: "#10B981",
  },
  timeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeText: {
    fontSize: 13,
  },
  pastInvitationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  pastStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
});
