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

interface Invitation {
  id: string;
  workspaceId: string;
  email: string;
  role: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";
  createdAt: Date;
  expiresAt: Date;
  invitedById?: string;
}

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
  const declinedInvitations = invitations.filter(
    (inv) => inv.status === "DECLINED",
  );

  const handleAccept = async (invitationId: string) => {
    Alert.alert("Aceptar Invitación", "¿Quieres unirte a este workspace?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Aceptar",
        style: "default",
        onPress: async () => {
          // TODO: Implement accept invitation with token
          Alert.alert("Info", "Feature en desarrollo");
        },
      },
    ]);
  };

  const handleDecline = async (invitationId: string) => {
    Alert.alert(
      "Rechazar Invitación",
      "¿Seguro que quieres rechazar esta invitación?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Rechazar",
          style: "destructive",
          onPress: async () => {
            // TODO: Implement decline invitation when hook is available
            console.log("Decline invitation:", invitationId);
          },
        },
      ],
    );
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pendiente";
      case "ACCEPTED":
        return "Aceptada";
      case "DECLINED":
        return "Rechazada";
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
      case "DECLINED":
        return "#EF4444"; // red
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
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
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

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Pendientes ({pendingInvitations.length})
            </Text>
            {pendingInvitations.map((invitation) => (
              <View
                key={invitation.id}
                style={[
                  styles.invitationCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                {/* Workspace Info */}
                <View style={styles.invitationHeader}>
                  <View
                    style={[
                      styles.workspaceIndicator,
                      { backgroundColor: colors.primary + "15" },
                    ]}
                  >
                    <View
                      style={[
                        styles.workspaceDot,
                        { backgroundColor: colors.primary },
                      ]}
                    />
                  </View>
                  <View style={styles.invitationInfo}>
                    <Text
                      style={[styles.workspaceName, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {invitation.workspaceId}
                    </Text>
                    <Text
                      style={[styles.inviterInfo, { color: colors.textMuted }]}
                      numberOfLines={2}
                    >
                      Invitado por {invitation.invitedById || invitation.email}
                    </Text>
                  </View>
                </View>
                  <View style={styles.invitationInfo}>
                    <Text
                      style={[styles.workspaceName, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {invitation.workspaceName}
                    </Text>
                    <Text
                      style={[styles.inviterInfo, { color: colors.textMuted }]}
                      numberOfLines={2}
                    >
                      Invitado por{" "}
                      {invitation.invitedByName || invitation.invitedByEmail}
                    </Text>
                  </View>
                </View>

                {/* Status */}
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: getStatusColor(invitation.status) + "15",
                    },
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

                {/* Actions */}
                <View style={styles.invitationActions}>
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
                </View>

                {/* Time Info */}
                <View style={styles.timeInfo}>
                  <Feather name="clock" size={14} color={colors.textMuted} />
                  <Text style={[styles.timeText, { color: colors.textMuted }]}>
                    Expira en{" "}
                    {new Date(invitation.expiresAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}

            {/* Invite New Members Form */}
            <TouchableOpacity
              style={[
                styles.inviteFormToggle,
                { backgroundColor: colors.primary },
              ]}
              onPress={() => setShowInviteForm(!showInviteForm)}
            >
              <Feather name="plus" size={20} color="#FFFFFF" />
              <Text style={styles.inviteFormText}>
                {showInviteForm
                  ? "Ocultar formulario"
                  : "Invitar nuevos miembros"}
              </Text>
            </TouchableOpacity>

            {showInviteForm && (
              <View
                style={[styles.inviteForm, { backgroundColor: colors.surface }]}
              >
                <Text style={[styles.formTitle, { color: colors.text }]}>
                  Invitar por email
                </Text>
                <TextInput
                  style={[
                    styles.emailInput,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  placeholder="ejemplo@correo.com"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={() => {
                    // TODO: Implement send invitation
                    console.log("Send invitation to:", email);
                  }}
                >
                  <Text style={styles.sendButtonText}>Enviar invitación</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Empty State */}
        {pendingInvitations.length === 0 && (
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
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              Las invitaciones a tus workspaces aparecerán aquí
            </Text>
          </View>
        )}

        {/* Past Invitations (Accepted/Declined) */}
        {(acceptedInvitations.length > 0 || declinedInvitations.length > 0) && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Historial (
              {acceptedInvitations.length + declinedInvitations.length})
            </Text>
            {[...acceptedInvitations, ...declinedInvitations]
              .slice(0, 10)
              .map((invitation) => (
                <View
                  key={invitation.id}
                  style={[
                    styles.pastInvitationItem,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                <View style={styles.pastInvitationInfo}>
                  <Text
                    style={[styles.workspaceName, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {invitation.workspaceId}
                  </Text>
                  <Text
                    style={[styles.inviterInfo, { color: colors.textMuted }]}
                    numberOfLines={1}
                  >
                    {invitation.status === "ACCEPTED"
                      ? "Aceptada"
                      : "Rechazada"}
                  </Text>
                </View>
                  <View
                    style={[
                      styles.pastStatusBadge,
                      {
                        backgroundColor:
                          getStatusColor(invitation.status) + "15",
                      },
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
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  invitationCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  invitationHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  workspaceIndicator: {
    width: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  workspaceDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  invitationInfo: {
    flex: 1,
    gap: 4,
  },
  workspaceName: {
    fontSize: 16,
    fontWeight: "600",
  },
  inviterInfo: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  invitationActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  acceptButton: {
    backgroundColor: "#10B981",
  },
  declineButton: {
    backgroundColor: "#EF4444",
  },
  timeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeText: {
    fontSize: 12,
  },
  inviteFormToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 14,
    gap: 8,
  },
  inviteFormText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  inviteForm: {
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  emailInput: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  sendButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.3,
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
  pastInvitationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  pastInvitationInfo: {
    flex: 1,
    gap: 4,
  },
  pastStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
