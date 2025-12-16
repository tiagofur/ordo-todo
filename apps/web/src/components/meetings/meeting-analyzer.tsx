"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Upload,
  Sparkles,
  Loader2,
  FileText,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  ListTodo,
  Copy,
  Check,
} from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@ordo-todo/ui";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

interface ActionItem {
  action: string;
  assignee?: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  dueDate?: string;
}

interface Decision {
  decision: string;
  madeBy?: string;
  context?: string;
}

interface MeetingAnalysis {
  summary: string;
  keyPoints: string[];
  actionItems: ActionItem[];
  decisions: Decision[];
  participants: string[];
  duration?: string;
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "MIXED";
  topics: string[];
}

export function MeetingAnalyzer() {
  const [transcript, setTranscript] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<MeetingAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["summary", "actionItems"])
  );
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      toast.error("Por favor ingresa una transcripción");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await apiClient.analyzeMeetingTranscript(transcript);
      setAnalysis(result);
      toast.success("Análisis completado");
    } catch (err) {
      console.error("Failed to analyze meeting:", err);
      setError("Error al analizar la transcripción. Inténtalo de nuevo.");
      toast.error("Error al analizar");
    } finally {
      setIsAnalyzing(false);
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
    await navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "POSITIVE":
        return "text-green-500 bg-green-500/10";
      case "NEGATIVE":
        return "text-red-500 bg-red-500/10";
      case "MIXED":
        return "text-yellow-500 bg-yellow-500/10";
      default:
        return "text-blue-500 bg-blue-500/10";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-500/10 text-red-600 border-red-500/30";
      case "MEDIUM":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
      default:
        return "bg-green-500/10 text-green-600 border-green-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Transcripción de la Reunión
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Pega aquí la transcripción de tu reunión...

Ejemplo:
Juan: Buenos días a todos, empecemos con la revisión del proyecto.
María: Sí, tenemos que definir las fechas de entrega para la próxima semana.
Pedro: Propongo que el diseño esté listo para el viernes.
Juan: Perfecto, María se encargará de la revisión final.
..."
              className="w-full h-64 p-4 rounded-xl border bg-muted/30 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-sm"
              disabled={isAnalyzing}
            />
            <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
              {transcript.length} caracteres
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Upload className="h-4 w-4" />
              <span>O arrastra un archivo .txt aquí</span>
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !transcript.trim()}
              className="gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analizar con IA
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{analysis.participants.length}</p>
                    <p className="text-xs text-muted-foreground">Participantes</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <ListTodo className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{analysis.actionItems.length}</p>
                    <p className="text-xs text-muted-foreground">Action Items</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{analysis.decisions.length}</p>
                    <p className="text-xs text-muted-foreground">Decisiones</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", getSentimentColor(analysis.sentiment))}>
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold capitalize">{analysis.sentiment.toLowerCase()}</p>
                    <p className="text-xs text-muted-foreground">Sentimiento</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Summary */}
            <Card>
              <button
                onClick={() => toggleSection("summary")}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors rounded-t-xl"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Resumen</span>
                </div>
                {expandedSections.has("summary") ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
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
                    <CardContent className="pt-0">
                      <p className="text-sm leading-relaxed">{analysis.summary}</p>
                      
                      {analysis.keyPoints.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <h4 className="text-sm font-medium mb-2">Puntos Clave:</h4>
                          <ul className="space-y-2">
                            {analysis.keyPoints.map((point, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span className="text-muted-foreground">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {analysis.topics.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {analysis.topics.map((topic, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Action Items */}
            <Card>
              <button
                onClick={() => toggleSection("actionItems")}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors rounded-t-xl"
              >
                <div className="flex items-center gap-2">
                  <ListTodo className="h-5 w-5 text-purple-500" />
                  <span className="font-semibold">Action Items</span>
                  <span className="text-xs bg-purple-500/10 text-purple-600 px-2 py-0.5 rounded-full">
                    {analysis.actionItems.length}
                  </span>
                </div>
                {expandedSections.has("actionItems") ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
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
                    <CardContent className="pt-0 space-y-3">
                      {analysis.actionItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors group"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.action}</p>
                            <div className="flex items-center gap-3 mt-2">
                              {item.assignee && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {item.assignee}
                                </span>
                              )}
                              {item.dueDate && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {item.dueDate}
                                </span>
                              )}
                              <span
                                className={cn(
                                  "text-xs px-2 py-0.5 rounded-full border",
                                  getPriorityColor(item.priority)
                                )}
                              >
                                {item.priority}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                            onClick={() => copyToClipboard(item.action, `action-${idx}`)}
                          >
                            {copiedItem === `action-${idx}` ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                      
                      <Button className="w-full mt-4" variant="outline">
                        <ListTodo className="h-4 w-4 mr-2" />
                        Convertir a Tareas
                      </Button>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Decisions */}
            {analysis.decisions.length > 0 && (
              <Card>
                <button
                  onClick={() => toggleSection("decisions")}
                  className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors rounded-t-xl"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-semibold">Decisiones</span>
                    <span className="text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full">
                      {analysis.decisions.length}
                    </span>
                  </div>
                  {expandedSections.has("decisions") ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
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
                      <CardContent className="pt-0 space-y-3">
                        {analysis.decisions.map((decision, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg border bg-card"
                          >
                            <p className="text-sm font-medium">{decision.decision}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              {decision.madeBy && (
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {decision.madeBy}
                                </span>
                              )}
                              {decision.context && (
                                <span className="italic">"{decision.context}"</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            )}

            {/* Participants */}
            {analysis.participants.length > 0 && (
              <Card>
                <button
                  onClick={() => toggleSection("participants")}
                  className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors rounded-t-xl"
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span className="font-semibold">Participantes</span>
                  </div>
                  {expandedSections.has("participants") ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
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
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-2">
                          {analysis.participants.map((participant, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 px-3 py-2 rounded-full bg-blue-500/10 border border-blue-500/20"
                            >
                              <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                                {participant[0]?.toUpperCase()}
                              </div>
                              <span className="text-sm">{participant}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
