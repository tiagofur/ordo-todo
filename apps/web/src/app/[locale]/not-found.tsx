import { Link } from "@/i18n/navigation";
import { FileQuestion } from "lucide-react";
import { Button } from "@ordo-todo/ui";

/**
 * Custom 404 Not Found page.
 * Displayed when a user navigates to a non-existent route.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center px-4">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted mb-6">
        <FileQuestion className="h-12 w-12 text-muted-foreground" />
      </div>
      
      <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Página no encontrada
      </h2>
      
      <p className="text-muted-foreground mb-8 max-w-md">
        Lo sentimos, la página que buscas no existe o ha sido movida.
        Verifica la URL o vuelve al inicio.
      </p>
      
      <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link href="/dashboard">
            Ir al Dashboard
          </Link>
        </Button>
        <Button asChild>
          <Link href="/">
            Volver al Inicio
          </Link>
        </Button>
      </div>
    </div>
  );
}
