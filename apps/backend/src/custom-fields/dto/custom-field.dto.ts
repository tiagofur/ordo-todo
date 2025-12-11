import {
    IsString,
    IsEnum,
    IsOptional,
    IsBoolean,
    IsInt,
    IsArray,
    MinLength,
} from 'class-validator';

export enum CustomFieldType {
    TEXT = 'TEXT',
    NUMBER = 'NUMBER',
    SELECT = 'SELECT',
    MULTI_SELECT = 'MULTI_SELECT',
    DATE = 'DATE',
    URL = 'URL',
    EMAIL = 'EMAIL',
    CHECKBOX = 'CHECKBOX',
}

export class CreateCustomFieldDto {
    @IsString()
    @MinLength(1)
    name: string;

    @IsEnum(CustomFieldType)
    type: CustomFieldType;

    @IsString()
    @IsOptional()
    description?: string;

    @IsArray()
    @IsOptional()
    options?: string[]; // For SELECT/MULTI_SELECT

    @IsBoolean()
    @IsOptional()
    isRequired?: boolean;

    @IsInt()
    @IsOptional()
    position?: number;
}

export class UpdateCustomFieldDto {
    @IsString()
    @MinLength(1)
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsArray()
    @IsOptional()
    options?: string[];

    @IsBoolean()
    @IsOptional()
    isRequired?: boolean;

    @IsInt()
    @IsOptional()
    position?: number;
}

export class SetCustomFieldValueDto {
    @IsString()
    fieldId: string;

    @IsString()
    value: string; // All values stored as string, parsed based on field type
}

export class SetMultipleCustomFieldValuesDto {
    @IsArray()
    values: SetCustomFieldValueDto[];
}
