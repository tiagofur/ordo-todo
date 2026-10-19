import { Loader2, AlertTriangle, Plus } from 'lucide-react';
import { cn } from '../../utils/index.js';
import { Badge } from '../ui/badge.js';

// Visible focus for tabbable chips (Tab cycles inferred fields, S2).
const CHIP_FOCUS_CLASS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export interface QuickAddParsed {
  title: string;
  dueAt?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  projectHint?: string;
  recurrence?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  needsConfirmation?: boolean;
}

interface QuickAddProps {
  open: boolean;
  value: string;
  parsed: QuickAddParsed | null;
  isParsing: boolean;
  onSubmit: (input: string) => void;
  onInputChange: (input: string) => void;
  onClose: () => void;
  labels: {
    placeholder: string;
    hint: string;
    confirmHint: string;
  };
}

/**
 * QuickAdd - global NL task capture input.
 * Fully controlled (no internal state): state lives in the host app.
 */
export function QuickAdd({
  open,
  value,
  parsed,
  isParsing,
  onSubmit,
  onInputChange,
  onClose,
  labels,
}: QuickAddProps) {
  if (!open) return null;

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && value.trim()) {
      onSubmit(value.trim());
    }
    if (event.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-xl border bg-card p-4 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            autoFocus
            value={value}
            onChange={(event) => {
              onInputChange(event.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder={labels.placeholder}
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
          />
          {isParsing && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        {parsed && value.trim() && (
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {parsed.dueAt && (
              <Badge variant="secondary" tabIndex={0} className={CHIP_FOCUS_CLASS}>
                {new Date(parsed.dueAt).toLocaleDateString()}
              </Badge>
            )}
            {parsed.priority && parsed.priority !== 'MEDIUM' && (
              <Badge variant="secondary" tabIndex={0} className={CHIP_FOCUS_CLASS}>
                {parsed.priority}
              </Badge>
            )}
            {parsed.projectHint && (
              <Badge variant="secondary" tabIndex={0} className={CHIP_FOCUS_CLASS}>
                #{parsed.projectHint}
              </Badge>
            )}
            {parsed.recurrence && (
              <Badge variant="secondary" tabIndex={0} className={CHIP_FOCUS_CLASS}>
                {parsed.recurrence}
              </Badge>
            )}
            {parsed.needsConfirmation && (
              <span className={cn('flex items-center gap-1 text-xs text-amber-600')}>
                <AlertTriangle className="h-3.5 w-3.5" />
                {labels.confirmHint}
              </span>
            )}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-3">{labels.hint}</p>
      </div>
    </div>
  );
}
