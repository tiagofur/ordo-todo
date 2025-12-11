import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/app/lib/api-client';
import type {
    CustomField,
    CustomFieldValue,
    CreateCustomFieldDto,
    UpdateCustomFieldDto,
    SetMultipleCustomFieldValuesDto,
} from '@ordo-todo/api-client';
import { useState } from 'react';

/**
 * Get all custom fields for a project
 */
export function useCustomFields(projectId: string) {
    return useQuery({
        queryKey: ['custom-fields', projectId],
        queryFn: () => apiClient.getProjectCustomFields(projectId),
        enabled: !!projectId,
    });
}

/**
 * Create a new custom field
 */
export function useCreateCustomField() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ projectId, data }: { projectId: string; data: CreateCustomFieldDto }) =>
            apiClient.createCustomField(projectId, data),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: ['custom-fields', projectId] });
        },
    });
}

/**
 * Update a custom field
 */
export function useUpdateCustomField() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ fieldId, data, projectId }: { fieldId: string; data: UpdateCustomFieldDto; projectId: string }) =>
            apiClient.updateCustomField(fieldId, data),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: ['custom-fields', projectId] });
        },
    });
}

/**
 * Delete a custom field
 */
export function useDeleteCustomField() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ fieldId, projectId }: { fieldId: string; projectId: string }) =>
            apiClient.deleteCustomField(fieldId),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: ['custom-fields', projectId] });
        },
    });
}

/**
 * Get custom field values for a task
 */
export function useTaskCustomValues(taskId: string) {
    return useQuery({
        queryKey: ['task-custom-values', taskId],
        queryFn: () => apiClient.getTaskCustomValues(taskId),
        enabled: !!taskId,
    });
}

/**
 * Set custom field values for a task
 */
export function useSetTaskCustomValues() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ taskId, data }: { taskId: string; data: SetMultipleCustomFieldValuesDto }) =>
            apiClient.setTaskCustomValues(taskId, data),
        onSuccess: (_, { taskId }) => {
            queryClient.invalidateQueries({ queryKey: ['task-custom-values', taskId] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
}

/**
 * Hook helper to manage custom field values in a form
 */
export function useCustomFieldForm(projectId: string, taskId?: string) {
    const [values, setValues] = useState<Record<string, string>>({});
    const { data: fields } = useCustomFields(projectId);
    const setTaskValues = useSetTaskCustomValues();

    const handleChange = (fieldId: string, value: string) => {
        setValues((prev) => ({ ...prev, [fieldId]: value }));
    };

    const getValuesForSubmit = () => {
        return Object.entries(values)
            .filter(([_, v]) => v !== '')
            .map(([fieldId, value]) => ({ fieldId, value }));
    };

    const validateRequired = (): boolean => {
        if (!fields) return true;
        for (const field of fields) {
            if (field.isRequired && !values[field.id]) {
                return false;
            }
        }
        return true;
    };

    const saveValues = async (targetTaskId: string) => {
        const submitValues = getValuesForSubmit();
        if (submitValues.length > 0) {
            await setTaskValues.mutateAsync({
                taskId: targetTaskId,
                data: { values: submitValues },
            });
        }
    };

    return {
        values,
        handleChange,
        getValuesForSubmit,
        validateRequired,
        saveValues,
        isPending: setTaskValues.isPending,
    };
}
