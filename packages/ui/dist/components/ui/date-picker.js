import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Calendar } from "./calendar.js";
import { Popover, PopoverContent, PopoverTrigger, } from "./popover.js";
import { Button } from "./button.js";
import { CalendarIcon } from "lucide-react";
import { cn } from "../../utils/index.js";
import { format } from "date-fns";
export function DatePicker({ date, setDate, open, onOpenChange, placeholder = "Pick a date", className, }) {
    return (_jsxs(Popover, { open: open, onOpenChange: onOpenChange, children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground", className), children: [_jsx(CalendarIcon, { className: "mr-2 h-4 w-4" }), date ? format(date, "PPP") : _jsx("span", { children: placeholder })] }) }), _jsx(PopoverContent, { className: "w-auto p-0", align: "start", children: _jsx(Calendar, { mode: "single", selected: date, onSelect: (selectedDate) => {
                        setDate(selectedDate);
                        onOpenChange?.(false);
                    }, initialFocus: true }) })] }));
}
