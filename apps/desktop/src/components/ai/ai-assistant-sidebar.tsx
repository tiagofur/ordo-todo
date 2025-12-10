"use client";

import { useState, useRef, useEffect } from "react";
import { Button, Input } from "@ordo-todo/ui";
import { Sparkles, Send, X, Bot, User } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIAssistantSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIAssistantSidebar({ isOpen, onClose }: AIAssistantSidebarProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I am your Ordo AI assistant. How can I help you be more productive today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Try to load welcome message from translations
  useEffect(() => {
    setMessages(prev => {
        if (prev[0].id === 'welcome') {
             // Basic check if translation exists or fallback
             const welcomeMsg = t('AIAssistantSidebar.welcome');
             if (welcomeMsg && welcomeMsg !== 'AIAssistantSidebar.welcome') {
                 return [{ ...prev[0], content: welcomeMsg }];
             }
        }
        return prev;
    });
  }, [t]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let currentConversationId = conversationId;
      if (!currentConversationId) {
         try {
             // Create a new conversation if one doesn't exist
             const newConv = await apiClient.createConversation({ 
                 title: 'Assistant Session ' + new Date().toLocaleTimeString(),
                 initialMessage: userMessage.content // Optional: backend might handle this
             });
             currentConversationId = newConv.id;
             setConversationId(currentConversationId);
         } catch (err) {
             console.error("Failed to create conversation", err);
             throw new Error("Could not start conversation");
         }
      }

      // Send the message
      if (!currentConversationId) throw new Error("Conversation ID not established");
      const response = await apiClient.sendMessage(currentConversationId, { message: userMessage.content });
      
      const aiMessage: Message = {
        id: response.aiResponse.id,
        role: "assistant",
        content: response.aiResponse.content,
        timestamp: new Date(response.aiResponse.createdAt),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      toast.error(t('Common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-background/95 backdrop-blur-md border-l shadow-2xl z-50 flex flex-col transition-all duration-300 ease-in-out">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg shadow-md">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h3 className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {t('AIAssistantSidebar.title', 'AI Assistant')}
          </h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-muted/50 rounded-full">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-4 overflow-y-auto scrollbar-hide">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              } animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 dark:from-indigo-900/40 dark:to-purple-900/40 dark:text-indigo-300"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <div
                className={`rounded-2xl p-3 text-sm max-w-[85%] shadow-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-muted/80 backdrop-blur-sm rounded-tl-none border"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 animate-pulse">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-none p-3 text-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-0"></span>
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-150"></span>
                <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce delay-300"></span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2 relative"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('AIAssistantSidebar.placeholder', 'Ask me anything...')}
            disabled={isLoading}
            className="flex-1 pr-10 shadow-sm border-zinc-200 dark:border-zinc-800 focus-visible:ring-indigo-500"
          />
          <div className="absolute right-1 top-1">
            <Button 
                type="submit" 
                size="icon" 
                disabled={isLoading || !input.trim()}
                className="h-8 w-8 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm"
            >
                <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
