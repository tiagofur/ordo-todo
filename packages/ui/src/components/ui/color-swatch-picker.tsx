import { cn } from "../../utils/index.js";

/**
 * Paleta canónica del design system (ODD 025). Re-exportada desde core:
 * única fuente para todos los pickers de color de formularios.
 */
export { FORM_COLORS } from "@ordo-todo/core";
import { FORM_COLORS } from "@ordo-todo/core";

export interface ColorSwatchPickerLabels {
  /** aria-label para el swatch del valor actual fuera de paleta. */
  currentColor?: string;
}

interface ColorSwatchPickerProps {
  /** Color seleccionado (hex). Un valor fuera de `colors` se muestra como swatch extra. */
  value?: string;
  onChange: (color: string) => void;
  /** Paleta; por defecto FORM_COLORS (12 colores canónicos). */
  colors?: readonly string[];
  labels?: ColorSwatchPickerLabels;
  className?: string;
}

/**
 * Picker de color estándar de formularios (ODD 025 S2): swatches
 * rounded-lg h-9 w-9, selección con ring-primary + escala, aria-pressed.
 * Reemplaza los 8 pickers inline (círculo/rounded/bordered) de la app.
 */
export function ColorSwatchPicker({
  value,
  onChange,
  colors = FORM_COLORS,
  labels,
  className,
}: ColorSwatchPickerProps) {
  const currentIsCustom = !!value && !colors.includes(value);

  return (
    <div
      role="group"
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      {currentIsCustom && (
        <button
          type="button"
          aria-label={labels?.currentColor ?? "Current color"}
          aria-pressed="true"
          onClick={() => onChange(value as string)}
          className={cn(
            "h-9 w-9 shrink-0 rounded-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ring-2 ring-offset-2 ring-offset-background ring-primary scale-110",
          )}
          style={{ backgroundColor: value }}
        />
      )}
      {colors.map((color) => {
        const selected = value === color;
        return (
          <button
            key={color}
            type="button"
            aria-label={color}
            aria-pressed={selected}
            onClick={() => onChange(color)}
            className={cn(
              "h-9 w-9 shrink-0 rounded-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              selected &&
                "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110",
            )}
            style={{ backgroundColor: color }}
          />
        );
      })}
    </div>
  );
}
