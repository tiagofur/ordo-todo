'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Plus, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import type { Note } from './sticky-note';
import { StickyNote } from './sticky-note';

export interface NotesCanvasProps {
  notes: Note[];
  onCreateNote?: (data: { content: string; x: number; y: number; workspaceId: string }) => void;
  onUpdateNote?: (id: string, data: { content?: string; x?: number; y?: number; width?: number; height?: number; color?: string }) => void;
  onDeleteNote?: (id: string) => void;
  workspaceId: string;
  selectedNoteId?: string;
  onSelectNote?: (id: string) => void;
  readOnly?: boolean;
  labels?: {
    create?: string;
    delete?: string;
    edit?: string;
    newNote?: string;
  };
  className?: string;
}

export function NotesCanvas({
  notes,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
  workspaceId,
  selectedNoteId,
  onSelectNote,
  readOnly = false,
  labels = {},
  className = '',
}: NotesCanvasProps) {
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showNewNoteDialog, setShowNewNoteDialog] = useState(false);
  const [newNotePosition, setNewNotePosition] = useState({ x: 100, y: 100 });

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Zoom
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom((prev) => Math.max(0.25, Math.min(2, prev + delta)));
    } else {
      // Pan
      e.preventDefault();
      setPan((prev) => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || e.target === containerRef.current) {
      if (!readOnly) {
        setIsPanning(true);
        panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      }
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (readOnly) return;
    if ((e.target === canvasRef.current || e.target === containerRef.current) && onCreateNote) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - pan.x) / zoom;
        const y = (e.clientY - rect.top - pan.y) / zoom;
        setNewNotePosition({ x, y });
        setShowNewNoteDialog(true);
      }
    }
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning && panStartRef.current) {
        setPan({
          x: e.clientX - panStartRef.current.x,
          y: e.clientY - panStartRef.current.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsPanning(false);
      panStartRef.current = null;
    };

    if (isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(2, prev + 0.1));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.25, prev - 0.1));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleCreateNote = (content: string) => {
    if (onCreateNote && content.trim()) {
      onCreateNote({
        content: content.trim(),
        x: newNotePosition.x,
        y: newNotePosition.y,
        workspaceId,
      });
    }
    setShowNewNoteDialog(false);
  };

  return (
    <div
      ref={containerRef}
      className={`notes-canvas relative w-full h-full overflow-hidden bg-gray-100 dark:bg-gray-900 ${className}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
        {!readOnly && (
          <button
            type="button"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            onClick={() => {
              setNewNotePosition({ x: 100 - pan.x / zoom, y: 100 - pan.y / zoom });
              setShowNewNoteDialog(true);
            }}
            aria-label={labels.create ?? 'Create note'}
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
        <button
          type="button"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          onClick={handleZoomOut}
          aria-label="Zoom out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium min-w-[3rem] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          onClick={handleZoomIn}
          aria-label="Zoom in"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          type="button"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          onClick={handleResetZoom}
          aria-label="Reset zoom"
        >
          <Maximize className="w-5 h-5" />
        </button>
      </div>

      {/* Instructions */}
      {notes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p className="text-lg font-medium mb-2">{labels.newNote ?? 'No notes yet'}</p>
            <p className="text-sm">
              {readOnly
                ? labels.edit ?? 'Double-click anywhere to create a note'
                : 'Double-click anywhere to create your first note'}
            </p>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="absolute inset-0"
        style={{
          transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
          transformOrigin: '0 0',
          transition: isPanning ? 'none' : 'transform 150ms ease-out',
          cursor: isPanning ? 'grabbing' : 'grab',
          minWidth: '5000px',
          minHeight: '5000px',
        }}
      >
        {notes.map((note) => (
          <StickyNote
            key={note.id}
            note={note}
            onUpdate={onUpdateNote}
            onDelete={onDeleteNote}
            isSelected={selectedNoteId === note.id}
            onSelect={onSelectNote}
            readOnly={readOnly}
            labels={labels}
          />
        ))}
      </div>

      {/* New Note Dialog */}
      {showNewNoteDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{labels.create ?? 'Create Note'}</h3>
            <textarea
              autoFocus
              className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={labels.edit ?? 'Write something...'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.metaKey) {
                  const target = e.target as HTMLTextAreaElement;
                  handleCreateNote(target.value);
                }
                if (e.key === 'Escape') {
                  setShowNewNoteDialog(false);
                }
              }}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                onClick={() => setShowNewNoteDialog(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                onClick={(e) => {
                  const textarea = e.currentTarget.parentElement?.querySelector('textarea');
                  if (textarea) {
                    handleCreateNote(textarea.value);
                  }
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
