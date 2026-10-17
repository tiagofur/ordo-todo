interface DatePickerProps {
    date?: Date;
    setDate: (date: Date | undefined) => void;
    placeholder?: string;
    className?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}
export declare function DatePicker({ date, setDate, placeholder, className, open: controlledOpen, onOpenChange: controlledOnOpenChange, }: DatePickerProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=date-picker.d.ts.map