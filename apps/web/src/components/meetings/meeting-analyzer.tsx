"use client";

import { useState, useEffect } from "react";
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
  History,
} from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@ordo-todo/ui";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

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

export function MeetingAnalyzer() {
  const t = useTranslations("Meetings");
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
      // Ignore
    }
  };

  useEffect(() => {
    loadPastMeetings();
  }, []);

  const handleConvertToTasks = async () => {
    if (!analysis?.actionItems || analysis.actionItems.length === 0) {
      toast.error(t("noActionItems"));
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
      toast.success(
        res?.created
          ? `${res.created} ${t("tasksCreated")}`
          : t("tasksCreated")
      );
    } catch (err) {
      toast.error(t("errorConvertingTasks"));
    } finally {
      setIsConverting(false);
    }
  };

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      toast.error(t("pleaseEnterTranscript"));
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await apiClient.analyzeMeetingTranscript(transcript);
      setAnalysis(result);
      toast.success(t("analysisCompleted"));

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
      setError(t("analysisError"));
      toast.error(t("errorTitle"));
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
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(id);
      toast.success(t("copied"));
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (e) {
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
      case "HIGH": return t("priorities.HIGH");
      case "MEDIUM": return t("priorities.MEDIUM");
      case "LOW": return t("priorities.LOW");
      default: return priority;
    }
  };

  const getSentimentLabel = (sentiment: string) => {
    switch (sentiment) {
      case "POSITIVE": return t("sentiments.POSITIVE");
      case "NEUTRAL": return t("sentiments.NEUTRAL");
      case "NEGATIVE": return t("sentiments.NEGATIVE");
      case "MIXED": return t("sentiments.MIXED");
      default: return sentiment;
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2.5 text-base sm:text-lg">
            <MessageSquare className="h-5 w-5 text-violet-500" />
            {t("meetingTranscript")}
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
              <span>History ({pastMeetings.length})</span>
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {showHistory && pastMeetings.length > 0 && (
            <div className="p-3.5 rounded-xl border border-border bg-muted/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground">Saved Meeting Notes</p>
                <span className="text-[10px] text-muted-foreground">Click to load</span>
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
                      toast.info(`Loaded: ${m.title}`);
                    }}
                    className="flex flex-col items-start p-2.5 rounded-lg border border-border bg-card hover:border-violet-500/50 hover:bg-violet-500/5 text-left transition-all"
                  >
                    <span className="text-xs font-medium text-foreground truncate w-full">{m.title}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(m.date).toLocaleDateString()} • {m.analysis?.actionItems?.length || 0} action items
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="relative">
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder={t("transcriptPlaceholder")}
              className="w-full h-60 p-4 rounded-xl border border-border bg-muted/40 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm leading-relaxed"
              disabled={isAnalyzing}
            />
            <div className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-background/80 px-2 py-0.5 rounded-md backdrop-blur-xs border border-border/50">
              {transcript.length} {t("characters")}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Upload className="h-4 w-4" />
              <span>{t("dragFile")}</span>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !transcript.trim()}
                className="gap-2 rounded-xl bg-violet-500 hover:bg-violet-600 text-white shadow-sm shadow-violet-500/25 transition-all duration-200"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("analyzing")}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {t("analyzeWithAi")}
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
                    <p className="text-xl sm:text-2xl font-bold tracking-tight">{analysis.participants.length}</p>
                    <p className="text-xs text-muted-foreground">{t("participants")}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4.5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                    <ListTodo className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold tracking-tight">{analysis.actionItems.length}</p>
                    <p className="text-xs text-muted-foreground">{t("actionItems")}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4.5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold tracking-tight">{analysis.decisions.length}</p>
                    <p className="text-xs text-muted-foreground">{t("decisions")}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4.5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl border", getSentimentStyles(analysis.sentiment))}>
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-bold tracking-tight">{getSentimentLabel(analysis.sentiment)}</p>
                    <p className="text-xs text-muted-foreground">{t("sentiment")}</p>
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
                className="w-full p-4.5 flex items-center justify-between hover:bg-muted/40 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="h-5 w-5 text-violet-500" />
                  <span className="font-semibold text-base">{t("summary")}</span>
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
                          <h4 className="text-sm font-semibold mb-2.5">{t("keyPoints")}:</h4>
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
                                <li key={idx} className="flex items-start gap-2.5 text-sm">
                                  <div className="mt-2 h-1.5 w-1.5 rounded-full bg-violet-500 flex-shrink-0" />
                                  <span className="text-muted-foreground leading-normal">{pointText}</span>
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
                className="w-full p-4.5 flex items-center justify-between hover:bg-muted/40 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <ListTodo className="h-5 w-5 text-violet-500" />
                  <span className="font-semibold text-base">{t("actionItems")}</span>
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
                              <p className="text-sm font-medium leading-snug">{actionTitle}</p>
                              {item.description && (
                                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
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
                              aria-label={t("copy")}
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-lg hover:bg-muted"
                              onClick={() => copyToClipboard(actionTitle, `action-${idx}`)}
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
                        className="w-full mt-3 rounded-xl border border-border bg-card hover:bg-muted/60 text-foreground transition-all duration-200"
                        variant="outline"
                        disabled={isConverting}
                        onClick={handleConvertToTasks}
                      >
                        <ListTodo className="h-4 w-4 mr-2 text-violet-500" />
                        {isConverting ? t("converting") || "Converting..." : t("convertToTasks")}
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
                  className="w-full p-4.5 flex items-center justify-between hover:bg-muted/40 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <span className="font-semibold text-base">{t("decisions")}</span>
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
                            typeof decisionItem === "object" ? decisionItem.madeBy : undefined;
                          const context =
                            typeof decisionItem === "object" ? decisionItem.context : undefined;

                          return (
                            <div
                              key={idx}
                              className="p-3.5 rounded-xl border border-border/80 bg-muted/20"
                            >
                              <p className="text-sm font-medium leading-snug">{decisionText}</p>
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
                  className="w-full p-4.5 flex items-center justify-between hover:bg-muted/40 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span className="font-semibold text-base">{t("participants")}</span>
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
                              typeof pItem === "string" ? pItem : pItem.name || "";
                            const role =
                              typeof pItem === "object" ? pItem.role : undefined;

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
  );
}

