"use client";

import React, { useState, useRef, useEffect } from 'react';
import { AppLayout } from "@/components/shared/app-layout";
import {
  Send,
  User,
  Bot,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  Calendar,
  CheckCircle2,
  Zap,
  Coffee,
  ArrowUp,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const PROMPT_SUGGESTIONS = [
  {
    icon: Calendar,
    color: "#f59e0b",
    title: "Planificar mi día",
    prompt: "¿Cuáles deberían ser mis 3 prioridades clave para hoy y cómo dividirlas en bloques de enfoque?",
  },
  {
    icon: CheckCircle2,
    color: "#06b6d4",
    title: "Triage de tareas",
    prompt: "Revisa mis tareas pendientes y sugiéreme cuál debería abordar primero para maximizar impacto.",
  },
  {
    icon: Zap,
    color: "#8b5cf6",
    title: "Prioridad Eisenhower",
    prompt: "Ayúdame a clasificar mis tareas pendientes entre urgentes e importantes.",
  },
  {
    icon: Coffee,
    color: "#10b981",
    title: "Optimizar descansos",
    prompt: "¿Cómo estructurar mis sesiones de Pomodoro hoy para no sufrir fatiga mental?",
  },
];

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "¡Hola! Soy tu asistente de productividad en Ordo. ¿En qué podemos avanzar hoy? Puedo ayudarte a planificar tu jornada, priorizar tareas o estructurar tus bloques de enfoque.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    toast.success("Mensaje copiado al portapapeles");
    setTimeout(() => {
      setCopiedMessageId(null);
    }, 2000);
  };

  const handleResetConversation = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "¡Hola! Soy tu asistente de productividad en Ordo. ¿En qué podemos avanzar hoy? Puedo ayudarte a planificar tu jornada, priorizar tareas o estructurar tus bloques de enfoque.",
        timestamp: new Date(),
      },
    ]);
    setConversationId(null);
    setInput("");
    toast.success("Nueva conversación iniciada");
  };

  const executeSend = async (messageText: string) => {
    const trimmed = messageText.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let currentConversationId = conversationId;
      if (!currentConversationId) {
        try {
          const newConv = await apiClient.createConversation({
            title: 'Web Session ' + new Date().toLocaleTimeString(),
            initialMessage: userMessage.content,
          });
          currentConversationId = newConv.id;
          setConversationId(currentConversationId);
        } catch (err) {
          console.error("Failed to create conversation", err);
          setMessages((prev) => [
            ...prev,
            {
              id: "error-" + Date.now(),
              role: "assistant",
              content: "Lo siento, tuve un problema al iniciar la conversación. Por favor intenta de nuevo.",
              timestamp: new Date(),
            },
          ]);
          setIsLoading(false);
          return;
        }
      }

      if (!currentConversationId) throw new Error("Conversation ID not established");

      const response = await apiClient.sendMessage(currentConversationId, {
        message: userMessage.content,
      });

      const aiMessage: Message = {
        id: response.aiResponse.id,
        role: "assistant",
        content: response.aiResponse.content,
        timestamp: new Date(response.aiResponse.createdAt),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: "error-" + Date.now(),
          role: "assistant",
          content: "Tengo problemas para conectarme con el servicio en este momento. Inténtalo de nuevo en unos segundos.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      executeSend(input);
    }
  };

  const isInitialState = messages.length === 1 && messages[0].id === "welcome";

  return (
    <AppLayout>
      <div className="flex flex-col h-full w-full space-y-4 sm:space-y-5 flex-1 min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 sm:gap-3.5">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-sm shadow-blue-500/25 shrink-0">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2 sm:gap-2.5 m-0 leading-tight">
                Asistente AI
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Gemini AI
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                Tu copiloto inteligente para planificar, priorizar y ejecutar tareas.
              </p>
            </div>
          </div>

          <button
            onClick={handleResetConversation}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border border-border/60 bg-card/80 hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer shadow-xs hover:border-blue-500/40"
            title="Iniciar nueva sesión"
          >
            <RotateCcw className="h-3.5 w-3.5 text-blue-500" />
            <span>Nueva sesión</span>
          </button>
        </div>

        {/* Apple-style Glass Chat Shell - Full Width and Height */}
        <div className="relative flex flex-col flex-1 min-h-0 overflow-hidden rounded-3xl border border-border/70 bg-card/85 dark:bg-card/65 backdrop-blur-2xl shadow-xl transition-all duration-300">
          {/* Subtle Ambient Light Glows */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full blur-3xl opacity-15 bg-blue-500 animate-pulse" style={{ animationDuration: "6s" }} />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-48 w-48 rounded-full blur-3xl opacity-15 bg-cyan-500 animate-pulse" style={{ animationDuration: "8s" }} />

          {/* Messages Area */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 420, damping: 30 }}
                  className={cn(
                    "flex gap-3 max-w-[90%] sm:max-w-[80%]",
                    isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs",
                      isUser
                        ? "bg-gradient-to-tr from-blue-600 to-cyan-500 text-white"
                        : "bg-blue-500/15 border border-blue-500/25 text-blue-600 dark:text-blue-400"
                    )}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble + Action Bar */}
                  <div className="flex flex-col min-w-0">
                    <div
                      className={cn(
                        "px-4 py-3 text-sm leading-relaxed",
                        isUser
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-sm rounded-2xl rounded-tr-xs"
                          : "bg-card/90 dark:bg-card/75 border border-border/70 text-foreground rounded-2xl rounded-tl-xs shadow-xs backdrop-blur-md"
                      )}
                    >
                      <p className="whitespace-pre-wrap font-normal break-words">{msg.content}</p>
                    </div>

                    {/* Metadata & Actions */}
                    <div
                      className={cn(
                        "flex items-center gap-2 mt-1 px-1 text-[11px] text-muted-foreground",
                        isUser ? "justify-end" : "justify-start"
                      )}
                    >
                      <span>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {!isUser && msg.id !== "welcome" && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer ml-1"
                          title="Copiar respuesta"
                        >
                          {copiedMessageId === msg.id ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          <span>{copiedMessageId === msg.id ? "Copiado" : "Copiar"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Prompt Starters Chips (When in Initial State) */}
            {isInitialState && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.15 }}
                className="pt-2 pb-4 space-y-3"
              >
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                  <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                  <span>Sugerencias para empezar</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {PROMPT_SUGGESTIONS.map((item, index) => (
                    <motion.button
                      key={item.title}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.12 + index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                      whileHover={{ y: -3, transition: { duration: 0.2 } }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => executeSend(item.prompt)}
                      className="group flex flex-col gap-2.5 p-4 rounded-2xl border border-border/60 bg-card/60 hover:bg-card hover:border-blue-500/40 transition-colors duration-200 text-left shadow-xs hover:shadow-md cursor-pointer"
                    >
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-105"
                        style={{
                          backgroundColor: `${item.color}15`,
                          color: item.color,
                          border: `1px solid ${item.color}25`,
                        }}
                      >
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                          {item.prompt}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Thinking / Loading Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="flex gap-3 max-w-[80%]"
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-blue-500/15 border border-blue-500/25 text-blue-500 shadow-xs animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-xs bg-card/90 dark:bg-card/75 border border-border/70 shadow-xs flex items-center gap-2">
                  <div className="flex items-center gap-1.5 py-0.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-xs text-muted-foreground ml-1">Pensando...</span>
                </div>
              </motion.div>
            )}
            <div className="h-1" />
          </div>

          {/* Apple-style Dock Input Area */}
          <div className="p-3.5 sm:p-4 border-t border-border/60 bg-muted/20 dark:bg-muted/10 backdrop-blur-md">
            <div className="flex items-center gap-2 p-1.5 pl-4 rounded-2xl border border-border/70 bg-background/90 dark:bg-background/80 shadow-xs focus-within:border-blue-500/60 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-200">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pregúntame sobre tus tareas, prioridades o enfoque..."
                className="flex-1 bg-transparent border-0 resize-none text-sm placeholder:text-muted-foreground/60 focus:outline-none py-1.5 max-h-32 text-foreground"
                disabled={isLoading}
              />
              <button
                onClick={() => executeSend(input)}
                disabled={isLoading || !input.trim()}
                className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center justify-center shadow-xs transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-35 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer shrink-0"
                title="Enviar mensaje (Enter)"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
            <p className="text-[11px] text-center text-muted-foreground/75 mt-2">
              Ordo AI puede cometer errores. Revisa las recomendaciones antes de ejecutar cambios importantes.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
