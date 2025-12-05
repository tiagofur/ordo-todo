import { useTimerContext } from "@/contexts/timer-context";
import { useTask } from "@/hooks/api";
import { useNavigate } from "react-router-dom";
import { Play, Pause, Square, X, Check, SkipForward, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export default function FocusMode() {
  const { 
     timeLeft, formatTime, isRunning, isPaused, mode, start, pause, stop, skipToNext, 
     selectedTaskId, completeTask, getProgress
  } = useTimerContext();
  
  const navigate = useNavigate();
  const { data: task } = useTask(selectedTaskId || "");

  const percentage = getProgress();

  // Fullscreen toggle
  useEffect(() => {
    // Optional: Request fullscreen on mount
    // Not widely supported without user interaction so maybe just a button
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    } else {
        document.exitFullscreen();
    }
  }

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Background Ambient Effect */}
        <div className={cn(
            "absolute inset-0 opacity-5 transition-colors duration-1000 blur-3xl",
            mode === 'WORK' ? "bg-red-500" : mode === 'SHORT_BREAK' ? "bg-blue-500" : "bg-green-500"
        )} />

        {/* Top Controls */}
        <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleToggleFullscreen} className="hover:bg-accent/20">
                <Maximize2 className="w-5 h-5 opacity-50 hover:opacity-100" />
            </Button>
            <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-accent/20"
                onClick={() => navigate('/')}
            >
                <X className="w-6 h-6 opacity-50 hover:opacity-100" />
            </Button>
        </div>

        {/* Main Content */}
        <div className="z-10 flex flex-col items-center w-full max-w-4xl mx-auto space-y-16">
            
            {/* Task Title */}
            <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                {selectedTaskId ? (
                    <>
                        <div className="text-sm font-medium text-muted-foreground uppercase type transition-opacity tracking-[0.2em]">
                            {mode === 'WORK' ? 'Deep Work' : 'Break Time'}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground line-clamp-2 leading-tight">
                            {task?.title || <span className="text-muted-foreground">Loading task...</span>}
                        </h1>
                    </>
                ) : (
                    <h1 className="text-4xl font-bold text-muted-foreground">Select a Task to Focus</h1>
                )}
            </div>

            {/* Timer Display */}
            <div className="relative group cursor-default select-none">
                <div className={cn(
                    "text-[140px] md:text-[220px] font-black tabular-nums leading-none tracking-tighter transition-colors duration-500",
                    isPaused ? "text-muted-foreground opacity-50" : "text-foreground"
                )}>
                    {formatTime(timeLeft)}
                </div>
                
                {/* Progress Bar */}
                <div className="absolute -bottom-8 left-0 right-0 h-2 bg-secondary/20 rounded-full overflow-hidden">
                    <div 
                        className={cn(
                            "h-full transition-all duration-1000 ease-linear rounded-full shadow-[0_0_10px_currentColor]",
                            mode === 'WORK' ? "bg-red-500 text-red-500" : mode === 'SHORT_BREAK' ? "bg-blue-500 text-blue-500" : "bg-green-500 text-green-500"
                        )} 
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                 {!isRunning && !isPaused ? (
                    <Button 
                        size="lg" 
                        onClick={() => start()} 
                        className="h-24 w-24 rounded-full text-xl shadow-2xl hover:scale-105 transition-transform"
                    >
                        <Play className="w-10 h-10 ml-1" />
                    </Button>
                ) : (
                    <>
                         <Button 
                            variant="outline"
                            size="icon" 
                            onClick={pause} 
                            className="h-16 w-16 rounded-full border-2 hover:bg-accent/10"
                        >
                            <Pause className="w-8 h-8" />
                        </Button>
                        
                        <Button 
                            variant="outline"
                            size="icon" 
                            onClick={() => stop()} 
                            className="h-16 w-16 rounded-full border-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                        >
                            <Square className="w-6 h-6" />
                        </Button>

                        <Button 
                            variant="outline"
                            size="icon" 
                            onClick={skipToNext} 
                            className="h-16 w-16 rounded-full border-2 hover:bg-accent/10"
                        >
                            <SkipForward className="w-6 h-6" />
                        </Button>

                         {selectedTaskId && (
                            <Button 
                                variant="secondary"
                                size="icon" 
                                onClick={completeTask} 
                                className="h-16 w-16 rounded-full bg-green-500/10 text-green-500 hover:bg-green-500/20 shadow-none border-2 border-green-500/20"
                                title="Complete Task"
                            >
                                <Check className="w-8 h-8" />
                            </Button>
                        )}
                    </>
                )}
            </div>
        </div>
    </div>
  )
}
