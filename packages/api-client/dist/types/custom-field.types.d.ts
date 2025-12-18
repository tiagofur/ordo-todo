/**
 * Custom Fields types and DTOs
 */
export type CustomFieldType = 'TEXT' | 'NUMBER' | 'SELECT' | 'MULTI_SELECT' | 'DATE' | 'URL' | 'EMAIL' | 'CHECKBOX' | 'BOOLEAN';
export interface CustomField {
    id: string;
    name: string;
    type: CustomFieldType;
    description: string | null;
    options: string[] | null;
    isRequired: boolean;
    position: number;
    projectId: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface CustomFieldValue {
    id: string;
    value: string;
    fieldId: string;
    taskId: string;
    field?: CustomField;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateCustomFieldDto {
    name: string;
    type: CustomFieldType;
    description?: string;
    options?: string[];
    isRequired?: boolean;
    position?: number;
}
export interface UpdateCustomFieldDto {
    name?: string;
    description?: string;
    options?: string[];
    isRequired?: boolean;
    position?: number;
}
export interface SetCustomFieldValueDto {
    fieldId: string;
    value: string;
}
export interface SetMultipleCustomFieldValuesDto {
    values: SetCustomFieldValueDto[];
}
//# sourceMappingURL=custom-field.types.d.ts.map