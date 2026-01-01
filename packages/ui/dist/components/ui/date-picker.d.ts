export interface DatePickerProps {
    date?: Date;
    setDate: (date: Date | undefined) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    placeholder?: string;
    className?: string;
}
export declare function DatePicker({ date, setDate, open, onOpenChange, placeholder, className, }: DatePickerProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=date-picker.d.ts.map