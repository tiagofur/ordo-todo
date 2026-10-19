import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Monitor, 
  Smartphone, 
  Laptop, 
  Trash2, 
  LogOut, 
  Shield, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2 
} from "lucide-react";
import { Button, Label, cn } from "@ordo-todo/ui";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";
import type { SessionInfo } from "@ordo-todo/api-client";
import { useTranslation } from "react-i18next";

const deviceIcons: Record<string, any> = {
  web: Monitor,
  mobile: Smartphone,
  desktop: Laptop,
};

const deviceColors: Record<string, string> = {
  web: "text-blue-500 bg-blue-500/10",
  mobile: "text-emerald-500 bg-emerald-500/10",
  desktop: "text-purple-500 bg-purple-500/10",
};

export function SessionsManager() {
  const { t } = (useTranslation as any)();
  const queryClient = useQueryClient();
  const [revokeAllConfirm, setRevokeAllConfirm] = useState(false);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);

  function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t("Settings.sessions.relativeTime.justNow", "Ahora mismo");
    if (diffMins === 1) return t("Settings.sessions.relativeTime.minute", "Hace 1 minuto");
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours === 1) return t("Settings.sessions.relativeTime.hour", "Hace 1 hora");
    if (diffHours < 24) return `${diffHours} h`;
    if (diffDays === 1) return t("Settings.sessions.relativeTime.day", "Ayer");
    if (diffDays < 7) return `${diffDays} días`;
    return date.toLocaleDateString();
  }

  // Fetch sessions
  const { data: sessions, isLoading, error } = useQuery<SessionInfo[]>({
    queryKey: ['sessions'],
    queryFn: async () => {
      const response = await apiClient.getSessions();
      return response as SessionInfo[];
    },
    staleTime: 30000,
  });

  // Revoke single session
  const revokeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await apiClient.revokeSession(sessionId);
    },
    onMutate: (sessionId) => {
      setRevokingSessionId(sessionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success(t("Settings.sessions.revokeSuccess", "Sesión cerrada correctamente"));
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t("Settings.sessions.revokeError", "Error al cerrar la sesión"));
    },
    onSettled: () => {
      setRevokingSessionId(null);
    },
  });

  // Revoke all other sessions
  const revokeOthersMutation = useMutation({
    mutationFn: async () => {
      await apiClient.revokeAllOtherSessions();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setRevokeAllConfirm(false);
      toast.success(t("Settings.sessions.revokeOthersSuccess", "Todas las demás sesiones han sido cerradas"));
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t("Settings.sessions.revokeError", "Error al cerrar sesiones"));
      setRevokeAllConfirm(false);
    },
  });

  const otherSessionsCount = sessions?.filter(s => !s.isCurrent).length || 0;

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-xs">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground text-sm">{t("Settings.sessions.loading", "Cargando sesiones activas...")}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-xs">
        <div className="flex items-center gap-3 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <span className="text-sm">{t("Settings.sessions.loadError", "No se pudieron cargar las sesiones activas")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <Label className="text-base font-semibold text-foreground">
              {t("Settings.sessions.title", "Sesiones Activas")}
            </Label>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {sessions?.length === 1 
                ? t("Settings.sessions.single", "Solo tienes una sesión activa (esta)")
                : `Tienes ${sessions?.length || 0} sesiones activas en tus dispositivos`
              }
            </p>
          </div>
          
          {otherSessionsCount > 0 && (
            <AnimatePresence mode="wait">
              {revokeAllConfirm ? (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-2"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRevokeAllConfirm(false)}
                    disabled={revokeOthersMutation.isPending}
                    className="rounded-xl border-border/60 text-xs"
                  >
                    {t("Settings.sessions.cancel", "Cancelar")}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => revokeOthersMutation.mutate()}
                    disabled={revokeOthersMutation.isPending}
                    className="rounded-xl text-xs gap-1.5"
                  >
                    {revokeOthersMutation.isPending ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        {t("Settings.sessions.closing", "Cerrando...")}
                      </>
                    ) : (
                      t("Settings.sessions.confirm", "Confirmar")
                    )}
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRevokeAllConfirm(true)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 rounded-xl text-xs gap-1.5"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    {t("Settings.sessions.closeOthers", "Cerrar otras sesiones")}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {sessions?.map((session, index) => {
              const DeviceIcon = deviceIcons[session.deviceType] || Monitor;
              const colorClasses = deviceColors[session.deviceType] || deviceColors.web;
              
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "flex items-center justify-between p-3.5 sm:p-4 rounded-xl border transition-colors",
                    session.isCurrent
                      ? "bg-cyan-500/10 border-cyan-500/30"
                      : "bg-muted/30 border-border/60 hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={cn("p-2.5 rounded-xl shrink-0", colorClasses)}>
                      <DeviceIcon className="h-5 w-5" />
                    </div>
                    
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          {session.deviceName || `${session.browser || 'Navegador'} en ${session.os}`}
                        </span>
                        {session.isCurrent && (
                          <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-500 font-semibold">
                            <CheckCircle2 className="h-3 w-3" />
                            {t("Settings.sessions.current", "Sesión actual")}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(session.lastActive)}
                        </span>
                        {session.ip && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {session.ip}
                            {session.location && ` • ${session.location}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!session.isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => revokeSessionMutation.mutate(session.id)}
                      disabled={revokingSessionId === session.id}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl h-8 w-8 p-0"
                    >
                      {revokingSessionId === session.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Security Tips */}
      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
            <Shield className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-semibold text-foreground">Consejos de Seguridad</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Cierra las sesiones en dispositivos que no reconozcas o que no uses con frecuencia.</li>
              <li>• Utiliza contraseñas seguras y actualízalas regularmente para proteger tu información.</li>
              <li>• Cada sesión activa te permite acceder a tus datos sin tener que volver a autenticarte.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
