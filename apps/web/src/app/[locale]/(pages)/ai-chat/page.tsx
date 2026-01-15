
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { AppLayout } from "@/components/shared/app-layout";
import { Button, Input, Card } from "@ordo-todo/ui";
import { Send, User, Bot, Sparkles } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIChatPage() {
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

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
             // Create conversation if it doesn't exist
             const newConv = await apiClient.createConversation({ 
                 title: 'Web Session ' + new Date().toLocaleTimeString(),
                 initialMessage: userMessage.content 
             });
             currentConversationId = newConv.id;
             setConversationId(currentConversationId);
         } catch (err) {
             console.error("Failed to create conversation", err);
             // Add error message to chat
             setMessages(prev => [...prev, {
                 id: "error-" + Date.now(),
                 role: "assistant",
                 content: "Sorry, I had trouble starting the conversation. Please try again.",
                 timestamp: new Date()
             }]);
             setIsLoading(false);
             return;
         }
      }

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
      setMessages(prev => [...prev, {
         id: "error-" + Date.now(),
         role: "assistant",
         content: "I'm having trouble connecting right now. Please try again later.",
         timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto w-full">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
           <div>
             <h1 className="text-2xl font-bold flex items-center gap-2">
               <Sparkles className="w-6 h-6 text-indigo-500" />
               AI Assistant
             </h1>
             <p className="text-muted-foreground">Your intelligent productivity companion.</p>
           </div>
        </div>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
          
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={cn(
                  "flex gap-3 max-w-[80%]",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                )}
              >
                {/* Avatar */}
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  msg.role === "user" ? "bg-indigo-600" : "bg-muted"
                )}>
                  {msg.role === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-foreground/70" />
                  )}
                </div>

                {/* Bubble */}
                <div className={cn(
                  "p-3 rounded-2xl text-sm leading-relaxed",
                  msg.role === "user" 
                    ? "bg-indigo-600 text-white rounded-tr-none" 
                    : "bg-muted/50 text-foreground rounded-tl-none border border-border/50"
                )}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 max-w-[80%]">
                 <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-muted">
                    <Bot className="w-4 h-4 text-foreground/70" />
                 </div>
                 <div className="p-3 rounded-2xl rounded-tl-none bg-muted/50 border border-border/50 flex items-center gap-2">
                    <div className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border/50 bg-card/30">
             <div className="flex gap-2">
                <Input 
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   onKeyDown={handleKeyDown}
                   placeholder="Ask me anything..."
                   className="flex-1 bg-background/50"
                   disabled={isLoading}
                />
                <Button 
                   onClick={handleSend} 
                   disabled={isLoading || !input.trim()}
                   size="icon"
                   className="bg-indigo-600 hover:bg-indigo-700"
                >
                   <Send className="w-4 h-4" />
                </Button>
             </div>
             <p className="text-xs text-center text-muted-foreground mt-2">
                Ordo AI can make mistakes. Review generated tasks and suggestions.
             </p>
          </div>

        </Card>

      </div>
    </AppLayout>
  );
}
