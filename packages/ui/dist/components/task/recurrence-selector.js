'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '../ui/select.js';
import { Label } from '../ui/label.js';
import { Checkbox } from '../ui/checkbox.js';
import { DatePicker } from '../ui/date-picker.js';
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
export function RecurrenceSelector({ value, onChange, labels = {} }) {
    const t = { ...DEFAULT_LABELS, ...labels };
    const [enabled, setEnabled] = useState(!!value);
    const [pattern, setPattern] = useState(value?.pattern || 'DAILY');
    const [interval, setInterval] = useState(value?.interval || 1);
    const [daysOfWeek, setDaysOfWeek] = useState(value?.daysOfWeek || []);
    const [endDate, setEndDate] = useState(value?.endDate);
    // Sync state with value prop if it changes externally (optional but good practice)
    useEffect(() => {
        if (value) {
            setEnabled(true);
            setPattern(value.pattern);
            if (value.interval)
                setInterval(value.interval);
            if (value.daysOfWeek)
                setDaysOfWeek(value.daysOfWeek);
            if (value.endDate)
                setEndDate(value.endDate);
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
        }
        else {
            onChange(undefined);
        }
    }, [enabled, pattern, interval, daysOfWeek, endDate]);
    const toggleDay = (day) => {
        if (daysOfWeek.includes(day)) {
            setDaysOfWeek(daysOfWeek.filter((d) => d !== day));
        }
        else {
            setDaysOfWeek([...daysOfWeek, day]);
        }
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "recurrence-enabled", checked: enabled, onCheckedChange: (checked) => setEnabled(!!checked) }), _jsx(Label, { htmlFor: "recurrence-enabled", children: t.enable })] }), enabled && (_jsxs("div", { className: "space-y-4 pl-6 border-l-2 border-muted ml-1", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { children: t.frequency }), _jsxs(Select, { value: pattern, onValueChange: (val) => setPattern(val), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "DAILY", children: t.daily }), _jsx(SelectItem, { value: "WEEKLY", children: t.weekly }), _jsx(SelectItem, { value: "MONTHLY", children: t.monthly }), _jsx(SelectItem, { value: "YEARLY", children: t.yearly })] })] })] }), pattern === 'WEEKLY' && (_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { children: t.weekDays }), _jsx("div", { className: "flex gap-2 flex-wrap", children: t.daysShort?.map((day, index) => (_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Checkbox, { id: `day-${index}`, checked: daysOfWeek.includes(index), onCheckedChange: () => toggleDay(index) }), _jsx(Label, { htmlFor: `day-${index}`, children: day })] }, index))) })] })), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { children: t.endDate }), _jsx(DatePicker, { date: endDate, setDate: setEndDate })] })] }))] }));
}
