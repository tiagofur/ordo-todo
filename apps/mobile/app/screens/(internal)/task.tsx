import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useThemeColors } from "@/app/data/hooks/use-theme-colors.hook";
import { useCreateTask, useUpdateTask, useTask, useWorkspaces, useProjects } from "@/app/hooks/api";
import CustomTextInput from "../../components/shared/text-input.component";
import CustomButton from "../../components/shared/button.component";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

const PRIORITIES = [
  { value: "LOW", label: "Baja", color: "#48BB78" },
  { value: "MEDIUM", label: "Media", color: "#ECC94B" },
  { value: "HIGH", label: "Alta", color: "#F56565" },
];

export default function TaskScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const taskId = typeof params.id === 'string' ? params.id : undefined;
  const isEditing = !!taskId;
  
  const colors = useThemeColors();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const { data: existingTask } = useTask(taskId || "");
  
  // Workspace and Project fetching logic
  const { data: workspaces } = useWorkspaces();
  const defaultWorkspaceId = workspaces?.[0]?.id;
  const { data: projects } = useProjects(defaultWorkspaceId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState<string>("");
  const [scheduledEndTime, setScheduledEndTime] = useState<string>("");
  const [isTimeBlocked, setIsTimeBlocked] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activeTimeField, setActiveTimeField] = useState<'start' | 'end'>('start');
  const [activeDateField, setActiveDateField] = useState<'due' | 'start' | 'scheduled'>('due');

  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title);
      setDescription(existingTask.description || "");
      setPriority(existingTask.priority);
      if (existingTask.dueDate) {
        setDueDate(new Date(existingTask.dueDate));
      }
      if (existingTask.startDate) {
        setStartDate(new Date(existingTask.startDate));
      }
      if (existingTask.scheduledDate) {
        setScheduledDate(new Date(existingTask.scheduledDate));
      }
      setScheduledTime((existingTask as any).scheduledTime || "");
      setScheduledEndTime((existingTask as any).scheduledEndTime || "");
      setIsTimeBlocked(existingTask.isTimeBlocked || false);
    }
  }, [existingTask]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "El título es obligatorio");
      return;
    }

    // Determine projectId: Use existing task's project, or first available project, or error
    let targetProjectId = existingTask?.projectId;
    if (!targetProjectId && projects && projects.length > 0) {
      targetProjectId = projects[0].id;
    }

    if (!targetProjectId && !isEditing) {
       // If clean workspace, we might fail here.
       // However, to unblock, let's try to proceed if backend handles implicit default, 
       // OR alert user.
       if (!projects || projects.length === 0) {
          Alert.alert("Error", "No se encontraron proyectos. Crea un proyecto primero.");
          return;
       }
    }

    try {
      if (isEditing && taskId) {
        await updateTask.mutateAsync({
          id: taskId,
          data: {
            title,
            description,
            priority: priority as any,
            dueDate: dueDate ? dueDate.toISOString() : undefined,
            startDate: startDate ? startDate.toISOString() : undefined,
            scheduledDate: scheduledDate ? scheduledDate.toISOString() : undefined,
            scheduledTime: scheduledTime || null,
            scheduledEndTime: scheduledEndTime || null,
            isTimeBlocked,
          },
        });
      } else {
        if (!targetProjectId) {
             Alert.alert("Error", "No se pudo determinar el proyecto para la tarea.");
             return;
        }

        await createTask.mutateAsync({
          title,
          description,
          priority: priority as any,
          dueDate: dueDate ? dueDate.toISOString() : undefined,
          startDate: startDate ? startDate.toISOString() : undefined,
          scheduledDate: scheduledDate ? scheduledDate.toISOString() : undefined,
          projectId: targetProjectId,
        });
      }
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo guardar la tarea");
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      switch (activeDateField) {
        case 'due':
          setDueDate(selectedDate);
          break;
        case 'start':
          setStartDate(selectedDate);
          break;
        case 'scheduled':
          setScheduledDate(selectedDate);
          break;
      }
    }
  };

  const openDatePicker = (field: 'due' | 'start' | 'scheduled') => {
    setActiveDateField(field);
    setShowDatePicker(true);
  };

  const openTimePicker = (field: 'start' | 'end') => {
    setActiveTimeField(field);
    setShowTimePicker(true);
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const timeString = selectedTime.toLocaleTimeString('es', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      if (activeTimeField === 'start') {
        setScheduledTime(timeString);
      } else {
        setScheduledEndTime(timeString);
      }
    }
  };

  const parseTimeToDate = (timeStr: string): Date => {
    const date = new Date();
    if (timeStr) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
    }
    return date;
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isEditing ? "Editar Tarea" : "Nueva Tarea"}
        </Text>

        <View style={styles.formGroup}>
          <CustomTextInput
            label="Título"
            placeholder="¿Qué necesitas hacer?"
            value={title}
            onChangeText={setTitle}
            leftIcon={<Feather name="check-square" size={20} color={colors.textMuted} />}
          />
        </View>

        <View style={styles.formGroup}>
          <CustomTextInput
            label="Descripción"
            placeholder="Detalles adicionales..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{ height: 100, paddingTop: 12 }} 
            leftIcon={<Feather name="align-left" size={20} color={colors.textMuted} />}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Prioridad</Text>
          <View style={styles.priorityContainer}>
            {PRIORITIES.map((p) => (
              <Pressable
                key={p.value}
                style={[
                  styles.priorityOption,
                  {
                    borderColor: priority === p.value ? p.color : colors.border,
                    backgroundColor: priority === p.value ? `${p.color}20` : colors.card,
                  },
                ]}
                onPress={() => setPriority(p.value)}
              >
                <View style={[styles.priorityDot, { backgroundColor: p.color }]} />
                <Text
                  style={[
                    styles.priorityText,
                    {
                      color: priority === p.value ? p.color : colors.textSecondary,
                      fontWeight: priority === p.value ? "700" : "500",
                    },
                  ]}
                >
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Fecha de Vencimiento</Text>
          <Pressable
            style={[styles.dateButton, { backgroundColor: colors.card, borderColor: '#F97316' }]}
            onPress={() => openDatePicker('due')}
          >
            <Feather name="calendar" size={20} color="#F97316" />
            <Text style={[styles.dateText, { color: dueDate ? colors.text : colors.textMuted }]}>
              {dueDate ? dueDate.toLocaleDateString() : "Sin fecha límite"}
            </Text>
            {dueDate && (
              <Pressable
                style={styles.clearDateButton}
                onPress={(e) => {
                  e.stopPropagation();
                  setDueDate(undefined);
                }}
              >
                <Feather name="x" size={16} color={colors.textMuted} />
              </Pressable>
            )}
          </Pressable>
        </View>

        {/* Start Date Field */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Fecha de Inicio</Text>
          <Pressable
            style={[styles.dateButton, { backgroundColor: colors.card, borderColor: '#22C55E' }]}
            onPress={() => openDatePicker('start')}
          >
            <Feather name="check-square" size={20} color="#22C55E" />
            <Text style={[styles.dateText, { color: startDate ? colors.text : colors.textMuted }]}>
              {startDate ? startDate.toLocaleDateString() : "Disponible desde hoy"}
            </Text>
            {startDate && (
              <Pressable
                style={styles.clearDateButton}
                onPress={(e) => {
                  e.stopPropagation();
                  setStartDate(undefined);
                }}
              >
                <Feather name="x" size={16} color={colors.textMuted} />
              </Pressable>
            )}
          </Pressable>
        </View>

        {/* Scheduled Date Field */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Programado para</Text>
          <Pressable
            style={[styles.dateButton, { backgroundColor: colors.card, borderColor: '#3B82F6' }]}
            onPress={() => openDatePicker('scheduled')}
          >
            <Feather name="clock" size={20} color="#3B82F6" />
            <Text style={[styles.dateText, { color: scheduledDate ? colors.text : colors.textMuted }]}>
              {scheduledDate ? scheduledDate.toLocaleDateString() : "Sin fecha programada"}
            </Text>
            {scheduledDate && (
              <Pressable
                style={styles.clearDateButton}
                onPress={(e) => {
                  e.stopPropagation();
                  setScheduledDate(undefined);
                }}
              >
                <Feather name="x" size={16} color={colors.textMuted} />
              </Pressable>
            )}
          </Pressable>
        </View>

        {/* Time Blocking Section - Only shown when scheduledDate is set */}
        {scheduledDate && (
          <View style={[styles.formGroup, styles.timeBlockSection]}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              ⏰ Time Blocking
            </Text>
            
            {/* Time Pickers Row */}
            <View style={styles.timePickersRow}>
              {/* Start Time */}
              <View style={styles.timePickerContainer}>
                <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Hora inicio</Text>
                <Pressable
                  style={[styles.timeButton, { backgroundColor: colors.card, borderColor: colors.primary }]}
                  onPress={() => openTimePicker('start')}
                >
                  <Feather name="clock" size={16} color={colors.primary} />
                  <Text style={[styles.timeText, { color: scheduledTime ? colors.text : colors.textMuted }]}>
                    {scheduledTime || "00:00"}
                  </Text>
                </Pressable>
              </View>

              {/* End Time */}
              <View style={styles.timePickerContainer}>
                <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Hora fin</Text>
                <Pressable
                  style={[styles.timeButton, { backgroundColor: colors.card, borderColor: '#8B5CF6' }]}
                  onPress={() => openTimePicker('end')}
                >
                  <Feather name="clock" size={16} color="#8B5CF6" />
                  <Text style={[styles.timeText, { color: scheduledEndTime ? colors.text : colors.textMuted }]}>
                    {scheduledEndTime || "00:00"}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Time Block Toggle */}
            <View style={[styles.toggleContainer, { backgroundColor: colors.card, borderColor: isTimeBlocked ? colors.primary : colors.border }]}>
              <View style={styles.toggleInfo}>
                <Feather name="calendar" size={20} color={isTimeBlocked ? colors.primary : colors.textMuted} />
                <View style={styles.toggleTextContainer}>
                  <Text style={[styles.toggleTitle, { color: colors.text }]}>Bloque de tiempo</Text>
                  <Text style={[styles.toggleDescription, { color: colors.textMuted }]}>
                    Mostrar en el calendario semanal
                  </Text>
                </View>
              </View>
              <Pressable
                style={[
                  styles.toggleSwitch,
                  { backgroundColor: isTimeBlocked ? colors.primary : colors.border }
                ]}
                onPress={() => setIsTimeBlocked(!isTimeBlocked)}
              >
                <View style={[
                  styles.toggleThumb,
                  { 
                    backgroundColor: '#FFFFFF',
                    transform: [{ translateX: isTimeBlocked ? 20 : 0 }]
                  }
                ]} />
              </Pressable>
            </View>
          </View>
        )}
          
        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={(activeDateField === 'due' ? dueDate : activeDateField === 'start' ? startDate : scheduledDate) || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            testID="timePicker"
            value={parseTimeToDate(activeTimeField === 'start' ? scheduledTime : scheduledEndTime)}
            mode="time"
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onTimeChange}
          />
        )}

        <View style={styles.footer}>
          <CustomButton
            title={isEditing ? "Guardar Cambios" : "Crear Tarea"}
            onPress={handleSubmit}
            isLoading={createTask.isPending || updateTask.isPending}
            style={styles.submitButton}
            icon={<Feather name="save" size={20} color={colors.buttonPrimaryText} />}
          />
          <Pressable style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancelar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 32,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  priorityContainer: {
    flexDirection: "row",
    gap: 12,
  },
  priorityOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 2,
    gap: 6,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 14,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
  },
  clearDateButton: {
    padding: 4,
  },
  footer: {
    marginTop: 24,
  },
  submitButton: {
    marginBottom: 16,
  },
  cancelButton: {
    alignItems: "center",
    padding: 12,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
  },
  // Time Blocking styles
  timeBlockSection: {
    backgroundColor: 'transparent',
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },
  timePickersRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  timePickerContainer: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 8,
    marginLeft: 4,
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: "600",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  toggleInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  toggleDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  toggleSwitch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 3,
    justifyContent: "center",
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});
