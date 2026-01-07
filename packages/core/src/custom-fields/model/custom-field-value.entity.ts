export class CustomFieldValue {
    constructor(
        public readonly id: string,
        public fieldId: string,
        public taskId: string,
        public value: string,
        public createdAt: Date = new Date(),
        public updatedAt: Date = new Date()
    ) { }

    static create(props: {
        fieldId: string;
        taskId: string;
        value: string;
    }): CustomFieldValue {
        if (!props.fieldId) throw new Error("FieldId is required");
        if (!props.taskId) throw new Error("TaskId is required");

        return new CustomFieldValue(
            "", // ID will be set by DB
            props.fieldId,
            props.taskId,
            props.value
        );
    }

    updateValue(value: string) {
        this.value = value;
        this.updatedAt = new Date();
    }
}
