import { cn } from "../../utils/index.js";

/**
 * Set de iconos canónico del design system (ODD 025 S3).
 * Re-exportado desde core: única fuente para los IconPicker.
 */
export { FORM_ICONS } from "@ordo-todo/core";
import { FORM_ICONS } from "@ordo-todo/core";

interface IconPickerProps {
  /** Emoji seleccionado. */
  value?: string;
  onChange: (icon: string) => void;
  /** Set de iconos; por defecto FORM_ICONS (12). */
  icons?: readonly string[];
  /** Deshabilita la interacción (permisos de edición). */
  disabled?: boolean;
  className?: string;
}

/**
 * Picker de icono estándar de formularios (ODD 025 S3): celdas
 * rounded-lg h-10 w-10, selección con ring-primary, aria-pressed.
 * Reemplaza los 4 pickers inline de emoji (constante duplicada 4×).
 */
export function IconPicker({
  value,
  onChange,
  icons = FORM_ICONS,
  disabled = false,
  className,
}: IconPickerProps) {
  return (
    <div
      role="group"
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      {icons.map((icon) => {
        const selected = value === icon;
        return (
          <button
            key={icon}
            type="button"
            aria-label={icon}
            aria-pressed={selected}
            disabled={disabled}
            onClick={() => onChange(icon)}
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border text-xl transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              selected && "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110",
              disabled && "opacity-50 cursor-not-allowed hover:scale-100",
            )}
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}
