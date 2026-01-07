export enum CustomFieldType {
    TEXT = "TEXT",
    NUMBER = "NUMBER",
    SELECT = "SELECT",
    MULTI_SELECT = "MULTI_SELECT",
    DATE = "DATE",
    CHECKBOX = "CHECKBOX",
    URL = "URL",
    EMAIL = "EMAIL",
}

export class CustomField {
    constructor(
        public readonly id: string,
        public name: string,
        public type: CustomFieldType,
        public projectId: string,
        public description?: string | null,
        public options?: string[] | null,
        public isRequired: boolean = false,
        public position: number = 0,
        public createdAt: Date = new Date(),
        public updatedAt: Date = new Date()
    ) { }

    static create(props: {
        name: string;
        type: CustomFieldType;
        projectId: string;
        description?: string;
        options?: string[];
        isRequired?: boolean;
        position?: number;
    }): CustomField {
        if (!props.name) throw new Error("Name is required");
        if (!props.type) throw new Error("Type is required");
        if (!props.projectId) throw new Error("ProjectId is required");

        if (
            (props.type === CustomFieldType.SELECT ||
                props.type === CustomFieldType.MULTI_SELECT) &&
            (!props.options || props.options.length === 0)
        ) {
            throw new Error("Select fields require options");
        }

        return new CustomField(
            "", // ID will be set by DB
            props.name,
            props.type,
            props.projectId,
            props.description,
            props.options,
            props.isRequired ?? false,
            props.position ?? 0
        );
    }

    update(props: Partial<Omit<CustomField, "id" | "createdAt" | "updatedAt">>) {
        if (props.name !== undefined) this.name = props.name;
        if (props.description !== undefined) this.description = props.description;
        if (props.options !== undefined) this.options = props.options;
        if (props.isRequired !== undefined) this.isRequired = props.isRequired;
        if (props.position !== undefined) this.position = props.position;
        this.updatedAt = new Date();
    }
}
