"use client";

import { useEffect, useState } from "react";
import {
  Input,
  Label,
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Button,
} from "@ordo-todo/ui";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  useCustomFields,
  useTaskCustomValues,
  useSetTaskCustomValues,
} from "@/hooks/use-custom-fields";
import type { CustomField, CustomFieldValue, SetCustomFieldValueDto } from "@ordo-todo/api-client";

interface CustomFieldInputsProps {
  projectId: string;
  taskId?: string; // If provided, load existing values
  values: Record<string, string>; // fieldId -> value
  onChange: (fieldId: string, value: string) => void;
}

/**
 * Renders custom field inputs based on project configuration
 */
export function CustomFieldInputs({
  projectId,
  taskId,
  values,
  onChange,
}: CustomFieldInputsProps) {
  const { data: fields, isLoading: fieldsLoading } = useCustomFields(projectId);
  const { data: existingValues, isLoading: valuesLoading } = useTaskCustomValues(taskId || "");

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
    <div className="space-y-4">
      <div className="text-sm font-medium text-muted-foreground border-t pt-4">
        Custom Fields
      </div>
      {fields.map((field: CustomField) => (
        <CustomFieldInput
          key={field.id}
          field={field}
          value={values[field.id] || ""}
          onChange={(value) => onChange(field.id, value)}
        />
      ))}
    </div>
  );
}

interface CustomFieldInputProps {
  field: CustomField;
  value: string;
  onChange: (value: string) => void;
}

function CustomFieldInput({ field, value, onChange }: CustomFieldInputProps) {
  const [multiValues, setMultiValues] = useState<string[]>(() =>
    field.type === "MULTI_SELECT" && value ? value.split(",").map((s) => s.trim()) : []
  );

  const handleMultiToggle = (option: string) => {
    const newValues = multiValues.includes(option)
      ? multiValues.filter((v) => v !== option)
      : [...multiValues, option];
    setMultiValues(newValues);
    onChange(newValues.join(","));
  };

  switch (field.type) {
    case "TEXT":
      return (
        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            {field.name}
            {field.isRequired && <span className="text-destructive">*</span>}
          </Label>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.description || `Enter ${field.name.toLowerCase()}`}
          />
        </div>
      );

    case "NUMBER":
      return (
        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            {field.name}
            {field.isRequired && <span className="text-destructive">*</span>}
          </Label>
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.description || "0"}
          />
        </div>
      );

    case "SELECT":
      return (
        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            {field.name}
            {field.isRequired && <span className="text-destructive">*</span>}
          </Label>
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.name.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case "MULTI_SELECT":
      return (
        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            {field.name}
            {field.isRequired && <span className="text-destructive">*</span>}
          </Label>
          <div className="flex flex-wrap gap-2">
            {field.options?.map((option) => (
              <Badge
                key={option}
                variant={multiValues.includes(option) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleMultiToggle(option)}
              >
                {option}
                {multiValues.includes(option) && (
                  <X className="w-3 h-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        </div>
      );

    case "DATE":
      const dateValue = value ? new Date(value) : undefined;
      return (
        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            {field.name}
            {field.isRequired && <span className="text-destructive">*</span>}
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateValue ? format(dateValue, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateValue}
                onSelect={(date) => onChange(date?.toISOString() || "")}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      );

    case "URL":
      return (
        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            {field.name}
            {field.isRequired && <span className="text-destructive">*</span>}
          </Label>
          <Input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
          />
        </div>
      );

    case "EMAIL":
      return (
        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            {field.name}
            {field.isRequired && <span className="text-destructive">*</span>}
          </Label>
          <Input
            type="email"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="email@example.com"
          />
        </div>
      );

    case "CHECKBOX":
      const isChecked = value === "true" || value === "1";
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`cf-${field.id}`}
            checked={isChecked}
            onCheckedChange={(checked) => onChange(checked ? "true" : "false")}
          />
          <Label htmlFor={`cf-${field.id}`} className="flex items-center gap-1 cursor-pointer">
            {field.name}
            {field.isRequired && <span className="text-destructive">*</span>}
          </Label>
        </div>
      );

    default:
      return null;
  }
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

  const getValuesForSubmit = (): SetCustomFieldValueDto[] => {
    return Object.entries(values)
      .filter(([_, v]) => v !== "")
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
