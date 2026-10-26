import { SquareCheckBig } from 'lucide-react';

type BrandMarkProps = {
  /** Tamaño del cuadrado (clases de alto/ancho). */
  className?: string;
  /** Tamaño del símbolo interior. */
  iconClassName?: string;
};

/**
 * Símbolo de Ordo: el mismo artwork que el icono de escritorio, PWA y favicon
 * de la app (cuadrado morado #AD46FF con check en cuadrado), dibujado en
 * vector para que sea nítido a cualquier tamaño.
 */
export function BrandMark({ className = 'h-9 w-9', iconClassName = 'h-5 w-5' }: BrandMarkProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-[22%] bg-brand text-white ${className}`}
      aria-hidden="true"
    >
      <SquareCheckBig className={iconClassName} strokeWidth={2.5} />
    </div>
  );
}
