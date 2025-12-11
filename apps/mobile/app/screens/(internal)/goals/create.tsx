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
import { useCreateObjective, useUpdateObjective, useObjective } from '@/app/hooks/api/use-objectives'; // Hook path
import CustomTextInput from '../../../components/shared/text-input.component';
import CustomButton from '../../../components/shared/button.component';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const PERIODS = [
  { value: 'Q1', label: 'Q1', color: '#3B82F6' },
  { value: 'Q2', label: 'Q2', color: '#10B981' },
  { value: 'Q3', label: 'Q3', color: '#F59E0B' },
  { value: 'Q4', label: 'Q4', color: '#EF4444' },
  { value: 'YEARLY', label: 'Yearly', color: '#8B5CF6' },
];

export default function CreateObjectiveScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = typeof params.id === 'string' ? params.id : undefined;
  const isEditing = !!id;

  const colors = useThemeColors();
  const createObjective = useCreateObjective();
  const updateObjective = useUpdateObjective();
  
  // Fetch existing if editing
  const { data: existingObjective } = useObjective(id || '');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [period, setPeriod] = useState('Q1');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date(new Date().setMonth(new Date().getMonth() + 3)));
  
  const [activeDateField, setActiveDateField] = useState<'start' | 'end'>('start');
  const [showDatePicker, setShowDatePicker] = useState(false);

  React.useEffect(() => {
    if (existingObjective) {
        setTitle(existingObjective.title);
        setDescription(existingObjective.description || '');
        setPeriod(existingObjective.period);
        if (existingObjective.startDate) setStartDate(new Date(existingObjective.startDate));
        if (existingObjective.endDate) setEndDate(new Date(existingObjective.endDate));
    }
  }, [existingObjective]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    try {
      if (isEditing && id) {
        await updateObjective.mutateAsync({
            id,
            data: {
                title,
                description,
                period: period as any,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            }
        });
      } else {
        await createObjective.mutateAsync({
            title,
            description,
            period: period as any,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            color: '#3B82F6', // Default blue for now
            icon: 'target'
        });
      }
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save objective');
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      if (activeDateField === 'start') setStartDate(selectedDate);
      else setEndDate(selectedDate);
    }
  };

  const openDatePicker = (field: 'start' | 'end') => {
    setActiveDateField(field);
    setShowDatePicker(true);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{isEditing ? 'Edit Goal' : 'New Goal'}</Text>

        <View style={styles.formGroup}>
          <CustomTextInput
            label="Objective Title"
            placeholder="e.g. Increase Revenue"
            value={title}
            onChangeText={setTitle}
            leftIcon={<Feather name="target" size={20} color={colors.textMuted} />}
          />
        </View>

        <View style={styles.formGroup}>
          <CustomTextInput
            label="Description"
            placeholder="Details..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={{ height: 80, paddingTop: 12 }}
            leftIcon={<Feather name="align-left" size={20} color={colors.textMuted} />}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Period</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periodContainer}>
            {PERIODS.map((p) => (
              <Pressable
                key={p.value}
                style={[
                  styles.periodOption,
                  {
                    borderColor: period === p.value ? p.color : colors.border,
                    backgroundColor: period === p.value ? `${p.color}20` : colors.card,
                  },
                ]}
                onPress={() => setPeriod(p.value)}
              >
                <Text
                  style={[
                    styles.periodText,
                    {
                      color: period === p.value ? p.color : colors.textSecondary,
                      fontWeight: period === p.value ? '700' : '500',
                    },
                  ]}
                >
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.dateRow}>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: colors.text }]}>Start Date</Text>
            <Pressable
              style={[styles.dateButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => openDatePicker('start')}
            >
              <Text style={{ color: colors.text }}>{startDate.toLocaleDateString()}</Text>
            </Pressable>
          </View>
          <View style={{ width: 16 }} />
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: colors.text }]}>End Date</Text>
            <Pressable
              style={[styles.dateButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => openDatePicker('end')}
            >
              <Text style={{ color: colors.text }}>{endDate.toLocaleDateString()}</Text>
            </Pressable>
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={activeDateField === 'start' ? startDate : endDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        <View style={styles.footer}>
          <CustomButton
            title={isEditing ? 'Save Changes' : 'Create Goal'}
            onPress={handleSubmit}
            isLoading={createObjective.isPending || updateObjective.isPending}
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
  headerTitle: { fontSize: 28, fontWeight: '800', marginBottom: 32 },
  formGroup: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
  periodContainer: { flexDirection: 'row', gap: 12 },
  periodOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 80,
    alignItems: 'center',
    marginRight: 8
  },
  periodText: { fontSize: 14 },
  dateRow: { flexDirection: 'row' },
  dateButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center'
  },
  footer: { marginTop: 24 },
});
