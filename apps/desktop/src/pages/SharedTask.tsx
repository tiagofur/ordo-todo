import { useParams, useNavigate } from "react-router-dom";
import { useSharedTask } from "@/hooks/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Skeleton,
} from "@ordo-todo/ui";
import { ArrowLeft, Calendar, User, Tag, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function SharedTaskPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { data: task, isLoading, error } = useSharedTask(token || "");

  const handleGoToApp = () => {
    navigate("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6 space-y-4">
            <div className="text-red-500 text-4xl mb-4">🔒</div>
            <h2 className="text-xl font-semibold">Tarea no encontrada</h2>
            <p className="text-muted-foreground">
              El enlace de compartir ha expirado, es inválido, o la tarea ya no está disponible.
            </p>
            <Button onClick={() => navigate("/")} className="w-full">
              Ir a la aplicación
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "COMPLETED":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "HIGH":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      case "URGENT":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Ordo-Todo
          </Button>
          <Button onClick={handleGoToApp}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Usar Ordo-Todo
          </Button>
        </div>

        {/* Shared Task Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <CardTitle className="text-2xl">{task.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Compartido por {task.createdBy?.name || "Anónimo"}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge className={getStatusColor(task.status)}>
                  {task.status === "TODO" && "Pendiente"}
                  {task.status === "IN_PROGRESS" && "En progreso"}
                  {task.status === "COMPLETED" && "Completado"}
                </Badge>
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority === "LOW" && "Baja"}
                  {task.priority === "MEDIUM" && "Media"}
                  {task.priority === "HIGH" && "Alta"}
                  {task.priority === "URGENT" && "Urgente"}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Description */}
            {task.description && (
              <div>
                <h3 className="font-semibold mb-2">Descripción</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            )}

            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {task.dueDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Fecha límite: {format(new Date(task.dueDate), "PPP", { locale: es })}
                  </span>
                </div>
              )}

              {task.project && (
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span>Proyecto: {task.project.name}</span>
                </div>
              )}

              {task.tags && task.tags.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span>Tags: {task.tags.map((tag: any) => tag.name).join(", ")}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Creada: {format(new Date(task.createdAt), "PPP", { locale: es })}
                </span>
              </div>
            </div>

            {/* Subtasks */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">
                  Subtareas ({task.subtasks.filter((st: any) => st.status === "COMPLETED").length}/{task.subtasks.length})
                </h3>
                <div className="space-y-2">
                  {task.subtasks.map((subtask: any) => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-3 p-2 rounded-lg border"
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          subtask.status === "COMPLETED"
                            ? "bg-green-500 border-green-500"
                            : "border-gray-300"
                        }`}
                      >
                        {subtask.status === "COMPLETED" && (
                          <div className="text-white text-xs text-center">✓</div>
                        )}
                      </div>
                      <span
                        className={
                          subtask.status === "COMPLETED" ? "line-through text-muted-foreground" : ""
                        }
                      >
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">¿Te gusta esta organización?</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Únete a Ordo-Todo para gestionar tus propias tareas, proyectos y alcanzar tus metas.
              </p>
              <Button onClick={handleGoToApp} size="lg">
                <ExternalLink className="h-4 w-4 mr-2" />
                Empezar a usar Ordo-Todo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}