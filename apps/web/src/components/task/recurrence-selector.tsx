"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { useTranslations } from "next-intl";

export interface RecurrenceValue {
  pattern: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';
  interval?: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  endDate?: Date;
}

interface RecurrenceSelectorProps {
  value?: RecurrenceValue;
  onChange: (value?: RecurrenceValue) => void;
}

export function RecurrenceSelector({ value, onChange }: RecurrenceSelectorProps) {
  const t = useTranslations("Tasks"); // Assuming Tasks translations exist
  const [enabled, setEnabled] = useState(!!value);
  const [pattern, setPattern] = useState<RecurrenceValue['pattern']>(value?.pattern || 'DAILY');
  const [interval, setInterval] = useState(value?.interval || 1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(value?.daysOfWeek || []);
  const [endDate, setEndDate] = useState<Date | undefined>(value?.endDate);

  useEffect(() => {
    if (enabled) {
      onChange({
        pattern,
        interval: pattern === 'CUSTOM' ? interval : 1,
        daysOfWeek: pattern === 'WEEKLY' ? daysOfWeek : undefined,
        endDate,
      });
    } else {
      onChange(undefined);
    }
  }, [enabled, pattern, interval, daysOfWeek, endDate]);

  const toggleDay = (day: number) => {
    if (daysOfWeek.includes(day)) {
      setDaysOfWeek(daysOfWeek.filter((d) => d !== day));
    } else {
      setDaysOfWeek([...daysOfWeek, day]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="recurrence-enabled"
          checked={enabled}
          onCheckedChange={(checked) => setEnabled(!!checked)}
        />
        <Label htmlFor="recurrence-enabled">Repetir tarea</Label>
      </div>

      {enabled && (
        <div className="space-y-4 pl-6 border-l-2 border-muted ml-1">
          <div className="grid gap-2">
            <Label>Frecuencia</Label>
            <Select
              value={pattern}
              onValueChange={(val) => setPattern(val as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">Diariamente</SelectItem>
                <SelectItem value="WEEKLY">Semanalmente</SelectItem>
                <SelectItem value="MONTHLY">Mensualmente</SelectItem>
                <SelectItem value="YEARLY">Anualmente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {pattern === 'WEEKLY' && (
            <div className="grid gap-2">
              <Label>Días de la semana</Label>
              <div className="flex gap-2 flex-wrap">
                {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, index) => (
                  <div key={index} className="flex items-center space-x-1">
                    <Checkbox
                      id={`day-${index}`}
                      checked={daysOfWeek.includes(index)}
                      onCheckedChange={() => toggleDay(index)}
                    />
                    <Label htmlFor={`day-${index}`}>{day}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label>Terminar (Opcional)</Label>
            <DatePicker date={endDate} setDate={setEndDate} />
          </div>
        </div>
      )}
    </div>
  );
}
