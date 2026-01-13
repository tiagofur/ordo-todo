"use client";

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
import { Button, Label } from "@ordo-todo/ui";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";
import type { SessionInfo } from "@ordo-todo/api-client";

const deviceIcons = {
  web: Monitor,
  mobile: Smartphone,
  desktop: Laptop,
};

const deviceColors = {
  web: "text-blue-500 bg-blue-500/10",
  mobile: "text-green-500 bg-green-500/10",
  desktop: "text-purple-500 bg-purple-500/10",
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Ahora mismo";
  if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
  return date.toLocaleDateString();
}

export function SessionsManager() {
  const queryClient = useQueryClient();
  const [revokeAllConfirm, setRevokeAllConfirm] = useState(false);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);

  // Fetch sessions
  const { data: sessions, isLoading, error } = useQuery<SessionInfo[]>({
    queryKey: ['sessions'],
    queryFn: async () => {
      const response = await apiClient.getSessions();
      return response as SessionInfo[];
    },
    staleTime: 30000, // 30 seconds
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
      toast.success('Sesión revocada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al revocar sesión');
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
      toast.success('Todas las otras sesiones han sido cerradas');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al revocar sesiones');
      setRevokeAllConfirm(false);
    },
  });

  const otherSessionsCount = sessions?.filter(s => !s.isCurrent).length || 0;

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-8 shadow-sm">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Cargando sesiones...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <span>Error al cargar las sesiones. Intenta nuevamente.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Label className="text-base">Sesiones activas</Label>
            <p className="text-sm text-muted-foreground mt-1">
              {sessions?.length === 1 
                ? 'Solo tienes una sesión activa (esta)'
                : `Tienes ${sessions?.length || 0} sesiones activas`
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
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => revokeOthersMutation.mutate()}
                    disabled={revokeOthersMutation.isPending}
                  >
                    {revokeOthersMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        Cerrando...
                      </>
                    ) : (
                      'Confirmar'
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
                    className="text-destructive hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar otras sesiones
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
                    "flex items-center justify-between p-4 rounded-lg border transition-colors",
                    session.isCurrent 
                      ? "bg-primary/5 border-primary/20" 
                      : "bg-muted/30 hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("p-2.5 rounded-lg", colorClasses)}>
                      <DeviceIcon className="h-5 w-5" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {session.deviceName || `${session.browser || 'Navegador'} en ${session.os}`}
                        </span>
                        {session.isCurrent && (
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            <CheckCircle2 className="h-3 w-3" />
                            Sesión actual
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
            <Shield className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Consejos de seguridad</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Si ves una sesión que no reconoces, revócala inmediatamente</li>
              <li>• Cierra las sesiones en dispositivos públicos o compartidos</li>
              <li>• Cambia tu contraseña si sospechas acceso no autorizado</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
