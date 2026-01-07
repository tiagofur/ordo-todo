import { CustomField, CustomFieldValue } from "../model";

export interface ICustomFieldRepository {
    // Field management
    findByProject(projectId: string): Promise<CustomField[]>;
    findById(id: string): Promise<CustomField | null>;
    create(field: CustomField): Promise<CustomField>;
    update(field: CustomField): Promise<CustomField>;
    delete(id: string): Promise<void>;
    getMaxPosition(projectId: string): Promise<number>;

    // Value management
    findValuesByTask(taskId: string): Promise<CustomFieldValue[]>;
    upsertValue(value: CustomFieldValue): Promise<CustomFieldValue>;
}
