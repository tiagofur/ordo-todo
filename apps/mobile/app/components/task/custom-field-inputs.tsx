import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Switch,
} from 'react-native';
import { useThemeColors } from '@/app/data/hooks/use-theme-colors.hook';
import {
  useCustomFields,
  useTaskCustomValues,
  useCustomFieldForm,
} from '@/app/hooks/api/use-custom-fields';
import type { CustomField, CustomFieldValue } from '@ordo-todo/api-client';

interface CustomFieldInputsProps {
  projectId: string;
  taskId?: string;
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
}

/**
 * Renders custom field inputs for mobile task forms
 */
export function CustomFieldInputs({
  projectId,
  taskId,
  values,
  onChange,
}: CustomFieldInputsProps) {
  const colors = useThemeColors();
  const { data: fields, isLoading: fieldsLoading } = useCustomFields(projectId);
  const { data: existingValues, isLoading: valuesLoading } = useTaskCustomValues(taskId || '');

  // Initialize values from existing task data
  useEffect(() => {
    if (existingValues && taskId) {
      existingValues.forEach((v: CustomFieldValue) => {
        if (!values[v.fieldId]) {
          onChange(v.fieldId, v.value);
        }
      });
    }
  }, [existingValues, taskId]);

  if (fieldsLoading || (taskId && valuesLoading)) {
    return null;
  }

  if (!fields || fields.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
        Custom Fields
      </Text>
      {fields.map((field: CustomField) => (
        <CustomFieldInput
          key={field.id}
          field={field}
          value={values[field.id] || ''}
          onChange={(value) => onChange(field.id, value)}
          colors={colors}
        />
      ))}
    </View>
  );
}

interface CustomFieldInputProps {
  field: CustomField;
  value: string;
  onChange: (value: string) => void;
  colors: ReturnType<typeof useThemeColors>;
}

function CustomFieldInput({ field, value, onChange, colors }: CustomFieldInputProps) {
  const [multiValues, setMultiValues] = useState<string[]>(() =>
    field.type === 'MULTI_SELECT' && value ? value.split(',').map((s) => s.trim()) : []
  );

  const handleMultiToggle = (option: string) => {
    const newValues = multiValues.includes(option)
      ? multiValues.filter((v) => v !== option)
      : [...multiValues, option];
    setMultiValues(newValues);
    onChange(newValues.join(','));
  };

  const renderLabel = () => (
    <View style={styles.labelContainer}>
      <Text style={[styles.label, { color: colors.text }]}>
        {field.name}
        {field.isRequired && <Text style={{ color: colors.error }}> *</Text>}
      </Text>
    </View>
  );

  switch (field.type) {
    case 'TEXT':
    case 'URL':
    case 'EMAIL':
      return (
        <View style={styles.fieldContainer}>
          {renderLabel()}
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.surface, 
              color: colors.text,
              borderColor: colors.border,
            }]}
            value={value}
            onChangeText={onChange}
            placeholder={field.description || `Enter ${field.name.toLowerCase()}`}
            placeholderTextColor={colors.textMuted}
            keyboardType={
              field.type === 'EMAIL' ? 'email-address' :
              field.type === 'URL' ? 'url' : 'default'
            }
            autoCapitalize={field.type === 'EMAIL' ? 'none' : 'sentences'}
          />
        </View>
      );

    case 'NUMBER':
      return (
        <View style={styles.fieldContainer}>
          {renderLabel()}
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.surface, 
              color: colors.text,
              borderColor: colors.border,
            }]}
            value={value}
            onChangeText={onChange}
            placeholder={field.description || '0'}
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
          />
        </View>
      );

    case 'SELECT':
      return (
        <View style={styles.fieldContainer}>
          {renderLabel()}
          <View style={styles.optionsContainer}>
            {field.options?.map((option) => (
              <Pressable
                key={option}
                onPress={() => onChange(option)}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: value === option ? colors.primary : colors.surface,
                    borderColor: value === option ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: value === option ? '#fff' : colors.text },
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      );

    case 'MULTI_SELECT':
      return (
        <View style={styles.fieldContainer}>
          {renderLabel()}
          <View style={styles.optionsContainer}>
            {field.options?.map((option) => (
              <Pressable
                key={option}
                onPress={() => handleMultiToggle(option)}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: multiValues.includes(option) ? colors.primary : colors.surface,
                    borderColor: multiValues.includes(option) ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: multiValues.includes(option) ? '#fff' : colors.text },
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      );

    case 'DATE':
      // For mobile, we'll use a simple text input for now
      // You can integrate a date picker library later
      return (
        <View style={styles.fieldContainer}>
          {renderLabel()}
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.surface, 
              color: colors.text,
              borderColor: colors.border,
            }]}
            value={value ? new Date(value).toLocaleDateString() : ''}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textMuted}
            onChangeText={(text) => {
              // Basic date parsing
              const date = new Date(text);
              if (!isNaN(date.getTime())) {
                onChange(date.toISOString());
              }
            }}
          />
        </View>
      );

    case 'CHECKBOX':
      const isChecked = value === 'true' || value === '1';
      return (
        <View style={styles.checkboxContainer}>
          <Switch
            value={isChecked}
            onValueChange={(checked) => onChange(checked ? 'true' : 'false')}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={isChecked ? '#fff' : colors.surface}
          />
          <Text style={[styles.checkboxLabel, { color: colors.text }]}>
            {field.name}
            {field.isRequired && <Text style={{ color: colors.error }}> *</Text>}
          </Text>
        </View>
      );

    default:
      return null;
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  labelContainer: {
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export { useCustomFieldForm };
