import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  MessageSquare,
  Sparkles,
  Upload,
  Loader2,
  FileText,
  Users,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ListTodo,
  Clock,
  Copy,
  Check,
  History,
  ArrowRight,
} from "lucide-react";
import { PageTransition, SlideIn } from "@/components/motion";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@ordo-todo/ui";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useWorkspaces } from "@/lib/shared-hooks";
import { apiClient } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ActionItem {
  action?: string;
  title?: string;
  description?: string;
  assignee?: string;
  priority: "HIGH" | "MEDIUM" | "LOW" | "URGENT";
  dueDate?: string;
  context?: string;
}

interface Decision {
  decision: string;
  madeBy?: string;
  context?: string;
  participants?: string[];
}

interface Participant {
  name: string;
  role?: string;
  speakingTime?: number;
}

interface Topic {
  topic: string;
  duration?: number;
  summary?: string;
}

interface MeetingAnalysis {
  summary: string;
  keyPoints: string[];
  actionItems: ActionItem[];
  decisions: (Decision | string)[];
  participants: (Participant | string)[];
  duration?: string;
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "MIXED";
  topics: (Topic | string)[];
}

export function Meetings() {
  const { t } = (useTranslation as any)();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { selectedWorkspaceId, setSelectedWorkspaceId } = useWorkspaceStore();
  const { data: workspaces = [] } = useWorkspaces();

  const activeWorkspaceId =
    selectedWorkspaceId || (workspaces.length > 0 ? workspaces[0].id : null);

  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspaceId) {
      setSelectedWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, selectedWorkspaceId, setSelectedWorkspaceId]);

  const [transcript, setTranscript] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [analysis, setAnalysis] = useState<MeetingAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["summary", "actionItems"])
  );
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [pastMeetings, setPastMeetings] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const loadPastMeetings = async () => {
    try {
      const meetings = await apiClient.getMeetings({ limit: 8 });
      setPastMeetings(meetings || []);
    } catch {
      // Ignore background load error
    }
  };

  useEffect(() => {
    loadPastMeetings();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setTranscript(content);
        toast.success(`Archivo "${file.name}" cargado`);
      }
    };
    reader.onerror = () => {
      toast.error("Error al leer el archivo");
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.type.includes("text") || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setTranscript(content);
          toast.success(`Archivo "${file.name}" cargado`);
        }
      };
      reader.readAsText(file);
    } else {
      toast.error("Por favor arrastra un archivo de texto (.txt o .md)");
    }
  };

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      toast.error(t("Meetings.pleaseEnterTranscript") || "Por favor ingresa una transcripción");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await apiClient.analyzeMeetingTranscript(transcript);
      setAnalysis(result);
      toast.success(t("Meetings.analysisCompleted") || "Análisis completado");

      // Auto-save meeting note to database
      try {
        const titleMatch = transcript.trim().match(/^([^\n]+)/);
        const title = titleMatch ? titleMatch[1].slice(0, 80) : "Meeting Analysis";
        await apiClient.saveMeeting({
          title,
          date: new Date().toISOString(),
          duration: 30,
          transcript,
          analysis: result,
        });
        loadPastMeetings();
      } catch (saveErr) {
        console.warn("Failed to persist meeting record:", saveErr);
      }
    } catch (err) {
      console.error("Failed to analyze meeting:", err);
      setError(
        t("Meetings.analysisError") ||
          "Error al analizar la transcripción. Inténtalo de nuevo."
      );
      toast.error(t("Meetings.errorTitle") || "Error al analizar");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConvertToTasks = async () => {
    if (!analysis?.actionItems || analysis.actionItems.length === 0) {
      toast.error(t("Meetings.noActionItems") || "No se encontraron action items");
      return;
    }

    setIsConverting(true);
    try {
      const itemsToConvert = analysis.actionItems.map((item) => ({
        title: item.title || item.action || "Untitled Task",
        description: item.description,
        assignee: item.assignee,
        priority: item.priority || "MEDIUM",
        dueDate: item.dueDate,
        context: item.context || "",
      }));

      const res = await apiClient.convertActionsToTasks(itemsToConvert);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(
        res?.created
          ? `${res.created} tareas creadas`
          : t("Meetings.tasksCreated") || "Tareas creadas exitosamente"
      );
    } catch {
      toast.error(t("Meetings.errorConvertingTasks") || "Error al convertir notas a tareas");
    } finally {
      setIsConverting(false);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(id);
      toast.success(t("Meetings.copied") || "Copiado al portapapeles");
      setTimeout(() => setCopiedItem(null), 2000);
    } catch {
      // Ignore clipboard error
    }
  };

  const getSentimentStyles = (sentiment: string) => {
    switch (sentiment) {
      case "POSITIVE":
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "NEGATIVE":
        return "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20";
      case "MIXED":
        return "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20";
      default:
        return "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
      case "HIGH":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      default:
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "Urgente";
      case "HIGH":
        return t("Meetings.priorities.HIGH") || "Alta";
      case "MEDIUM":
        return t("Meetings.priorities.MEDIUM") || "Media";
      case "LOW":
        return t("Meetings.priorities.LOW") || "Baja";
      default:
        return priority;
    }
  };

  const getSentimentLabel = (sentiment: string) => {
    switch (sentiment) {
      case "POSITIVE":
        return t("Meetings.sentiments.POSITIVE") || "Positivo";
      case "NEUTRAL":
        return t("Meetings.sentiments.NEUTRAL") || "Neutral";
      case "NEGATIVE":
        return t("Meetings.sentiments.NEGATIVE") || "Negativo";
      case "MIXED":
        return t("Meetings.sentiments.MIXED") || "Mixto";
      default:
        return sentiment;
    }
  };

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        {/* Apple Style Unified Header */}
        <SlideIn direction="top">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-purple-500 text-white shadow-sm shadow-purple-500/25 shrink-0">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground m-0 leading-tight truncate">
                  {t("Meetings.title") || "Asistente de Reuniones"}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                  <span>
                    {t("Meetings.subtitle") ||
                      "Analiza transcripciones y extrae action items automáticamente"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {/* Workspace Selector */}
              {workspaces.length > 0 && (
                <div className="relative inline-flex items-center">
                  <select
                    aria-label="Seleccionar espacio de trabajo"
                    value={activeWorkspaceId || ""}
                    onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                    className="appearance-none bg-card border border-border/60 rounded-xl pl-3 pr-8 py-2 text-sm font-medium text-foreground hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-colors cursor-pointer shadow-xs"
                  >
                    {workspaces.map((ws: any) => (
                      <option key={ws.id} value={ws.id}>
                        {ws.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="h-4 w-4 text-muted-foreground absolute right-2.5 pointer-events-none" />
                </div>
              )}
            </div>
          </div>
        </SlideIn>

        {/* 4 Apple-grade KPI Feature Cards with Micro-Halo Hover Effects */}
        <SlideIn direction="top" delay={0.1}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: Resumen Inteligente */}
            <div
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#a855f770";
                e.currentTarget.style.boxShadow =
                  "0 10px 25px -5px rgba(168, 85, 247, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {t("Meetings.featureSummaryTitle") || "Resumen Inteligente"}
                </span>
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 transition-transform duration-300 group-hover:scale-110">
                  <FileText className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </div>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-foreground/90 font-semibold leading-snug">
                {t("Meetings.featureSummaryDesc") ||
                  "Genera un resumen conciso de la reunión"}
              </p>
            </div>

            {/* Card 2: Action Items */}
            <div
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#3b82f670";
                e.currentTarget.style.boxShadow =
                  "0 10px 25px -5px rgba(59, 130, 246, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {t("Meetings.featureActionItemsTitle") || "Action Items"}
                </span>
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 transition-transform duration-300 group-hover:scale-110">
                  <ListTodo className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </div>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-foreground/90 font-semibold leading-snug">
                {t("Meetings.featureActionItemsDesc") ||
                  "Extrae tareas con responsables y prioridades"}
              </p>
            </div>

            {/* Card 3: Decisiones */}
            <div
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#10b98170";
                e.currentTarget.style.boxShadow =
                  "0 10px 25px -5px rgba(16, 185, 129, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {t("Meetings.featureDecisionsTitle") || "Decisiones"}
                </span>
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 transition-transform duration-300 group-hover:scale-110">
                  <CheckCircle2 className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </div>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-foreground/90 font-semibold leading-snug">
                {t("Meetings.featureDecisionsDesc") ||
                  "Identifica decisiones clave tomadas"}
              </p>
            </div>

            {/* Card 4: Conversión a Tareas */}
            <div
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#f59e0b70";
                e.currentTarget.style.boxShadow =
                  "0 10px 25px -5px rgba(245, 158, 11, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {t("Meetings.convertToTasks") || "Convertir a Tareas"}
                </span>
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 transition-transform duration-300 group-hover:scale-110">
                  <ArrowRight className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </div>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-foreground/90 font-semibold leading-snug">
                Crea tareas reales con un solo clic
              </p>
            </div>
          </div>
        </SlideIn>

        {/* Input & Analyzer Section */}
        <SlideIn direction="top" delay={0.2}>
          <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2.5 text-base sm:text-lg">
                <MessageSquare className="h-5 w-5 text-violet-500" />
                {t("Meetings.meetingTranscript") || "Transcripción de la Reunión"}
              </CardTitle>
              {pastMeetings.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-xs gap-1.5 h-8 text-muted-foreground hover:text-foreground rounded-xl"
                >
                  <History className="h-3.5 w-3.5 text-violet-500" />
                  <span>Historial ({pastMeetings.length})</span>
                </Button>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {showHistory && pastMeetings.length > 0 && (
                <div className="p-3.5 rounded-xl border border-border bg-muted/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Notas de Reuniones Guardadas
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      Haz clic para cargar
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {pastMeetings.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setTranscript(m.transcript || "");
                          if (m.analysis) setAnalysis(m.analysis);
                          setShowHistory(false);
                          toast.info(`Cargado: ${m.title}`);
                        }}
                        className="flex flex-col items-start p-2.5 rounded-lg border border-border bg-card hover:border-violet-500/50 hover:bg-violet-500/5 text-left transition-all cursor-pointer"
                      >
                        <span className="text-xs font-medium text-foreground truncate w-full">
                          {m.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(m.date).toLocaleDateString()} •{" "}
                          {m.analysis?.actionItems?.length || 0} action items
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div
                className="relative"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder={
                    t("Meetings.transcriptPlaceholder") ||
                    "Pega aquí la transcripción de tu reunión...\n\nEjemplo:\nJuan: Buenos días a todos, empecemos con la revisión del proyecto.\nMaría: Sí, tenemos que definir las fechas de entrega para la próxima semana.\nPedro: Propongo que el diseño esté listo para el viernes.\nJuan: Perfecto, María se encargará de la revisión final."
                  }
                  className="w-full h-60 p-4 rounded-xl border border-border bg-muted/40 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm leading-relaxed"
                  disabled={isAnalyzing}
                />
                <div className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-background/80 px-2 py-0.5 rounded-md backdrop-blur-xs border border-border/50">
                  {transcript.length}{" "}
                  {t("Meetings.characters") || "caracteres"}
                </div>
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt,.md"
                className="hidden"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-left"
                >
                  <Upload className="h-4 w-4 text-violet-500 shrink-0" />
                  <span>
                    {t("Meetings.dragFile") || "O arrastra / sube un archivo .txt aquí"}
                  </span>
                </button>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !transcript.trim()}
                    className="gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-500/25 transition-all duration-200 cursor-pointer"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("Meetings.analyzing") || "Analizando..."}
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        {t("Meetings.analyzeWithAi") || "Analizar con IA"}
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </SlideIn>

        {/* Results Section */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-4"
            >
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
                <div className="rounded-2xl border border-border bg-card p-4.5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold tracking-tight">
                        {analysis.participants.length}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("Meetings.participants") || "Participantes"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4.5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                      <ListTodo className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold tracking-tight">
                        {analysis.actionItems.length}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("Meetings.actionItems") || "Action Items"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4.5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold tracking-tight">
                        {analysis.decisions.length}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("Meetings.decisions") || "Decisiones"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4.5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl border",
                        getSentimentStyles(analysis.sentiment)
                      )}
                    >
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-bold tracking-tight">
                        {getSentimentLabel(analysis.sentiment)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("Meetings.sentiment") || "Sentimiento"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <button
                  type="button"
                  aria-expanded={expandedSections.has("summary")}
                  onClick={() => toggleSection("summary")}
                  className="w-full p-4.5 flex items-center justify-between hover:bg-muted/40 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-5 w-5 text-violet-500" />
                    <span className="font-semibold text-base">
                      {t("Meetings.summary") || "Resumen"}
                    </span>
                  </div>
                  {expandedSections.has("summary") ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedSections.has("summary") && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4.5 pt-0 space-y-4">
                        <p className="text-sm leading-relaxed text-foreground/90">
                          {typeof analysis.summary === "string"
                            ? analysis.summary
                            : (analysis.summary as any)?.text ||
                              (analysis.summary as any)?.summary ||
                              String(analysis.summary)}
                        </p>

                        {analysis.keyPoints.length > 0 && (
                          <div className="pt-4 border-t border-border/80">
                            <h4 className="text-sm font-semibold mb-2.5">
                              {t("Meetings.keyPoints") || "Puntos Clave"}:
                            </h4>
                            <ul className="space-y-2">
                              {analysis.keyPoints.map((point, idx) => {
                                const pointText =
                                  typeof point === "string"
                                    ? point
                                    : (point as any)?.point ||
                                      (point as any)?.text ||
                                      (point as any)?.keyPoint ||
                                      JSON.stringify(point);
                                return (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-2.5 text-sm"
                                  >
                                    <div className="mt-2 h-1.5 w-1.5 rounded-full bg-violet-500 flex-shrink-0" />
                                    <span className="text-muted-foreground leading-normal">
                                      {pointText}
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}

                        {analysis.topics.length > 0 && (
                          <div className="pt-2 flex flex-wrap gap-2">
                            {analysis.topics.map((tItem, idx) => {
                              const topicLabel =
                                typeof tItem === "string"
                                  ? tItem
                                  : tItem.topic || tItem.summary || "";
                              return (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 text-xs font-medium"
                                >
                                  {topicLabel}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Items */}
              <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <button
                  type="button"
                  aria-expanded={expandedSections.has("actionItems")}
                  onClick={() => toggleSection("actionItems")}
                  className="w-full p-4.5 flex items-center justify-between hover:bg-muted/40 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <ListTodo className="h-5 w-5 text-violet-500" />
                    <span className="font-semibold text-base">
                      {t("Meetings.actionItems") || "Action Items"}
                    </span>
                    <span className="text-xs bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-full font-medium">
                      {analysis.actionItems.length}
                    </span>
                  </div>
                  {expandedSections.has("actionItems") ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedSections.has("actionItems") && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4.5 pt-0 space-y-3">
                        {analysis.actionItems.map((item, idx) => {
                          const actionTitle = item.title || item.action || "";
                          return (
                            <div
                              key={idx}
                              className="flex items-start gap-3 p-3.5 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors group"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium leading-snug">
                                  {actionTitle}
                                </p>
                                {item.description && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {item.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                                  {item.assignee && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                      <Users className="h-3.5 w-3.5" />
                                      {item.assignee}
                                    </span>
                                  )}
                                  {item.dueDate && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                      <Clock className="h-3.5 w-3.5" />
                                      {item.dueDate}
                                    </span>
                                  )}
                                  <span
                                    className={cn(
                                      "text-xs px-2.5 py-0.5 rounded-md border font-medium",
                                      getPriorityBadge(item.priority)
                                    )}
                                  >
                                    {getPriorityLabel(item.priority)}
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                aria-label="Copiar"
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-lg hover:bg-muted cursor-pointer"
                                onClick={() =>
                                  copyToClipboard(actionTitle, `action-${idx}`)
                                }
                              >
                                {copiedItem === `action-${idx}` ? (
                                  <Check className="h-4 w-4 text-emerald-500" />
                                ) : (
                                  <Copy className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          );
                        })}

                        <Button
                          className="w-full mt-3 rounded-xl border border-border bg-card hover:bg-muted/60 text-foreground transition-all duration-200 cursor-pointer"
                          variant="outline"
                          disabled={isConverting}
                          onClick={handleConvertToTasks}
                        >
                          <ListTodo className="h-4 w-4 mr-2 text-violet-500" />
                          {isConverting
                            ? t("Meetings.converting") || "Convirtiendo..."
                            : t("Meetings.convertToTasks") || "Convertir a Tareas"}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Decisions */}
              {analysis.decisions.length > 0 && (
                <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                  <button
                    type="button"
                    aria-expanded={expandedSections.has("decisions")}
                    onClick={() => toggleSection("decisions")}
                    className="w-full p-4.5 flex items-center justify-between hover:bg-muted/40 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <span className="font-semibold text-base">
                        {t("Meetings.decisions") || "Decisiones"}
                      </span>
                      <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                        {analysis.decisions.length}
                      </span>
                    </div>
                    {expandedSections.has("decisions") ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedSections.has("decisions") && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4.5 pt-0 space-y-3">
                          {analysis.decisions.map((decisionItem, idx) => {
                            const decisionText =
                              typeof decisionItem === "string"
                                ? decisionItem
                                : decisionItem.decision || "";
                            const madeBy =
                              typeof decisionItem === "object"
                                ? decisionItem.madeBy
                                : undefined;
                            const context =
                              typeof decisionItem === "object"
                                ? decisionItem.context
                                : undefined;

                            return (
                              <div
                                key={idx}
                                className="p-3.5 rounded-xl border border-border/80 bg-muted/20"
                              >
                                <p className="text-sm font-medium leading-snug">
                                  {decisionText}
                                </p>
                                {(madeBy || context) && (
                                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                                    {madeBy && (
                                      <span className="flex items-center gap-1.5">
                                        <Users className="h-3.5 w-3.5" />
                                        {madeBy}
                                      </span>
                                    )}
                                    {context && (
                                      <span className="italic">"{context}"</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Participants */}
              {analysis.participants.length > 0 && (
                <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                  <button
                    type="button"
                    aria-expanded={expandedSections.has("participants")}
                    onClick={() => toggleSection("participants")}
                    className="w-full p-4.5 flex items-center justify-between hover:bg-muted/40 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="h-5 w-5 text-blue-500" />
                      <span className="font-semibold text-base">
                        {t("Meetings.participants") || "Participantes"}
                      </span>
                    </div>
                    {expandedSections.has("participants") ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedSections.has("participants") && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4.5 pt-0">
                          <div className="flex flex-wrap gap-2.5">
                            {analysis.participants.map((pItem, idx) => {
                              const name =
                                typeof pItem === "string"
                                  ? pItem
                                  : pItem.name || "";
                              const role =
                                typeof pItem === "object"
                                  ? pItem.role
                                  : undefined;

                              return (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/60 border border-border/80"
                                >
                                  <div className="h-6 w-6 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center text-xs font-semibold">
                                    {name[0]?.toUpperCase() || "?"}
                                  </div>
                                  <span className="text-xs sm:text-sm font-medium text-foreground">
                                    {name}
                                    {role && (
                                      <span className="text-muted-foreground font-normal ml-1">
                                        ({role})
                                      </span>
                                    )}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
