'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
  Checkbox,
  DatePicker,
  Input,
} from '@/components/ui';
import { Repeat } from 'lucide-react';

export interface RecurrenceValue {
  pattern: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';
  interval?: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  endDate?: Date;
}

interface RecurrenceSelectorProps {
  value?: RecurrenceValue | null;
  onChange: (value?: RecurrenceValue) => void;
  labels?: {
    enable?: string;
    frequency?: string;
    interval?: string;
    every?: string;
    daily?: string;
    weekly?: string;
    monthly?: string;
    yearly?: string;
    weekDays?: string;
    dayOfMonth?: string;
    endDate?: string;
    daysShort?: string[];
  };
}

const DEFAULT_LABELS = {
  enable: 'Repeat task',
  frequency: 'Frequency',
  interval: 'Interval',
  every: 'Every',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
  weekDays: 'Days of week',
  dayOfMonth: 'Day of month',
  endDate: 'End date (Optional)',
  daysShort: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
};

export function RecurrenceSelector({ value, onChange, labels = {} }: RecurrenceSelectorProps) {
  const t = { ...DEFAULT_LABELS, ...labels };

  const [enabled, setEnabled] = useState(!!value);
  const [pattern, setPattern] = useState<RecurrenceValue['pattern']>(value?.pattern || 'DAILY');
  const [interval, setInterval] = useState(value?.interval || 1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(
    value?.daysOfWeek?.length ? value.daysOfWeek : [new Date().getDay()]
  );
  const [dayOfMonth, setDayOfMonth] = useState<number>(
    value?.dayOfMonth || new Date().getDate()
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    value?.endDate ? new Date(value.endDate) : undefined
  );

  // Sync state when value changes externally
  useEffect(() => {
    if (value) {
      setEnabled(true);
      setPattern(value.pattern);
      if (value.interval) setInterval(value.interval);
      if (value.daysOfWeek?.length) setDaysOfWeek(value.daysOfWeek);
      if (value.dayOfMonth) setDayOfMonth(value.dayOfMonth);
      if (value.endDate) setEndDate(new Date(value.endDate));
    } else {
      setEnabled(false);
    }
  }, [value]);

  useEffect(() => {
    if (enabled) {
      onChange({
        pattern,
        interval: Math.max(1, interval || 1),
        daysOfWeek: pattern === 'WEEKLY' ? (daysOfWeek.length > 0 ? daysOfWeek : [new Date().getDay()]) : undefined,
        dayOfMonth: pattern === 'MONTHLY' ? dayOfMonth : undefined,
        endDate,
      });
    } else {
      onChange(undefined);
    }
  }, [enabled, pattern, interval, daysOfWeek, dayOfMonth, endDate]);

  const toggleDay = (day: number) => {
    if (daysOfWeek.includes(day)) {
      if (daysOfWeek.length > 1) {
        setDaysOfWeek(daysOfWeek.filter((d) => d !== day));
      }
    } else {
      setDaysOfWeek([...daysOfWeek, day].sort((a, b) => a - b));
    }
  };

  const getIntervalUnit = () => {
    switch (pattern) {
      case 'DAILY':
        return interval === 1 ? 'day' : 'days';
      case 'WEEKLY':
        return interval === 1 ? 'week' : 'weeks';
      case 'MONTHLY':
        return interval === 1 ? 'month' : 'months';
      case 'YEARLY':
        return interval === 1 ? 'year' : 'years';
      default:
        return 'cycles';
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
        <Label
          htmlFor="recurrence-enabled"
          className="text-sm font-medium cursor-pointer flex items-center gap-1.5"
        >
          <Repeat className="w-3.5 h-3.5 text-muted-foreground" />
          {t.enable}
        </Label>
      </div>

      {enabled && (
        <div className="space-y-4 pl-4 border-l-2 border-primary/30 ml-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t.frequency}</Label>
              <Select
                value={pattern}
                onValueChange={(val) => {
                  const newPattern = val as RecurrenceValue['pattern'];
                  setPattern(newPattern);
                  if (newPattern === 'WEEKLY' && daysOfWeek.length === 0) {
                    setDaysOfWeek([new Date().getDay()]);
                  }
                }}
              >
                <SelectTrigger className="h-9">
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

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                {t.every} ({getIntervalUnit()})
              </Label>
              <Input
                type="number"
                min={1}
                max={365}
                value={interval}
                onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value) || 1))}
                className="h-9"
              />
            </div>
          </div>

          {pattern === 'WEEKLY' && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t.weekDays}</Label>
              <div className="flex gap-1.5 flex-wrap">
                {t.daysShort?.map((day, index) => {
                  const isSelected = daysOfWeek.includes(index);
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => toggleDay(index)}
                      className={`w-8 h-8 rounded-full text-xs font-semibold transition-all duration-150 flex items-center justify-center ${
                        isSelected
                          ? 'bg-purple-500 text-white shadow-sm'
                          : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {pattern === 'MONTHLY' && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t.dayOfMonth}</Label>
              <Input
                type="number"
                min={1}
                max={31}
                value={dayOfMonth}
                onChange={(e) =>
                  setDayOfMonth(Math.min(31, Math.max(1, parseInt(e.target.value) || 1)))
                }
                className="h-9 w-28"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{t.endDate}</Label>
            <DatePicker date={endDate} setDate={setEndDate} />
          </div>
        </div>
      )}
    </div>
  );
}
