import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeColors } from '@/app/data/hooks/use-theme-colors.hook';
import { useAddKeyResult, useUpdateKeyResult, useObjective } from '@/app/hooks/api/use-objectives';
import CustomTextInput from '../../../components/shared/text-input.component';
import CustomButton from '../../../components/shared/button.component';
import { Feather } from '@expo/vector-icons';

const KR_TYPES = [
  { value: 'NUMBER', label: 'Number', icon: 'hash' },
  { value: 'PERCENTAGE', label: 'Percentage', icon: 'percent' },
  { value: 'CURRENCY', label: 'Currency', icon: 'dollar-sign' },
  { value: 'BOOLEAN', label: 'True/False', icon: 'check-square' },
];

export default function CreateKeyResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const objectiveId = typeof params.objectiveId === 'string' ? params.objectiveId : '';
  const id = typeof params.id === 'string' ? params.id : undefined;
  const isEditing = !!id;
  
  const colors = useThemeColors();
  const addKeyResult = useAddKeyResult();
  const updateKeyResult = useUpdateKeyResult();
  
  // Fetch objective to get KR data if editing
  const { data: objective } = useObjective(objectiveId);

  const [title, setTitle] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [unit, setUnit] = useState('');
  const [type, setType] = useState('NUMBER');
  const [currentValue, setCurrentValue] = useState('0');

  React.useEffect(() => {
    if (isEditing && objective && objective.keyResults) {
        const kr = objective.keyResults.find(k => k.id === id);
        if (kr) {
            setTitle(kr.title);
            setTargetValue(kr.targetValue.toString());
            setUnit(kr.unit || '');
            setType(kr.metricType);
            setCurrentValue(kr.currentValue?.toString() || '0');
        }
    }
  }, [isEditing, objective, id]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    if (!targetValue.trim()) {
      Alert.alert('Error', 'Target value is required');
      return;
    }
    if (isNaN(Number(targetValue))) {
        Alert.alert('Error', 'Target value must be a number');
        return;
    }

    try {
      if (isEditing && id) {
          await updateKeyResult.mutateAsync({
              objectiveId,
              keyResultId: id,
              data: {
                  title,
                  targetValue: Number(targetValue),
                  unit: unit || undefined,
                  metricType: type as any,
                  currentValue: Number(currentValue) // Allow updating current value if needed
              }
          });
      } else {
          await addKeyResult.mutateAsync({
            objectiveId,
            data: {
                title,
                targetValue: Number(targetValue),
                startValue: 0,
                unit: unit || undefined,
                metricType: type as any,
            }
          });
      }
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save key result');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{isEditing ? 'Edit Key Result' : 'New Key Result'}</Text>

        <View style={styles.formGroup}>
          <CustomTextInput
            label="Key Result Title"
            placeholder="e.g. Achieve 1k users"
            value={title}
            onChangeText={setTitle}
            leftIcon={<Feather name="target" size={20} color={colors.textMuted} />}
          />
        </View>

        <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1 }]}>
            <CustomTextInput
                label="Target Value"
                placeholder="100"
                value={targetValue}
                onChangeText={setTargetValue}
                keyboardType="numeric"
                leftIcon={<Feather name="hash" size={20} color={colors.textMuted} />}
            />
            </View>
            <View style={{ width: 16 }} />
            <View style={[styles.formGroup, { flex: 1 }]}>
            <CustomTextInput
                label="Unit (Optional)"
                placeholder="users, $"
                value={unit}
                onChangeText={setUnit}
                leftIcon={<Feather name="tag" size={20} color={colors.textMuted} />}
            />
            </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Metric Type</Text>
          <View style={styles.typesContainer}>
            {KR_TYPES.map((t) => (
              <Pressable
                key={t.value}
                style={[
                  styles.typeOption,
                  {
                    borderColor: type === t.value ? colors.primary : colors.border,
                    backgroundColor: type === t.value ? `${colors.primary}20` : colors.card,
                  },
                ]}
                onPress={() => setType(t.value)}
              >
                 <Feather name={t.icon as any} size={20} color={type === t.value ? colors.primary : colors.textSecondary} />
                <Text
                  style={[
                    styles.typeText,
                    {
                      color: type === t.value ? colors.primary : colors.textSecondary,
                      fontWeight: type === t.value ? '700' : '500',
                    },
                  ]}
                >
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <CustomButton
            title={isEditing ? 'Save Changes' : 'Add Key Result'}
            onPress={handleSubmit}
            isLoading={addKeyResult.isPending || updateKeyResult.isPending}
            icon={<Feather name={isEditing ? 'save' : 'plus'} size={20} color="#fff" />}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 40 },
  headerTitle: { fontSize: 24, fontWeight: '800', marginBottom: 32 },
  formGroup: { marginBottom: 24 },
  row: { flexDirection: 'row' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
  typesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  typeOption: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
    justifyContent: 'center'
  },
  typeText: { fontSize: 14 },
  footer: { marginTop: 24 },
});
