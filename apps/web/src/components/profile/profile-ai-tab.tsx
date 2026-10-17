"use client";

import React, { useState, useEffect } from "react";
import { Brain, Save, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Switch,
  Button,
  Slider,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ordo-todo/ui";
import { ENERGY_LEVELS, type Profile } from "./profile-types";

interface ProfileAiTabProps {
  profile: Profile | null;
  onUpdatePreferences: (data: Record<string, unknown>) => Promise<void>;
  isUpdatePreferencesPending?: boolean;
  addSuccess: (message: string) => void;
  addError: (message: string) => void;
}

export function ProfileAiTab({
  profile,
  onUpdatePreferences,
  isUpdatePreferencesPending = false,
  addSuccess,
  addError,
}: ProfileAiTabProps) {
  const [aiPreferences, setAiPreferences] = useState<{
    enableAI: boolean;
    aiAggressiveness: number;
    aiSuggestTaskDurations: boolean;
    aiSuggestPriorities: boolean;
    aiSuggestScheduling: boolean;
    aiWeeklyReports: boolean;
    morningEnergy: "LOW" | "MEDIUM" | "HIGH";
    afternoonEnergy: "LOW" | "MEDIUM" | "HIGH";
    eveningEnergy: "LOW" | "MEDIUM" | "HIGH";
  }>({
    enableAI: true,
    aiAggressiveness: 5,
    aiSuggestTaskDurations: true,
    aiSuggestPriorities: true,
    aiSuggestScheduling: true,
    aiWeeklyReports: true,
    morningEnergy: "MEDIUM",
    afternoonEnergy: "MEDIUM",
    eveningEnergy: "LOW",
  });

  useEffect(() => {
    if (profile?.preferences) {
      setAiPreferences({
        enableAI: profile.preferences.enableAI,
        aiAggressiveness: profile.preferences.aiAggressiveness ?? 5,
        aiSuggestTaskDurations: profile.preferences.aiSuggestTaskDurations,
        aiSuggestPriorities: profile.preferences.aiSuggestPriorities,
        aiSuggestScheduling: profile.preferences.aiSuggestScheduling,
        aiWeeklyReports: profile.preferences.aiWeeklyReports,
        morningEnergy: profile.preferences.morningEnergy ?? "MEDIUM",
        afternoonEnergy: profile.preferences.afternoonEnergy ?? "MEDIUM",
        eveningEnergy: profile.preferences.eveningEnergy ?? "LOW",
      });
    }
  }, [profile]);

  async function handleSaveAiPreferences() {
    try {
      await onUpdatePreferences(aiPreferences);
      addSuccess?.("AI preferences updated successfully!");
    } catch (error: unknown) {
      addError?.((error as Error).message || "Failed to update AI preferences");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI & Productivity
        </CardTitle>
        <CardDescription>Configure how AI helps you be more productive</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main AI Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label className="text-base">Enable AI Features</Label>
            <p className="text-sm text-muted-foreground">
              Allow AI to analyze your tasks and provide suggestions
            </p>
          </div>
          <Switch
            checked={aiPreferences.enableAI}
            onCheckedChange={(checked) => setAiPreferences({ ...aiPreferences, enableAI: checked })}
          />
        </div>

        {aiPreferences.enableAI && (
          <>
            {/* AI Suggestions */}
            <div className="space-y-4">
              <h4 className="font-medium">AI Suggestions</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Suggest task durations</Label>
                  <Switch
                    checked={aiPreferences.aiSuggestTaskDurations}
                    onCheckedChange={(checked) =>
                      setAiPreferences({ ...aiPreferences, aiSuggestTaskDurations: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Suggest priorities</Label>
                  <Switch
                    checked={aiPreferences.aiSuggestPriorities}
                    onCheckedChange={(checked) =>
                      setAiPreferences({ ...aiPreferences, aiSuggestPriorities: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Suggest optimal scheduling</Label>
                  <Switch
                    checked={aiPreferences.aiSuggestScheduling}
                    onCheckedChange={(checked) =>
                      setAiPreferences({ ...aiPreferences, aiSuggestScheduling: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Weekly AI productivity reports</Label>
                  <Switch
                    checked={aiPreferences.aiWeeklyReports}
                    onCheckedChange={(checked) =>
                      setAiPreferences({ ...aiPreferences, aiWeeklyReports: checked })
                    }
                  />
                </div>
              </div>
            </div>

            {/* AI Aggressiveness */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>AI Aggressiveness</Label>
                  <p className="text-sm text-muted-foreground">
                    How often AI should suggest changes
                  </p>
                </div>
                <span className="text-sm font-medium">{aiPreferences.aiAggressiveness}/10</span>
              </div>
              <Slider
                value={[aiPreferences.aiAggressiveness]}
                onValueChange={([value]) =>
                  setAiPreferences({ ...aiPreferences, aiAggressiveness: value ?? 5 })
                }
                min={1}
                max={10}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Conservative</span>
                <span>Proactive</span>
              </div>
            </div>

            {/* Energy Profile */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Energy Profile
                </h4>
                <p className="text-sm text-muted-foreground">
                  AI uses this to schedule demanding tasks during your peak hours
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {(["morningEnergy", "afternoonEnergy", "eveningEnergy"] as const).map((period) => (
                  <div key={period} className="space-y-2">
                    <Label className="capitalize">{period.replace("Energy", "")} Energy</Label>
                    <Select
                      value={aiPreferences[period]}
                      onValueChange={(value: "LOW" | "MEDIUM" | "HIGH") =>
                        setAiPreferences({ ...aiPreferences, [period]: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ENERGY_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            <div className="flex items-center gap-2">
                              <level.icon className={`h-4 w-4 ${level.color}`} />
                              {level.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSaveAiPreferences} disabled={isUpdatePreferencesPending}>
            <Save className="h-4 w-4 mr-2" />
            {isUpdatePreferencesPending ? "Saving..." : "Save AI Preferences"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
