"use client";

import { forwardRef, useImperativeHandle } from "react";
import { useCustomFieldForm, CustomFieldInputs } from "./custom-field-inputs";

export interface CustomFieldsHandle {
    saveValues: (taskId: string) => Promise<void>;
}

export const CreateTaskCustomFieldsWrapper = forwardRef<CustomFieldsHandle, { projectId: string }>(({ projectId }, ref) => {
    const customFieldsForm = useCustomFieldForm(projectId);

    useImperativeHandle(ref, () => ({
        saveValues: async (taskId: string) => {
             await customFieldsForm.saveValues(taskId);
        }
    }));

    return (
        <CustomFieldInputs 
            projectId={projectId} 
            values={customFieldsForm.values} 
            onChange={customFieldsForm.handleChange} 
        />
    );
});

CreateTaskCustomFieldsWrapper.displayName = "CreateTaskCustomFieldsWrapper";
