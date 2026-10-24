import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useThemeColors } from "@/app/data/hooks/use-theme-colors.hook";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTranslation } from "react-i18next";

export type RecurrencePattern =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "YEARLY"
  | "CUSTOM";

export interface RecurrenceValue {
  pattern: RecurrencePattern;
  interval?: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  endDate?: Date;
}

interface RecurrenceSelectorProps {
  value?: RecurrenceValue;
  onChange: (value?: RecurrenceValue) => void;
}

const DAYS_OF_WEEK = ["D", "L", "M", "X", "J", "V", "S"];

const PATTERNS = [
  { value: "DAILY" as RecurrencePattern, label: "Diariamente" },
  { value: "WEEKLY" as RecurrencePattern, label: "Semanalmente" },
  { value: "MONTHLY" as RecurrencePattern, label: "Mensualmente" },
  { value: "YEARLY" as RecurrencePattern, label: "Anualmente" },
];

export function RecurrenceSelector({
  value,
  onChange,
}: RecurrenceSelectorProps) {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState(!!value);
  const [pattern, setPattern] = useState<RecurrencePattern>(
    value?.pattern || "DAILY",
  );
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(
    value?.daysOfWeek || [],
  );
  const [endDate, setEndDate] = useState<Date | undefined>(value?.endDate);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (enabled) {
      onChange({
        pattern,
        daysOfWeek: pattern === "WEEKLY" ? daysOfWeek : undefined,
        endDate,
      });
    } else {
      onChange(undefined);
    }
  }, [enabled, pattern, daysOfWeek, endDate]);

  const toggleDay = (day: number) => {
    if (daysOfWeek.includes(day)) {
      setDaysOfWeek(daysOfWeek.filter((d) => d !== day));
    } else {
      setDaysOfWeek([...daysOfWeek, day]);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const formatEndDate = () => {
    if (!endDate) return "Sin fecha de fin";
    return endDate.toLocaleDateString("es", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      {/* Enable Recurrence Toggle */}
      <View style={[styles.toggleRow, { borderBottomColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.text }]}>
          Repetir tarea
        </Text>
        <Switch
          value={enabled}
          onValueChange={setEnabled}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={enabled ? "#FFFFFF" : colors.surface}
        />
      </View>

      {enabled && (
        <View style={styles.content}>
          {/* Pattern Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>
              Frecuencia
            </Text>
            <View style={styles.patternsContainer}>
              {PATTERNS.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  style={[
                    styles.patternOption,
                    {
                      backgroundColor:
                        pattern === p.value
                          ? colors.primary + "15"
                          : colors.surface,
                      borderColor:
                        pattern === p.value ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setPattern(p.value)}
                >
                  <Text
                    style={[
                      styles.patternText,
                      {
                        color:
                          pattern === p.value
                            ? colors.primary
                            : colors.textSecondary,
                        fontWeight: pattern === p.value ? "700" : "500",
                      },
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Days of Week Selection (for WEEKLY) */}
          {pattern === "WEEKLY" && (
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>
                Días de la semana
              </Text>
              <View style={styles.daysContainer}>
                {DAYS_OF_WEEK.map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayButton,
                      {
                        backgroundColor: daysOfWeek.includes(index)
                          ? colors.primary
                          : colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => toggleDay(index)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        {
                          color: daysOfWeek.includes(index)
                            ? "#FFFFFF"
                            : colors.text,
                        },
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* End Date Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>
              Terminar (Opcional)
            </Text>
            <TouchableOpacity
              style={[
                styles.dateButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Feather name="calendar" size={20} color={colors.primary} />
              <Text
                style={[
                  styles.dateButtonText,
                  { color: endDate ? colors.text : colors.textMuted },
                ]}
              >
                {formatEndDate()}
              </Text>
              {endDate && (
                <TouchableOpacity
                  style={styles.clearDateButton}
                  onPress={(e: any) => {
                    e.stopPropagation();
                    setEndDate(undefined);
                  }}
                >
                  <Feather name="x" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={endDate || new Date()}
                mode="date"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  content: {
    marginTop: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  patternsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  patternOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  patternText: {
    fontSize: 13,
  },
  daysContainer: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontSize: 15,
    fontWeight: "600",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
  },
  clearDateButton: {
    padding: 4,
  },
});
