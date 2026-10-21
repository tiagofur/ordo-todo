/**
 * Daily-ritual screen (ODD 006 S6/T5).
 *
 * Internal stack route (NOT a tab: the tab bar is full and feature
 * screens like wellbeing/workload/notes already use this pattern).
 * Sections mirror web /ritual: morning, timebox, evening, streak.
 * Labels come from the shared Ritual i18n namespace.
 */
import React, { useMemo, useState } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  EveningRitualCard,
  MorningRitualCard,
  StreakCard,
  TimeboxCard,
  type MobileEveningMove,
  type MobileTimeboxBlock,
  type MobileTimeboxTask,
} from '@ordo-todo/ui-mobile';
import { useTasks } from '@/app/lib/shared-hooks';
import {
  useAcceptTimebox,
  useCompleteEvening,
  useCompleteMorning,
  useEveningRitual,
  useMorningRitual,
  useSaveTimebox,
  useSkipEvening,
  useSkipMorning,
  useStreak,
} from '@/app/lib/ritual-hooks';
import { useThemeColors } from '@/app/data/hooks/use-theme-colors.hook';
import type { RitualEveningMove } from '@ordo-todo/api-client';

export default function RitualScreen() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { data: morning, isLoading, isError, refetch } = useMorningRitual();
  const {
    data: evening,
    isLoading: eveningLoading,
    isError: eveningError,
    refetch: refetchEvening,
  } = useEveningRitual();
  const { data: streak } = useStreak();
  const { data: tasks } = useTasks();
  const completeMorning = useCompleteMorning();
  const skipMorning = useSkipMorning();
  const completeEvening = useCompleteEvening();
  const skipEvening = useSkipEvening();
  const saveTimebox = useSaveTimebox();
  const acceptTimebox = useAcceptTimebox();
  const [shutdownSuggestion, setShutdownSuggestion] = useState<string | undefined>();

  const titles = useMemo(
    () => new Map((tasks ?? []).map((task: { id: string; title: string }) => [task.id, task.title] as const)),
    [tasks],
  );
  const titleOf = (taskId: string): string => titles.get(taskId) ?? taskId;

  const morningStatus = morning?.ritual?.morningStatus ?? 'PENDING';
  const eveningStatus = evening?.ritual?.eveningStatus ?? 'PENDING';
  const top3: MobileTimeboxTask[] = useMemo(() => {
    const ids = morning?.ritual?.morningTop3 ?? [];
    const blocks = new Map((morning?.plan.blocks ?? []).map((b) => [b.taskId, b] as const));
    return ids.map((taskId) => {
      const block = blocks.get(taskId);
      return {
        taskId,
        title: titleOf(taskId),
        start: block?.start ?? '',
        end: block?.end ?? '',
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [morning, tasks]);

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" />
        <Text style={{ color: colors.textMuted }}>{t('Ritual.loading')}</Text>
      </View>
    );
  }

  if (isError || !morning) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textMuted }}>{t('Ritual.loadError')}</Text>
        <TouchableOpacity
          style={[styles.retry, { backgroundColor: colors.primary }]}
          onPress={() => refetch()}
        >
          <Text style={styles.retryText}>{t('Ritual.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.header, { color: colors.text }]}>{t('Ritual.title')}</Text>
      <Text style={[styles.subheader, { color: colors.textMuted }]}>{t('Ritual.subtitle')}</Text>
      <MorningRitualCard
        planBlocks={morning.plan.blocks.map((block) => ({
          taskId: block.taskId,
          title: titleOf(block.taskId),
          start: block.start,
          end: block.end,
          reason: block.reason,
        }))}
        overdue={morning.overdue}
        suggestedTop3={morning.suggestedTop3}
        status={morningStatus}
        labels={{
          title: t('Ritual.morning.title'),
          planTitle: t('Ritual.morning.planTitle'),
          planEmpty: t('Ritual.morning.planEmpty'),
          overdueTitle: t('Ritual.morning.overdueTitle'),
          overdueEmpty: t('Ritual.morning.overdueEmpty'),
          top3Title: t('Ritual.morning.top3Title'),
          top3Hint: t('Ritual.morning.top3Hint'),
          complete: t('Ritual.morning.complete'),
          skip: t('Ritual.morning.skip'),
          completed: t('Ritual.morning.completed'),
          skipped: t('Ritual.morning.skipped'),
        }}
        onComplete={(top3Ids) => completeMorning.mutate(top3Ids)}
        onSkip={() => skipMorning.mutate()}
      />
      <TimeboxCard
        top3={morningStatus === 'DONE' ? top3 : []}
        labels={{
          title: t('Ritual.timebox.title'),
          empty: t('Ritual.timebox.empty'),
          startLabel: t('Ritual.timebox.start'),
          endLabel: t('Ritual.timebox.end'),
          save: t('Ritual.timebox.save'),
          acceptProposal: t('Ritual.timebox.acceptProposal'),
        }}
        onSave={(blocks: MobileTimeboxBlock[]) => saveTimebox.mutate(blocks)}
        onAcceptProposal={() => acceptTimebox.mutate()}
      />
      {eveningLoading || !evening ? (
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          {eveningLoading && !eveningError ? (
            <ActivityIndicator size="large" />
          ) : (
            <>
              <Text style={{ color: colors.textMuted }}>
                {t('Ritual.loadError')}
              </Text>
              <TouchableOpacity
                style={[styles.retry, { backgroundColor: colors.primary }]}
                onPress={() => refetchEvening()}
              >
                <Text style={styles.retryText}>{t('Ritual.retry')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      ) : (
      <EveningRitualCard
        summary={eveningSummary(evening?.summary)}
        completed={(evening?.completed ?? []).map((item) => ({
          taskId: item.taskId,
          title: titleOf(item.taskId),
        }))}
        pending={(evening?.pending ?? []).map((item) => ({
          taskId: item.taskId,
          title: titleOf(item.taskId),
        }))}
        status={eveningStatus}
        shutdownComplete={eveningStatus === 'DONE'}
        shutdownSuggestion={shutdownSuggestion}
        labels={{
          title: t('Ritual.evening.title'),
          summaryTitle: t('Ritual.evening.summaryTitle'),
          summaryEmpty: t('Ritual.evening.summaryEmpty'),
          completedTitle: t('Ritual.evening.completedTitle'),
          completedEmpty: t('Ritual.evening.completedEmpty'),
          pendingTitle: t('Ritual.evening.pendingTitle'),
          pendingEmpty: t('Ritual.evening.pendingEmpty'),
          destinationTomorrow: t('Ritual.evening.tomorrow'),
          destinationDate: t('Ritual.evening.date'),
          destinationArchived: t('Ritual.evening.archived'),
          reasonOverran: t('Ritual.evening.overran'),
          reasonUrgent: t('Ritual.evening.urgent'),
          reasonNoEnergy: t('Ritual.evening.noEnergy'),
          reasonOther: t('Ritual.evening.other'),
          complete: t('Ritual.evening.complete'),
          skip: t('Ritual.evening.skip'),
          completed: t('Ritual.evening.completed'),
          skipped: t('Ritual.evening.skipped'),
          shutdown: t('Ritual.evening.shutdown'),
          datePlaceholder: t('Ritual.evening.datePlaceholder'),
        }}
        onComplete={(moves: MobileEveningMove[]) =>
          completeEvening.mutate(moves as RitualEveningMove[], {
            onSuccess: (result) => {
              setShutdownSuggestion(result.suggestion);
              if (result.unmoved.length > 0) {
                Alert.alert(
                  t('Ritual.evening.unmoved'),
                  result.unmoved.map(titleOf).join(', '),
                );
              }
            },
          })
        }
        onSkip={() => skipEvening.mutate()}
      />
      )}
      {streak ? (
        <StreakCard
          current={streak.current}
          longest={streak.longest}
          milestones={[7, 30, 100]}
          labels={{
            title: t('Ritual.streak.title'),
            days: t('Ritual.streak.days'),
            best: t('Ritual.streak.best'),
            nextMilestone: t('Ritual.streak.next'),
            milestoneReached: t('Ritual.streak.reached'),
            empty: t('Ritual.streak.empty'),
          }}
        />
      ) : null}
    </ScrollView>
  );
}

/** The PM summary is an opaque report object; show its headline text. */
function eveningSummary(summary: Record<string, unknown> | null | undefined): string | null {
  if (!summary) return null;
  const headline = summary.headline ?? summary.summary ?? summary.text;
  return typeof headline === 'string' ? headline : null;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  content: { padding: 16, paddingBottom: 48 },
  header: { fontSize: 24, fontWeight: '800', marginBottom: 2 },
  subheader: { fontSize: 13, marginBottom: 12 },
  retry: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  retryText: { color: '#fff', fontWeight: '600' },
});
