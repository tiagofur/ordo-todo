import { Calendar } from "./calendar.js";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover.js";
import { Button } from "./button.js";
import { CalendarIcon } from "lucide-react";
import { cn } from "../../utils/index.js";
import { format } from "date-fns";

interface DatePickerProps {
  date?: Date;
  setDate: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  // Popover state (lifted up for platform-agnostic design)
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DatePicker({ date, setDate, placeholder = "Pick a date", className, open = false, onOpenChange }: DatePickerProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            setDate(selectedDate);
            onOpenChange?.(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
