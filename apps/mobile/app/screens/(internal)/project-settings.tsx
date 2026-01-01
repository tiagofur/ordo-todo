import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useThemeColors } from "@/app/data/hooks/use-theme-colors.hook";
import { useUpdateProject } from "@/app/lib/shared-hooks";

interface ProjectSettings {
  name: string;
  description: string;
  color: string;
  defaultPriority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  allowComments: boolean;
  allowAttachments: boolean;
  allowGuests: boolean;
  notifyOnTaskComplete: boolean;
  notifyOnDueDateReminder: boolean;
  isPublic: boolean;
  membersCount: number;
}

interface ProjectSettingsProps {
  projectId: string;
}

export default function ProjectSettingsScreen({
  projectId,
}: ProjectSettingsProps) {
  const colors = useThemeColors();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [settings, setSettings] = useState<ProjectSettings>({
    name: "",
    description: "",
    color: "#3B82F6",
    defaultPriority: "MEDIUM",
    allowComments: true,
    allowAttachments: true,
    allowGuests: false,
    notifyOnTaskComplete: true,
    notifyOnDueDateReminder: true,
    isPublic: false,
    membersCount: 0,
  });

  const updateProject = useUpdateProject();

  const handleSave = async () => {
    if (!projectId) return;

    setIsSaving(true);
    try {
      await updateProject.mutateAsync(projectId, {
        name: settings.name,
        description: settings.description,
        color: settings.color,
        defaultPriority: settings.defaultPriority,
        allowComments: settings.allowComments,
        allowAttachments: settings.allowAttachments,
        allowGuests: settings.allowGuests,
        notifyOnTaskComplete: settings.notifyOnTaskComplete,
        notifyOnDueDateReminder: settings.notifyOnDueDateReminder,
        isPublic: settings.isPublic,
      });
      Alert.alert("Éxito", "Configuración guardada");
    } catch (error) {
      console.error("Error saving project settings:", error);
      Alert.alert("Error", "No se pudo guardar la configuración");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    Alert.alert(
      "Eliminar Proyecto",
      "¿Seguro que quieres eliminar este proyecto? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            // TODO: Implement delete project hook
            setIsDeleting(true);
            Alert.alert("Info", "Feature en desarrollo");
            setIsDeleting(false);
          },
        },
      ],
    );
  };

  const COLOR_OPTIONS = [
    { label: "Azul", value: "#3B82F6" },
    { label: "Verde", value: "#10B981" },
    { label: "Rojo", value: "#EF4444" },
    { label: "Naranja", value: "#F97316" },
    { label: "Amarillo", value: "#F59E0B" },
    { label: "Morado", value: "#6366F1" },
    { label: "Cian", value: "#06B6D4" },
    { label: "Rosa", value: "#EC4899" },
    { label: "Gris", value: "#9CA3AF" },
    { label: "Violeta", value: "#8B5CF6" },
  ];

  const PRIORITY_OPTIONS = [
    { label: "Baja", value: "LOW" },
    { label: "Media", value: "MEDIUM" },
    { label: "Alta", value: "HIGH" },
    { label: "Urgente", value: "URGENT" },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Configuración del Proyecto
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            {settings.name || "Sin nombre"}
          </Text>
        </View>
        {isDeleting && (
          <ActivityIndicator size="small" color={colors.primary} />
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Project Info */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          {/* Name */}
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
              Nombre del proyecto
            </Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={settings.name}
              onChangeText={(text) =>
                setSettings((prev) => ({ ...prev, name: text }))
              }
              placeholder="Escribe el nombre del proyecto..."
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
              Descripción
            </Text>
            <TextInput
              style={[styles.textArea, { color: colors.text }]}
              value={settings.description}
              onChangeText={(text) =>
                setSettings((prev) => ({ ...prev, description: text }))
              }
              placeholder="Describe este proyecto..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Color */}
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
              Color del proyecto
            </Text>
          </View>
          <View style={styles.colorOptions}>
            {COLOR_OPTIONS.map((color) => (
              <TouchableOpacity
                key={color.value}
                style={[
                  styles.colorOption,
                  {
                    backgroundColor:
                      settings.color === color.value
                        ? color.value
                        : "transparent",
                    borderColor:
                      settings.color === color.value
                        ? color.value
                        : colors.border,
                  },
                ]}
                onPress={() =>
                  setSettings((prev) => ({ ...prev, color: color.value }))
                }
              >
                <View
                  style={[
                    styles.colorDot,
                    {
                      backgroundColor: color.value,
                      borderColor:
                        settings.color === color.value
                          ? "transparent"
                          : colors.border,
                      borderWidth: 1,
                      borderStyle:
                        settings.color === color.value ? "solid" : "dashed",
                    },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Default Priority */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Prioridad por defecto
          </Text>
          <View style={styles.priorityContainer}>
            {PRIORITY_OPTIONS.map((priority) => (
              <TouchableOpacity
                key={priority.value}
                style={[
                  styles.priorityOption,
                  {
                    backgroundColor:
                      settings.defaultPriority === priority.value
                        ? colors.primary + "15"
                        : "transparent",
                    borderColor:
                      settings.defaultPriority === priority.value
                        ? colors.primary
                        : colors.border,
                  },
                ]}
                onPress={() =>
                  setSettings((prev) => ({
                    ...prev,
                    defaultPriority: priority.value,
                  }))
                }
              >
                <Text
                  style={[
                    styles.priorityText,
                    {
                      color:
                        settings.defaultPriority === priority.value
                          ? colors.primary
                          : colors.text,
                      fontWeight:
                        settings.defaultPriority === priority.value
                          ? "700"
                          : "500",
                    },
                  ]}
                >
                  {priority.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Permissions */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Permisos
          </Text>

          <View style={styles.permissionsContainer}>
            <View
              style={[
                styles.permissionRow,
                { borderBottomColor: colors.border },
              ]}
            >
              <Text style={[styles.permissionLabel, { color: colors.text }]}>
                Permitir comentarios
              </Text>
              <View style={styles.permissionValue}>
                <Switch
                  value={settings.allowAttachments}
                  onValueChange={(value) =>
                    setSettings((prev) => ({ ...prev, allowAttachments: value }))
                  }
                />
              </View>
            </View>

            <View style={styles.permissionRow}>
              <Text style={[styles.permissionLabel, { color: colors.text }]}>
                Permitir archivos adjuntos
              </Text>
              <View style={styles.permissionValue}>
                <Switch
                  value={settings.allowAttachments}
                  onValueChange={(value) =>
                    setSettings((prev) => ({
                      ...prev,
                      allowAttachments: value,
                    }))
                  }
                  trackColor={colors.primary}
                />
              </View>
            </View>

            <View style={styles.permissionRow}>
              <Text style={[styles.permissionLabel, { color: colors.text }]}>
                Permitir invitados
              </Text>
              <View style={styles.permissionValue}>
                <Switch
                  value={settings.isPublic}
                  onValueChange={(value) =>
                    setSettings((prev) => ({ ...prev, isPublic: value }))
                  }
                />
              </View>
            </View>
            <View
              style={[
                styles.permissionRow,
                { borderBottomColor: colors.border },
              ]}
            >
              <Text style={[styles.permissionLabel, { color: colors.text }]}>
                Notificar al completar tarea
              </Text>
              <View style={styles.permissionValue}>
                <Switch
                  value={settings.notifyOnTaskComplete}
                  onValueChange={(value) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifyOnTaskComplete: value,
                    }))
                  }
                  trackColor={colors.primary}
                />
              </View>
            </View>

            <View style={styles.permissionRow}>
              <Text style={[styles.permissionLabel, { color: colors.text }]}>
                Recordatorio de fecha de vencimiento
              </Text>
              <View style={styles.permissionValue}>
                <Switch
                  value={settings.notifyOnDueDateReminder}
                  onValueChange={(value) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifyOnDueDateReminder: value,
                    }))
                  }
                  trackColor={colors.primary}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Visibility */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Visibilidad
          </Text>

          <View style={styles.permissionsContainer}>
            <View
              style={[
                styles.permissionRow,
                { borderBottomColor: colors.border },
              ]}
            >
              <Text style={[styles.permissionLabel, { color: colors.text }]}>
                Hacer proyecto público
              </Text>
              <View style={styles.permissionValue}>
                <Switch
                  value={settings.notifyOnDueDateReminder}
                  onValueChange={(value) =>
                    setSettings((prev) => ({ ...prev, notifyOnDueDateReminder: value }))
                  }
                />
              </View>
            </View>

            <View style={styles.infoBox}>
              <Feather name="info" size={14} color={colors.textMuted} />
              <Text style={[styles.infoText, { color: colors.textMuted }]}>
                {" "}
                Los usuarios invitados podrán ver este proyecto sin iniciar
                sesión.{" "}
              </Text>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View
          style={[styles.dangerZone, { backgroundColor: "#FEF2F2" + "15" }]}
        >
          <View style={[styles.dangerHeader]}>
            <Feather name="alert-triangle" size={20} color="#EF4444" />
            <Text style={[styles.dangerTitle, { color: "#EF4444" }]}>
              Zona de peligro
            </Text>
          </View>

          <Text style={[styles.dangerText, { color: "#7F1D2D" }]}>
            Estas acciones son irreversibles. Ten cuidado.
          </Text>

          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: "#DC2626" }]}
            onPress={handleDeleteProject}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Feather name="trash-2" size={18} color="#FFFFFF" />
                <Text style={styles.deleteButtonText}>Eliminar proyecto</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.deleteWarning}>
            <Text style={[styles.dangerText, { color: "#7F1D2D" }]}>
              Al eliminar el proyecto también se eliminarán todas las tareas
              asociadas.
            </Text>
            <Text style={[styles.dangerText, { color: colors.textMuted }]}>
              Esta acción no se puede deshacer.
            </Text>
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: isSaving ? colors.border : colors.primary,
                opacity: isSaving ? 0.5 : 1,
              },
            ]}
            onPress={handleSave}
            disabled={isSaving || !projectId}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Feather name="save" size={18} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>
                  {isSaving ? "Guardando..." : "Guardar"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
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
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  field: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 8,
  },
  input: {
    fontSize: 15,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
  },
  textArea: {
    minHeight: 100,
  },
  colorOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  priorityContainer: {
    gap: 12,
  },
  priorityOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 12,
  },
  priorityText: {
    fontSize: 14,
  },
  permissionsContainer: {
    gap: 0,
  },
  permissionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  permissionLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    flex: 1,
  },
  permissionValue: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  saveButtonContainer: {
    padding: 16,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  dangerZone: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  dangerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#EF4444",
  },
  dangerText: {
    fontSize: 13,
    color: "#7F1D2D",
    lineHeight: 18,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  deleteWarning: {
    marginTop: 8,
    gap: 4,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#F8F9FA" + "15",
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 16,
    color: "#374151",
  },
});
