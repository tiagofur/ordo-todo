'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  SlidersHorizontal,
  Save,
  Loader2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';
import {
  Button,
  Input,
  Label,
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Skeleton,
} from '@/components/ui';
import {
  useCustomFields,
  useTaskCustomValues,
  useSetTaskCustomValues,
} from '@/hooks/use-custom-fields';
import type { CustomField, CustomFieldValue } from '@ordo-todo/api-client';

interface TaskCustomFieldsEditorProps {
  taskId: string;
  projectId?: string | null;
}

export function TaskCustomFieldsEditor({
  taskId,
  projectId,
}: TaskCustomFieldsEditorProps) {
  const { data: fields = [], isLoading: fieldsLoading } = useCustomFields(
    projectId || ''
  );
  const { data: currentValues = [], isLoading: valuesLoading } =
    useTaskCustomValues(taskId);
  const setTaskValuesMutation = useSetTaskCustomValues();

  const [values, setValues] = useState<Record<string, string>>({});
  const [initialValues, setInitialValues] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Sync initial values from currentValues query
  useEffect(() => {
    if (currentValues && Array.isArray(currentValues)) {
      const map: Record<string, string> = {};
      currentValues.forEach((item: CustomFieldValue) => {
        if (item.fieldId && item.value !== undefined && item.value !== null) {
          map[item.fieldId] = String(item.value);
        }
      });
      setValues(map);
      setInitialValues(map);
      setIsDirty(false);
    }
  }, [currentValues]);

  const handleChange = (fieldId: string, val: string) => {
    setValues((prev) => {
      const next = { ...prev, [fieldId]: val };
      const changed = Object.keys(next).some(
        (key) => next[key] !== (initialValues[key] || '')
      );
      setIsDirty(changed);
      return next;
    });
  };

  const handleSave = async () => {
    if (!taskId) return;

    // Validate required fields
    for (const field of fields) {
      if (field.isRequired && (!values[field.id] || values[field.id].trim() === '')) {
        toast.error(`Field "${field.name}" is required.`);
        return;
      }
    }

    const payload = Object.entries(values).map(([fieldId, val]) => ({
      fieldId,
      value: val,
    }));

    try {
      await setTaskValuesMutation.mutateAsync({
        taskId,
        data: { values: payload },
      });
      setInitialValues(values);
      setIsDirty(false);
      toast.success('Custom fields saved successfully');
    } catch {
      toast.error('Failed to save custom fields');
    }
  };

  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg border-dashed bg-muted/20">
        <SlidersHorizontal className="w-10 h-10 text-muted-foreground/60 mb-3" />
        <h4 className="text-sm font-semibold mb-1">No Project Assigned</h4>
        <p className="text-xs text-muted-foreground max-w-sm">
          Assign this task to a project to configure and track custom fields like
          story points, priority overrides, or stages.
        </p>
      </div>
    );
  }

  if (fieldsLoading || valuesLoading) {
    return (
      <div className="space-y-4 p-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg border-dashed bg-muted/20 space-y-3">
        <SlidersHorizontal className="w-10 h-10 text-muted-foreground/60" />
        <div>
          <h4 className="text-sm font-semibold">No Custom Fields Defined</h4>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">
            This project has no custom fields configured yet. You can create fields
            such as Select, Number, or Date in the project settings.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild className="gap-2 text-xs">
          <Link href={`/projects/${projectId}`}>
            <ExternalLink className="w-3.5 h-3.5" />
            Go to Project Custom Fields
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Project Fields ({fields.length})
          </span>
        </div>
        <Button
          size="sm"
          disabled={!isDirty || setTaskValuesMutation.isPending}
          onClick={handleSave}
          className="gap-1.5 h-8 text-xs font-medium"
        >
          {setTaskValuesMutation.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((field) => {
          const val = values[field.id] || '';
          return (
            <div
              key={field.id}
              className="p-3 rounded-lg border border-border bg-card space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <Label
                  htmlFor={`cf-${field.id}`}
                  className="text-xs font-medium flex items-center gap-1"
                >
                  {field.name}
                  {field.isRequired && (
                    <span className="text-destructive font-bold">*</span>
                  )}
                </Label>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                  {field.type.toLowerCase()}
                </Badge>
              </div>

              {field.description && (
                <p className="text-[11px] text-muted-foreground">
                  {field.description}
                </p>
              )}

              <div className="pt-1">
                {field.type === 'TEXT' && (
                  <Input
                    id={`cf-${field.id}`}
                    value={val}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder={`Enter ${field.name}...`}
                    className="h-8 text-xs"
                  />
                )}

                {field.type === 'NUMBER' && (
                  <Input
                    id={`cf-${field.id}`}
                    type="number"
                    value={val}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder="0"
                    className="h-8 text-xs"
                  />
                )}

                {field.type === 'SELECT' && (
                  <Select
                    value={val}
                    onValueChange={(newVal) => handleChange(field.id, newVal)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select an option..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(field.options || []).map((opt) => (
                        <SelectItem key={opt} value={opt} className="text-xs">
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {field.type === 'DATE' && (
                  <Input
                    id={`cf-${field.id}`}
                    type="date"
                    value={val ? val.split('T')[0] : ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className="h-8 text-xs"
                  />
                )}

                {field.type === 'CHECKBOX' && (
                  <div className="flex items-center gap-2 pt-1">
                    <Checkbox
                      id={`cf-${field.id}`}
                      checked={val === 'true' || val === '1'}
                      onCheckedChange={(checked) =>
                        handleChange(field.id, checked ? 'true' : 'false')
                      }
                    />
                    <label
                      htmlFor={`cf-${field.id}`}
                      className="text-xs text-muted-foreground cursor-pointer"
                    >
                      {val === 'true' || val === '1' ? 'Active / Yes' : 'No'}
                    </label>
                  </div>
                )}

                {field.type === 'URL' && (
                  <Input
                    id={`cf-${field.id}`}
                    type="url"
                    value={val}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder="https://..."
                    className="h-8 text-xs"
                  />
                )}

                {field.type === 'EMAIL' && (
                  <Input
                    id={`cf-${field.id}`}
                    type="email"
                    value={val}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder="name@example.com"
                    className="h-8 text-xs"
                  />
                )}

                {field.type === 'MULTI_SELECT' && (
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap gap-1">
                      {(field.options || []).map((opt) => {
                        const selectedList = val ? val.split(',') : [];
                        const isSelected = selectedList.includes(opt);
                        return (
                          <Badge
                            key={opt}
                            variant={isSelected ? 'default' : 'outline'}
                            className="cursor-pointer text-[10px] select-none"
                            onClick={() => {
                              const nextList = isSelected
                                ? selectedList.filter((x) => x !== opt)
                                : [...selectedList, opt];
                              handleChange(field.id, nextList.join(','));
                            }}
                          >
                            {opt}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
