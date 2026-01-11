import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ordo-todo/ui";
import { Wifi, WifiOff, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@ordo-todo/ui";

interface ConnectionStatusIndicatorProps {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  onReconnect?: () => void;
  className?: string;
}

export function ConnectionStatusIndicator({
  connected,
  connecting,
  error,
  onReconnect,
  className = "",
}: ConnectionStatusIndicatorProps) {
  const getStatusIcon = () => {
    if (connecting) {
      return <Loader2 className="h-3 w-3 animate-spin text-yellow-500" />;
    }

    if (connected) {
      return <Wifi className="h-3 w-3 text-green-500" />;
    }

    if (error) {
      return <AlertCircle className="h-3 w-3 text-red-500" />;
    }

    return <WifiOff className="h-3 w-3 text-gray-500" />;
  };

  const getStatusText = () => {
    if (connecting) return "Connecting to real-time updates...";
    if (connected) return "Connected to real-time updates";
    if (error) return `Connection error: ${error}`;
    return "Disconnected from real-time updates";
  };

  const getStatusColor = () => {
    if (connecting) return "text-yellow-500";
    if (connected) return "text-green-500";
    if (error) return "text-red-500";
    return "text-gray-500";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onReconnect}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors hover:bg-muted/50",
              onReconnect && !connected && "cursor-pointer",
              !onReconnect && "cursor-default",
              className
            )}
            disabled={connected || connecting}
          >
            {getStatusIcon()}
            <span className={cn("text-xs font-medium", getStatusColor())}>
              {connecting ? "Connecting..." : connected ? "Live" : "Offline"}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="text-sm">{getStatusText()}</p>
          {error && onReconnect && !connected && (
            <p className="text-xs text-muted-foreground mt-1">
              Click to retry
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
