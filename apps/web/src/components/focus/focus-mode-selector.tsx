"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, Flame, Timer, Brain } from 'lucide-react';
import { Button } from '@ordo-todo/ui';
import { cn } from '@/lib/utils';

export interface FocusMode {
  id: string;
  name: string;
  description: string;
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  icon: React.ReactNode;
  color: string;
}

const FOCUS_MODES: FocusMode[] = [
  {
    id: 'pomodoro',
    name: 'Pomodoro',
    description: '25 min trabajo, 5 min descanso',
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    icon: <Timer className="w-5 h-5" />,
    color: 'text-red-500',
  },
  {
    id: 'deep-work',
    name: 'Deep Work',
    description: '50 min trabajo, 10 min descanso',
    workDuration: 50,
    shortBreakDuration: 10,
    longBreakDuration: 30,
    sessionsBeforeLongBreak: 2,
    icon: <Brain className="w-5 h-5" />,
    color: 'text-purple-500',
  },
  {
    id: 'flow',
    name: 'Flow State',
    description: '90 min trabajo intenso',
    workDuration: 90,
    shortBreakDuration: 20,
    longBreakDuration: 45,
    sessionsBeforeLongBreak: 2,
    icon: <Flame className="w-5 h-5" />,
    color: 'text-orange-500',
  },
  {
    id: 'quick-sprint',
    name: 'Sprint',
    description: '15 min trabajo rápido',
    workDuration: 15,
    shortBreakDuration: 3,
    longBreakDuration: 10,
    sessionsBeforeLongBreak: 6,
    icon: <Zap className="w-5 h-5" />,
    color: 'text-yellow-500',
  },
];

interface FocusModeSelectorProps {
  selectedModeId: string;
  onSelectMode: (mode: FocusMode) => void;
  className?: string;
  compact?: boolean;
}

export function FocusModeSelector({
  selectedModeId,
  onSelectMode,
  className,
  compact = false,
}: FocusModeSelectorProps) {
  const selectedMode = FOCUS_MODES.find(m => m.id === selectedModeId) || FOCUS_MODES[0];

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {FOCUS_MODES.map(mode => (
          <Button
            key={mode.id}
            variant={mode.id === selectedModeId ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onSelectMode(mode)}
            className={cn(
              "transition-all",
              mode.id === selectedModeId && mode.color
            )}
            title={mode.description}
          >
            {mode.icon}
            <span className="ml-1 hidden sm:inline">{mode.name}</span>
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Modo de Enfoque
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {FOCUS_MODES.map(mode => (
          <motion.button
            key={mode.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectMode(mode)}
            className={cn(
              "relative p-4 rounded-xl border text-left transition-all",
              "hover:bg-accent/50",
              mode.id === selectedModeId 
                ? "bg-primary/10 border-primary/30" 
                : "border-border/50"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center",
                mode.id === selectedModeId ? "bg-primary/20" : "bg-muted",
                mode.color
              )}>
                {mode.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{mode.name}</p>
                <p className="text-sm text-muted-foreground">{mode.description}</p>
                
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{mode.workDuration}m trabajo</span>
                  <span>•</span>
                  <span>{mode.shortBreakDuration}m descanso</span>
                </div>
              </div>
            </div>
            
            {mode.id === selectedModeId && (
              <motion.div
                layoutId="selected-mode"
                className="absolute inset-0 border-2 border-primary rounded-xl pointer-events-none"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>
      
      {/* Selected Mode Details */}
      <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
        <div className="flex items-center gap-3 mb-2">
          <div className={cn("p-2 rounded-lg bg-muted", selectedMode.color)}>
            {selectedMode.icon}
          </div>
          <div>
            <p className="font-semibold">{selectedMode.name}</p>
            <p className="text-sm text-muted-foreground">{selectedMode.description}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4 text-center">
          <div>
            <p className="text-2xl font-bold">{selectedMode.workDuration}</p>
            <p className="text-xs text-muted-foreground">min trabajo</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{selectedMode.shortBreakDuration}</p>
            <p className="text-xs text-muted-foreground">min descanso</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{selectedMode.sessionsBeforeLongBreak}</p>
            <p className="text-xs text-muted-foreground">sesiones</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export { FOCUS_MODES };
