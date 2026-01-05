'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { Label } from '@/components/ui';
import { Checkbox } from '@/components/ui';
import { DatePicker } from '@/components/ui';

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
  labels?: {
    enable?: string;
    frequency?: string;
    daily?: string;
    weekly?: string;
    monthly?: string;
    yearly?: string;
    weekDays?: string;
    endDate?: string;
    daysShort?: string[]; // ['D', 'L', 'M', ...]
  };
}

const DEFAULT_LABELS = {
  enable: 'Repeat task',
  frequency: 'Frequency',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
  weekDays: 'Days of week',
  endDate: 'End date (Optional)',
  daysShort: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
};

export function RecurrenceSelector({ value, onChange, labels = {} }: RecurrenceSelectorProps) {
  const t = { ...DEFAULT_LABELS, ...labels };
  
  const [enabled, setEnabled] = useState(!!value);
  const [pattern, setPattern] = useState<RecurrenceValue['pattern']>(value?.pattern || 'DAILY');
  const [interval, setInterval] = useState(value?.interval || 1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(value?.daysOfWeek || []);
  const [endDate, setEndDate] = useState<Date | undefined>(value?.endDate);

  // Sync state with value prop if it changes externally (optional but good practice)
  useEffect(() => {
    if (value) {
      setEnabled(true);
      setPattern(value.pattern);
      if (value.interval) setInterval(value.interval);
      if (value.daysOfWeek) setDaysOfWeek(value.daysOfWeek);
      if (value.endDate) setEndDate(value.endDate);
    }
  }, [value?.pattern]); // Simplified dependency check

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
        <Label htmlFor="recurrence-enabled">{t.enable}</Label>
      </div>

      {enabled && (
        <div className="space-y-4 pl-6 border-l-2 border-muted ml-1">
          <div className="grid gap-2">
            <Label>{t.frequency}</Label>
            <Select
              value={pattern}
              onValueChange={(val) => setPattern(val as RecurrenceValue['pattern'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">{t.daily}</SelectItem>
                <SelectItem value="WEEKLY">{t.weekly}</SelectItem>
                <SelectItem value="MONTHLY">{t.monthly}</SelectItem>
                <SelectItem value="YEARLY">{t.yearly}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {pattern === 'WEEKLY' && (
            <div className="grid gap-2">
              <Label>{t.weekDays}</Label>
              <div className="flex gap-2 flex-wrap">
                {t.daysShort?.map((day, index) => (
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
            <Label>{t.endDate}</Label>
            <DatePicker date={endDate} setDate={setEndDate} />
          </div>
        </div>
      )}
    </div>
  );
}
