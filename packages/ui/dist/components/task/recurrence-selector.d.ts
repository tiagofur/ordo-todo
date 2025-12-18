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
        daysShort?: string[];
    };
}
export declare function RecurrenceSelector({ value, onChange, labels }: RecurrenceSelectorProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=recurrence-selector.d.ts.map