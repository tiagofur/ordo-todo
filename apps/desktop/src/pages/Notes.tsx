import { useState, useMemo, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  StickyNote,
  Plus,
  Search,
  X,
  LayoutGrid,
  Move,
  RotateCcw,
  Trash2,
  Check,
  Palette,
} from "lucide-react";
import { PageTransition, SlideIn, FadeIn } from "@/components/motion";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@ordo-todo/ui";
import { useWorkspaceStore } from "@/stores/workspace-store";
import {
  useNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  useWorkspace,
  useWorkspaces,
} from "@/hooks/api";
import { NoteBoard } from "@/components/notes/NoteBoard";
import { toast } from "sonner";
import type { Note } from "@ordo-todo/api-client";

// Post-it palette with real Apple / 3M paper tones
export const NOTE_PALETTE = [
  {
    id: "yellow",
    name: "Amarillo",
    bg: "#FEF08A",
    border: "#FDE047",
    text: "#713F12",
  },
  {
    id: "orange",
    name: "Naranja",
    bg: "#FED7AA",
    border: "#FDBA74",
    text: "#9A3412",
  },
  {
    id: "pink",
    name: "Rosa",
    bg: "#FBCFE8",
    border: "#F472B6",
    text: "#9D174D",
  },
  {
    id: "green",
    name: "Verde",
    bg: "#BBF7D0",
    border: "#86EFAC",
    text: "#166534",
  },
  {
    id: "blue",
    name: "Azul",
    bg: "#BAE6FD",
    border: "#7DD3FC",
    text: "#075985",
  },
  {
    id: "purple",
    name: "Morado",
    bg: "#E9D5FF",
    border: "#D8B4FE",
    text: "#6B21A8",
  },
] as const;

interface NoteCardProps {
  note: Note;
  onUpdate: (id: string, data: { content?: string; color?: string }) => void;
  onDelete: (id: string) => void;
}

function GridNoteCard({ note, onUpdate, onDelete }: NoteCardProps) {
  const [content, setContent] = useState(note.content || "");
  const [isSaved, setIsSaved] = useState(true);
  const [showPalette, setShowPalette] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setContent(note.content || "");
  }, [note.content]);

  const handleChange = (newText: string) => {
    setContent(newText);
    setIsSaved(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onUpdate(note.id, { content: newText });
      setIsSaved(true);
    }, 400);
  };

  const handleColorChange = (newColor: string) => {
    onUpdate(note.id, { color: newColor });
    setShowPalette(false);
  };

  const currentColor = note.color || NOTE_PALETTE[0].bg;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col justify-between rounded-2xl p-4 transition-all duration-200 min-h-[220px] shadow-xs hover:shadow-md border border-black/5 dark:border-white/10"
      style={{ backgroundColor: currentColor }}
    >
      {/* Post-it Header: Color controls & Delete */}
      <div className="flex items-center justify-between gap-2 pb-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPalette((prev) => !prev)}
            className="flex items-center gap-1 p-1 rounded-lg text-neutral-700/70 hover:text-neutral-900 hover:bg-black/5 transition-colors cursor-pointer"
            title="Cambiar color del post-it"
            aria-label="Cambiar color del post-it"
          >
            <Palette className="h-3.5 w-3.5" />
          </button>

          {showPalette && (
            <div className="absolute left-0 top-full mt-1 flex items-center gap-1.5 p-1.5 rounded-xl bg-card border border-border/70 shadow-lg z-20">
              {NOTE_PALETTE.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleColorChange(p.bg)}
                  className="h-5 w-5 rounded-full border border-black/10 hover:scale-115 transition-transform cursor-pointer"
                  style={{ backgroundColor: p.bg }}
                  title={p.name}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Saved indicator */}
          <span
            className={cn(
              "text-[10px] font-medium transition-opacity text-neutral-600/70",
              isSaved ? "opacity-60" : "opacity-100 font-semibold",
            )}
          >
            {isSaved ? "Guardado" : "Escribiendo..."}
          </span>

          <button
            type="button"
            onClick={() => onDelete(note.id)}
            className="p-1 rounded-lg text-neutral-600/60 hover:text-red-600 hover:bg-black/5 transition-colors cursor-pointer"
            title="Eliminar post-it"
            aria-label="Eliminar post-it"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Post-it Content Textarea */}
      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Escribe un recordatorio o idea rápida..."
        className="flex-1 w-full bg-transparent resize-none border-none focus:outline-none text-sm text-neutral-900 font-medium placeholder:text-neutral-600/60 leading-relaxed"
      />

      {/* Post-it Footer: subtle char count */}
      <div className="pt-2 text-[10px] text-neutral-600/60 font-mono text-right tabular-nums">
        {content.length} caracteres
      </div>
    </motion.div>
  );
}

