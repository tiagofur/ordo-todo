import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/app/data/hooks/use-theme-colors.hook';
import { useCreateProject, useWorkspaces, useWorkflows } from '@/app/lib/shared-hooks';
import { useWorkspaceStore } from '@/app/lib/stores';
import { Feather } from '@expo/vector-icons';
import CustomButton from '@/app/components/shared/button.component';

const PROJECT_COLORS = [
    "#F87171", // Red
    "#FB923C", // Orange
    "#FACC15", // Yellow
    "#4ADE80", // Green
    "#60A5FA", // Blue
    "#818CF8", // Indigo
    "#A78BFA", // Purple
    "#F472B6", // Pink
    "#94A3B8", // Gray
];

export default function CreateProjectScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  
  // Workspace Context
  const { data: workspaces } = useWorkspaces();
  const { selectedWorkspaceId } = useWorkspaceStore();
  const effectiveWorkspaceId = selectedWorkspaceId || workspaces?.[0]?.id;

  const { data: workflows } = useWorkflows(effectiveWorkspaceId || "");
  const createProject = useCreateProject();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[4]); // Default Blue

  const handleSubmit = async () => {
      if (!name.trim()) {
          Alert.alert("Error", "El nombre del proyecto es obligatorio.");
          return;
      }
      if (!effectiveWorkspaceId) {
          Alert.alert("Error", "No se encontró un workspace activo.");
          return;
      }
      if (!workflows || workflows.length === 0) {
          Alert.alert("Error", "No se encontraron flujos de trabajo en este workspace.");
          return;
      }

      try {
          await createProject.mutateAsync({
              name,
              description,
              color: selectedColor,
              workspaceId: effectiveWorkspaceId,
              workflowId: workflows[0].id // Default to first workflow
          });
          router.back();
      } catch (error) {
          console.error(error);
          Alert.alert("Error", "No se pudo crear el proyecto.");
      }
  };

  return (
    <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Color Preview Header */}
        <View style={[styles.previewContainer, { backgroundColor: `${selectedColor}15` }]}>
            <View style={[styles.iconCircle, { backgroundColor: selectedColor }]}>
                <Feather name="folder" size={32} color="#FFF" />
            </View>
            <Text style={[styles.previewTitle, { color: colors.text }]}>
                {name || "Nuevo Proyecto"}
            </Text>
        </View>

        <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Nombre</Text>
            <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
                placeholder="Ej. Rediseño Web"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
                autoFocus
            />
        </View>

        <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Descripción (Opcional)</Text>
            <TextInput
                style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
                placeholder="¿De qué trata este proyecto?"
                placeholderTextColor={colors.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
            />
        </View>

        <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Color</Text>
            <View style={styles.colorsGrid}>
                {PROJECT_COLORS.map(color => (
                    <Pressable
                        key={color}
                        onPress={() => setSelectedColor(color)}
                        style={[
                            styles.colorOption,
                            { backgroundColor: color },
                            selectedColor === color && { borderWidth: 3, borderColor: colors.text }
                        ]}
                    >
                        {selectedColor === color && <Feather name="check" size={16} color="#FFF" />}
                    </Pressable>
                ))}
            </View>
        </View>

        <View style={styles.footer}>
            <CustomButton 
                title="Crear Proyecto"
                onPress={handleSubmit}
                isLoading={createProject.isPending}
            />
            <Pressable style={styles.cancelButton} onPress={() => router.back()}>
                <Text style={{color: colors.textSecondary}}>Cancelar</Text>
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
      padding: 24
  },
  previewContainer: {
      alignItems: 'center',
      padding: 24,
      borderRadius: 16,
      marginBottom: 32,
      gap: 12
  },
  iconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8
  },
  previewTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center'
  },
  formGroup: {
      marginBottom: 24
  },
  label: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
      marginLeft: 4
  },
  input: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      fontSize: 16
  },
  textArea: {
      minHeight: 100
  },
  colorsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12
  },
  colorOption: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center'
  },
  footer: {
      marginTop: 24,
      gap: 16
  },
  cancelButton: {
      alignItems: 'center',
      padding: 12
  }
});
