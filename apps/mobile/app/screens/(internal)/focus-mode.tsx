import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTimerStore } from "@ordo-todo/stores";
import { useTask, useCompleteTask } from "../../lib/shared-hooks";
import { useDesignTokens } from "../../lib/use-design-tokens";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function FocusModeScreen() {
  const { t } = useTranslation();
  const { colors, spacing } = useDesignTokens();

  const [showAudioPanel, setShowAudioPanel] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const {
    timeLeft,
    isRunning,
    isPaused,
    mode,
    start,
    pause,
    stop,
    skip,
    selectedTaskId,
    selectedTaskTitle,
    getTimeFormatted,
    getProgress,
  } = useTimerStore();

  const { data: task } = useTask(selectedTaskId || "");
  const completeTask = useCompleteTask();

  const percentage = getProgress();

  const handleCompleteTask = async () => {
    if (!selectedTaskId) return;

    try {
      await completeTask.mutateAsync(selectedTaskId);
      stop();
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case "WORK":
        return "#EF4444"; // Red
      case "SHORT_BREAK":
        return "#22C55E"; // Green
      case "LONG_BREAK":
        return "#3B82F6"; // Blue
      default:
        return "#22C55E";
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case "WORK":
        return "TRABAJO PROFUNDO";
      case "SHORT_BREAK":
        return "DESCANSO CORTO";
      case "LONG_BREAK":
        return "DESCANSO LARGO";
      default:
        return "LISTO PARA EMPEZAR";
    }
  };

  const modeColor = getModeColor();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: modeColor }]}>
      <StatusBar barStyle="light-content" backgroundColor={modeColor} />

      {/* Top Controls */}
      <View style={[styles.topControls, { paddingHorizontal: spacing[2] }]}>
        <TouchableOpacity
          onPress={() => setShowAudioPanel(!showAudioPanel)}
          style={[
            styles.controlButton,
            {
              backgroundColor: showAudioPanel
                ? "rgba(255,255,255,0.2)"
                : "transparent",
            },
          ]}
        >
          <Ionicons name="musical-notes" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsFullscreen(!isFullscreen)}
          style={styles.controlButton}
        >
          {isFullscreen ? (
            <Ionicons name="contract" size={24} color="#FFFFFF" />
          ) : (
            <Ionicons name="expand" size={24} color="#FFFFFF" />
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {}} style={styles.controlButton}>
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Audio Panel */}
      {showAudioPanel && (
        <View style={[styles.audioPanel, { backgroundColor: colors.card }]}>
          <Text style={[styles.audioPanelTitle, { color: colors.foreground }]}>
            Ambiente Sonoro
          </Text>
          <View style={styles.audioPanelContent}>
            <TouchableOpacity
              style={[
                styles.audioOption,
                {
                  backgroundColor: "rgba(6, 182, 212, 0.2)",
                  borderColor: "#06B6D4",
                },
              ]}
            >
              <Text
                style={[styles.audioOptionText, { color: colors.foreground }]}
              >
                🌧️ Lluvia
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.audioOption,
                { backgroundColor: colors.border, borderColor: colors.border },
              ]}
            >
              <Text
                style={[
                  styles.audioOptionText,
                  { color: colors.mutedForeground },
                ]}
              >
                🌊 Océano
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.audioOption,
                { backgroundColor: colors.border, borderColor: colors.border },
              ]}
            >
              <Text
                style={[
                  styles.audioOptionText,
                  { color: colors.mutedForeground },
                ]}
              >
                🌲 Bosque
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Main Content */}
      <View style={[styles.content, isFullscreen && styles.fullscreenContent]}>
        {/* Mode Label */}
        <View style={{ alignItems: "center", marginBottom: spacing[3] }}>
          <Text style={[styles.modeLabel, { color: "#FFFFFF" }]}>
            {getModeLabel()}
          </Text>
        </View>

        {/* Task Title */}
        <View style={{ alignItems: "center", marginBottom: spacing[4] }}>
          {selectedTaskId ? (
            <Text
              style={[styles.taskTitle, { color: "#FFFFFF" }]}
              numberOfLines={2}
            >
              {task?.title || selectedTaskTitle}
            </Text>
          ) : (
            <Text
              style={[styles.noTaskText, { color: "rgba(255,255,255,0.5)" }]}
            >
              Selecciona una tarea
            </Text>
          )}
        </View>

        {/* Timer Display */}
        <View style={styles.timerContainer}>
          <Text
            style={[
              styles.timerDisplay,
              {
                color: isPaused ? "rgba(255,255,255,0.5)" : "#FFFFFF",
              },
            ]}
          >
            {getTimeFormatted()}
          </Text>

          {/* Progress Bar */}
          <View
            style={[
              styles.progressBar,
              { backgroundColor: "rgba(255,255,255,0.2)" },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${percentage}%`,
                  backgroundColor: "#FFFFFF",
                },
              ]}
            />
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {!isRunning && !isPaused ? (
            <TouchableOpacity
              onPress={start}
              style={[
                styles.playButton,
                { backgroundColor: "#FFFFFF", shadowColor: "#FFFFFF" },
              ]}
            >
              <Ionicons name="play" size={40} color={modeColor} />
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                onPress={pause}
                style={[
                  styles.controlIconButton,
                  {
                    backgroundColor: "rgba(255,255,255,0.2)",
                    borderColor: "rgba(255,255,255,0.3)",
                  },
                ]}
              >
                <Ionicons name="pause" size={40} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => stop()}
                style={[
                  styles.controlIconButton,
                  {
                    backgroundColor: "rgba(255,255,255,0.2)",
                    borderColor: "rgba(255,255,255,0.3)",
                  },
                ]}
              >
                <Ionicons name="square" size={32} color="#FFFFFF" />
              </TouchableOpacity>

              {mode === "WORK" && (
                <TouchableOpacity
                  onPress={skip}
                  style={[
                    styles.controlIconButton,
                    {
                      backgroundColor: "rgba(255,255,255,0.2)",
                      borderColor: "rgba(255,255,255,0.3)",
                    },
                  ]}
                >
                  <Ionicons
                    name="play-skip-forward"
                    size={32}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              )}

              {selectedTaskId && mode === "WORK" && (
                <TouchableOpacity
                  onPress={handleCompleteTask}
                  style={[
                    styles.controlIconButton,
                    {
                      backgroundColor: "rgba(16, 185, 129, 0.2)",
                      borderColor: "#10B981",
                    },
                  ]}
                >
                  <Ionicons name="checkmark-circle" size={40} color="#10B981" />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topControls: {
    position: "absolute",
    top: 50,
    right: 0,
    flexDirection: "row",
    gap: 12,
    zIndex: 20,
    paddingRight: 24,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  audioPanel: {
    position: "absolute",
    top: 100,
    right: 24,
    width: 200,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 30,
  },
  audioPanelTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  audioPanelContent: {
    gap: 8,
  },
  audioOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
  },
  audioOptionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  fullscreenContent: {
    paddingTop: 60,
  },
  modeLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 24,
    letterSpacing: 2,
  },
  taskTitle: {
    fontSize: 36,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 44,
  },
  noTaskText: {
    fontSize: 32,
    fontWeight: "600",
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  timerDisplay: {
    fontSize: 100,
    fontWeight: "700",
    letterSpacing: -4,
    lineHeight: 100,
  },
  progressBar: {
    width: SCREEN_WIDTH * 0.8,
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 16,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  playButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  controlIconButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
});