export function Notes() {
  const { t } = (useTranslation as any)();
  const { selectedWorkspaceId, setSelectedWorkspaceId } = useWorkspaceStore();
  const { data: workspaces = [] } = useWorkspaces();

  // Effective workspace ID (auto-fallback if not yet stored)
  const effectiveWorkspaceId =
    selectedWorkspaceId || (workspaces as any)[0]?.id || "";

  useEffect(() => {
    if (!selectedWorkspaceId && (workspaces as any).length > 0) {
      setSelectedWorkspaceId((workspaces as any)[0].id);
    }
  }, [selectedWorkspaceId, workspaces, setSelectedWorkspaceId]);

  const { data: workspace } = useWorkspace(effectiveWorkspaceId || "");
  const { data: notesData, isLoading } = useNotes(effectiveWorkspaceId || "");

  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const [searchQuery, setSearchQuery] = useState("");
  const [colorFilter, setColorFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "canvas">("grid");

  const notes: Note[] = useMemo(
    () => (Array.isArray(notesData) ? notesData : []),
    [notesData],
  );

  // Live KPI Summary
  const stats = useMemo(() => {
    const total = notes.length;
    const uniqueColors = new Set(notes.map((n) => n.color)).size;
    const totalChars = notes.reduce(
      (acc, n) => acc + (n.content?.length || 0),
      0,
    );
    return { total, uniqueColors, totalChars };
  }, [notes]);

  // Filtering
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesContent = note.content?.toLowerCase().includes(q);
        if (!matchesContent) return false;
      }

      // 2. Color Filter
      if (colorFilter !== "all") {
        if (note.color?.toLowerCase() !== colorFilter.toLowerCase())
          return false;
      }

      return true;
    });
  }, [notes, searchQuery, colorFilter]);

  const hasActiveFilters = searchQuery.trim() !== "" || colorFilter !== "all";

  const handleAddNote = (colorOverride?: string) => {
    const targetWorkspaceId = effectiveWorkspaceId;
    if (!targetWorkspaceId) {
      toast.error(
        t("Notes.noWorkspace", "Selecciona un espacio de trabajo primero."),
      );
      return;
    }

    const noteColor = colorOverride || NOTE_PALETTE[0].bg;

    createNote.mutate(
      {
        workspaceId: targetWorkspaceId,
        content: "Nueva nota",
        x: 100 + Math.random() * 80,
        y: 100 + Math.random() * 80,
        color: noteColor,
        width: 300,
        height: 300,
      },
      {
        onSuccess: () => {
          toast.success(t("Notes.toast.created", "Nota creada"));
        },
        onError: (err: any) => {
          const msg =
            err?.response?.data?.message ||
            err?.message ||
            t("Notes.toast.error", "Error al crear nota");
          toast.error(typeof msg === "string" ? msg : JSON.stringify(msg));
        },
      },
    );
  };

  const handleUpdateNote = (
    id: string,
    data: { content?: string; color?: string },
  ) => {
    updateNote.mutate({ id, data });
  };

  const handleDeleteNote = (id: string) => {
    deleteNote.mutate(id, {
      onSuccess: () => {
        toast.success(t("Notes.toast.deleted", "Nota eliminada"));
      },
    });
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header - Apple Style Unified Pattern (matching Tasks, Projects, Calendar & Habits) */}
        <SlideIn direction="top">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3 sm:gap-3.5">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-sm shadow-emerald-700/25 shrink-0">
                <StickyNote className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground m-0 leading-tight flex items-center gap-2">
                  <span>{t("Notes.title", "Notas Rápidas")}</span>
                  {workspace?.name && (
                    <span className="text-muted-foreground text-xs sm:text-sm font-normal">
                      — {workspace.name}
                    </span>
                  )}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                  {t(
                    "Notes.subtitle",
                    "Post-its y recordatorios ágiles para tus ideas sueltas",
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Live KPI Summary Pill */}
              {selectedWorkspaceId && (
                <div className="hidden md:flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground tabular-nums">
                  <span className="h-2 w-2 rounded-full bg-emerald-700" />
                  <span>Total:</span>
                  <span className="font-bold text-foreground">
                    {stats.total}
                  </span>
                  <span className="text-border">|</span>
                  <span>Colores:</span>
                  <span className="font-bold text-foreground">
                    {stats.uniqueColors}
                  </span>
                </div>
              )}

              {/* Color Quick-Add CTA */}
              <button
                type="button"
                onClick={() => handleAddNote()}
                disabled={!selectedWorkspaceId || createNote.isPending}
                className="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-emerald-700/25 transition-all duration-200 hover:bg-emerald-800 hover:scale-[1.02] cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>{t("Notes.add", "Nueva Nota")}</span>
              </button>
            </div>
          </div>
        </SlideIn>

        {/* Workspace Not Selected State */}
        {!selectedWorkspaceId ? (
          <FadeIn delay={0.1}>
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border border-dashed border-border/60 bg-card/40">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-4">
                <StickyNote className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">
                {t("Notes.noWorkspace", "Selecciona un espacio de trabajo")}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {t(
                  "Notes.noWorkspaceDesc",
                  "Las notas pertenecen a un espacio de trabajo. Por favor selecciona uno en el menú lateral para ver tus notas.",
                )}
              </p>
            </div>
          </FadeIn>
        ) : (
          <>
            {/* Row 2: Apple Standard Toolbar */}
            {notes.length > 0 && (
              <SlideIn direction="top">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                  {/* Search Bar */}
                  <div className="relative w-full lg:w-72 2xl:w-80 min-w-[220px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar en notas..."
                      className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-border/60 bg-card placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                        aria-label="Limpiar búsqueda"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Color Filter Tabs & View Toggle */}
                  <div className="flex items-center gap-2.5 justify-between lg:justify-end flex-wrap sm:flex-nowrap">
                    {/* Color Selector Pills */}
                    <div className="flex items-center gap-1.5 rounded-xl bg-muted/60 p-1 border border-border/40 shrink-0">
                      <button
                        type="button"
                        onClick={() => setColorFilter("all")}
                        className={cn(
                          "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                          colorFilter === "all"
                            ? "bg-background text-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        Todas
                      </button>

                      {NOTE_PALETTE.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() =>
                            setColorFilter(colorFilter === p.bg ? "all" : p.bg)
                          }
                          className={cn(
                            "h-5 w-5 rounded-full border border-black/10 transition-transform cursor-pointer relative",
                            colorFilter === p.bg
                              ? "scale-120 ring-2 ring-primary ring-offset-1"
                              : "hover:scale-110",
                          )}
                          style={{ backgroundColor: p.bg }}
                          title={p.name}
                          aria-label={`Filtrar por ${p.name}`}
                        >
                          {colorFilter === p.bg && (
                            <Check className="h-3 w-3 text-neutral-800 absolute inset-0 m-auto" />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* View Switcher: Grid vs Canvas */}
                    <div className="flex items-center rounded-xl bg-muted/60 p-1 border border-border/40 shrink-0">
                      <button
                        type="button"
                        onClick={() => setViewMode("grid")}
                        className={cn(
                          "px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                          viewMode === "grid"
                            ? "bg-background text-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                        title="Cuadrícula de Post-its"
                        aria-label="Cuadrícula"
                      >
                        <LayoutGrid className="h-4 w-4" />
                        <span className="hidden sm:inline">Muro</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("canvas")}
                        className={cn(
                          "px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                          viewMode === "canvas"
                            ? "bg-background text-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                        title="Pizarra Libre (Drag & Drop)"
                        aria-label="Pizarra"
                      >
                        <Move className="h-4 w-4" />
                        <span className="hidden sm:inline">Pizarra</span>
                      </button>
                    </div>
                  </div>
                </div>
              </SlideIn>
            )}

            {/* Content Body */}
            {isLoading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-52 rounded-2xl border border-border/60 bg-card/60 animate-pulse"
                  />
                ))}
              </div>
            ) : notes.length === 0 ? (
              /* Zero Notes Initial State */
              <FadeIn delay={0.1}>
                <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-border/70 bg-card/40 p-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-4">
                    <StickyNote className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    {t("Notes.noNotes", "Tu tablero de notas está vacío")}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mb-6">
                    Crea tu primer post-it para recordar ideas rápidas, apuntes
                    de reuniones o pensamientos sueltos.
                  </p>

                  {/* Quick color starter buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {NOTE_PALETTE.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleAddNote(p.bg)}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs hover:scale-105 transition-all cursor-pointer border border-black/10"
                        style={{ backgroundColor: p.bg, color: p.text }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ) : filteredNotes.length === 0 ? (
              /* No matches for active search/filters */
              <FadeIn delay={0.1}>
                <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-border/70 bg-card/40 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-3">
                    <Search className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">
                    No se encontraron notas
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mb-4">
                    No hay post-its que coincidan con la búsqueda o el color
                    seleccionado.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setColorFilter("all");
                    }}
                    className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3.5 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Limpiar filtros</span>
                  </button>
                </div>
              </FadeIn>
            ) : viewMode === "grid" ? (
              /* Grid / Wall Mode: Clean Apple Masonry Wall of Post-its */
              <FadeIn delay={0.1}>
                <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  <AnimatePresence mode="popLayout">
                    {filteredNotes.map((note) => (
                      <GridNoteCard
                        key={note.id}
                        note={note}
                        onUpdate={handleUpdateNote}
                        onDelete={handleDeleteNote}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </FadeIn>
            ) : (
              /* Canvas / Pizarra Mode: Drag & Drop Freeform Canvas */
              <FadeIn delay={0.1}>
                <div className="relative w-full h-[650px] rounded-2xl border border-border/60 overflow-hidden bg-dot-pattern shadow-xs">
                  <NoteBoard
                    workspaceId={effectiveWorkspaceId}
                    notes={filteredNotes}
                    hideAddButton
                  />
                </div>
              </FadeIn>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
}
