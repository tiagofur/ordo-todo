"use client";

import { AppLayout } from "@/components/shared/app-layout";
import { MeetingAnalyzer } from "@/components/meetings/meeting-analyzer";
import { MessageSquare, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function MeetingsPage() {
  const accentColor = "#8b5cf6"; // Purple

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl mx-auto space-y-6 pb-10"
      >
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
            <div
              className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl text-white shadow-lg"
              style={{
                backgroundColor: accentColor,
                boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
              }}
            >
              <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            AI Meeting Assistant
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Analiza transcripciones de reuniones y extrae action items automáticamente
          </p>
        </div>

        {/* Features callout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { title: "Resumen Inteligente", desc: "Genera un resumen conciso de la reunión" },
            { title: "Action Items", desc: "Extrae tareas con responsables y prioridades" },
            { title: "Decisiones", desc: "Identifica decisiones clave tomadas" },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border bg-card/50 hover:bg-card transition-colors"
            >
              <h3 className="font-medium text-sm">{feature.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Main analyzer */}
        <MeetingAnalyzer />
      </motion.div>
    </AppLayout>
  );
}
