import { useState } from 'react';
import {
    useCustomFields,
    useSetTaskCustomValues
} from '@/lib/shared-hooks';

/**
 * Hook helper to manage custom field values in a form
 * Desktop-specific implementation for managing form state
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

// Re-export specific local overrides if needed, essentially aliasing shared hooks to match expected local names in legacy code
export { useTaskCustomValues as useLocalTaskCustomValues, useSetTaskCustomValues as useLocalSetTaskCustomValues } from '@/lib/shared-hooks';
