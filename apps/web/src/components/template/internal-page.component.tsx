"use client";
import { useEffect, useState } from "react";
import Menu from "./menu.component";
import TopBar from "./top-bar.component";
import { useScreenSize } from "@/data/hooks/use-screen-size.hook";
import { AIAssistantSidebar } from "@/components/ai/ai-assistant-sidebar";
import { Sidebar } from "@/components/shared/sidebar";
import { useNotificationsSocket } from "@/hooks/use-notifications-socket";

export default function InternalPage(props: any) {
  useNotificationsSocket();
  const { xs, sm, md } = useScreenSize();
  const [isMenuOpen, setMenuOpen] = useState(!(xs || sm || md));
  const [isAIOpen, setAIOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(!(xs || sm || md));
  }, [xs, sm, md]);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Mobile Menu */}
      <div className="md:hidden">
        <Menu
          className="w-64 border-r border-zinc-300 dark:border-zinc-900"
          isOpen={isMenuOpen}
          onClose={() => setMenuOpen(false)}
        />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto relative md:pl-64 transition-all duration-300">
        <TopBar
          className="border-b border-zinc-300 dark:border-zinc-900"
          onToggleMenu={() => setMenuOpen(!isMenuOpen)}
          onToggleAI={() => setAIOpen(!isAIOpen)}
        />
        <main className="p-6">{props.children}</main>
        
        <AIAssistantSidebar 
            isOpen={isAIOpen} 
            onClose={() => setAIOpen(false)} 
        />
      </div>
    </div>
  );
}
