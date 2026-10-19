import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, FileText, FolderGit2, Repeat, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@ordo-todo/ui';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

interface SearchResult {
  id: string;
  type: 'task' | 'project' | 'habit';
  title: string;
  description?: string;
  relevanceScore: number;
  highlights: string[];
  metadata: {
    status?: string;
    priority?: string;
    projectName?: string;
  };
}

interface SearchInterpretation {
  originalQuery: string;
  intent: string;
  explanation: string;
  suggestedFilters: any;
}

interface SmartSearchProps {
  onClose?: () => void;
  isOpen?: boolean;
  className?: string;
}

export function SmartSearch({ onClose, isOpen = true, className }: SmartSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [interpretation, setInterpretation] = useState<SearchInterpretation | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const debouncedQuery = useDebouncedValue(query, 300);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Fetch suggestions as user types
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;

    const fetchSuggestions = async () => {
      try {
        const response = await (apiClient as any).searchSuggestions(debouncedQuery);
        if (cancelled) return;
        const suggestionsData = Array.isArray(response) ? response : (response.suggestions || []);
        setSuggestions(suggestionsData);
      } catch {
        // Silently ignore suggestions failure
      }
    };

    if (showSuggestions) {
      fetchSuggestions();
    }

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, showSuggestions]);

  // Perform search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setInterpretation(null);
      return;
    }

    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const response = await (apiClient as any).semanticSearch(searchQuery);
      const responseAny = response as any;
      const searchResults = Array.isArray(response) ? response : (responseAny?.results || []);
      const searchInterpretation = !Array.isArray(response) ? responseAny?.interpretation : null;

      setResults(searchResults);
      setInterpretation(searchInterpretation);
      setSelectedIndex(0);
    } catch (error) {
      console.error('Desktop search failed', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = showSuggestions ? suggestions : results;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (showSuggestions && suggestions[selectedIndex]) {
          setQuery(suggestions[selectedIndex]);
          performSearch(suggestions[selectedIndex]);
        } else if (results[selectedIndex]) {
          navigateToResult(results[selectedIndex]);
        } else {
          performSearch(query);
        }
        break;
      case 'Escape':
        onClose?.();
        break;
    }
  };

  // Navigate to a search result
  const navigateToResult = (result: SearchResult) => {
    switch (result.type) {
      case 'task':
        navigate(`/tasks?task=${result.id}`);
        break;
      case 'project':
        navigate(`/projects/${result.id}`);
        break;
      case 'habit':
        navigate(`/habits?habit=${result.id}`);
        break;
    }
    onClose?.();
  };

  // Get icon for result type
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <FileText className="h-4 w-4" />;
      case 'project':
        return <FolderGit2 className="h-4 w-4" />;
      case 'habit':
        return <Repeat className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'URGENT':
        return 'text-red-500';
      case 'HIGH':
        return 'text-orange-500';
      case 'MEDIUM':
        return 'text-yellow-500';
      case 'LOW':
        return 'text-green-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const renderSafeHighlight = (highlight: string) => {
    const escaped = highlight
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    return escaped.replace(/\*\*(.*?)\*\*/g, '<mark class="bg-yellow-200 dark:bg-yellow-900 text-foreground px-0.5 rounded">$1</mark>');
  };

  if (!isOpen) return null;

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      {/* Search Input Box */}
      <div className="relative">
        <div className="flex items-center gap-3 bg-card border border-border/80 rounded-2xl px-4 py-3.5 shadow-2xl backdrop-blur-xl">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar tareas, proyectos, hábitos... (lenguaje natural)"
            className="flex-1 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground text-sm"
          />

          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}

          {query && !isLoading && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg"
              onClick={() => {
                setQuery('');
                setResults([]);
                setInterpretation(null);
                setShowSuggestions(true);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* AI Badge */}
        <div className="absolute -top-2.5 right-4 pointer-events-none">
          <div className="flex items-center gap-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-purple-500/20 shadow-sm backdrop-blur-sm">
            <Sparkles className="h-3 w-3" />
            <span>IA</span>
          </div>
        </div>
      </div>

      {/* Results / Suggestions Dropdown */}
      <AnimatePresence mode="wait">
        {suggestions.length > 0 && showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="p-2">
              <p className="text-[11px] font-medium text-muted-foreground px-2 py-1">Sugerencias inteligentes</p>
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setQuery(suggestion);
                    performSearch(suggestion);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors",
                    selectedIndex === index ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"
                  )}
                >
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 truncate">{suggestion}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {results.length > 0 && !showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Interpretation Explanation */}
            {interpretation && (
              <div className="px-4 py-2.5 border-b border-border bg-muted/40">
                <div className="flex items-center gap-2 text-xs">
                  <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                  <span className="text-muted-foreground">{interpretation.explanation}</span>
                </div>
              </div>
            )}

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 divide-y divide-border/40">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => navigateToResult(result)}
                  className={cn(
                    "w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                    selectedIndex === index ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"
                  )}
                >
                  <div className={cn("mt-1", getPriorityColor(result.metadata.priority))}>
                    {getResultIcon(result.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{result.title}</p>
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground px-1.5 py-0.5 bg-muted rounded">
                        {result.type}
                      </span>
                    </div>

                    {result.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {result.description}
                      </p>
                    )}

                    {result.metadata.projectName && (
                      <p className="text-[11px] text-muted-foreground mt-1">
                        📁 {result.metadata.projectName}
                      </p>
                    )}

                    {result.highlights && result.highlights.length > 0 && (
                      <div className="mt-1">
                        {result.highlights.map((h, i) => (
                          <p
                            key={i}
                            className="text-[11px] text-muted-foreground italic"
                            dangerouslySetInnerHTML={{ __html: renderSafeHighlight(h) }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] font-mono text-muted-foreground mt-1">
                    {result.relevanceScore}%
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-border bg-muted/30 text-[11px] text-muted-foreground flex items-center justify-between">
              <span>↑↓ navegar • Enter seleccionar • Esc cerrar</span>
              <span>{results.length} resultados</span>
            </div>
          </motion.div>
        )}

        {query && !isLoading && results.length === 0 && !showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-2 bg-card border border-border rounded-xl shadow-2xl p-8 text-center"
          >
            <Search className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">No se encontraron resultados para "{query}"</p>
            <p className="text-xs text-muted-foreground mt-1">
              Prueba con otros términos o lenguaje natural (ej. "tareas para hoy")
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
