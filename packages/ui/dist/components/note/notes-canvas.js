'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useRef, useCallback } from 'react';
import { Plus, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { StickyNote } from './sticky-note';
export function NotesCanvas({ notes, onCreateNote, onUpdateNote, onDeleteNote, workspaceId, selectedNoteId, onSelectNote, readOnly = false, labels = {}, className = '', }) {
    const [zoom, setZoom] = useState(1);
    const [isPanning, setIsPanning] = useState(false);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [showNewNoteDialog, setShowNewNoteDialog] = useState(false);
    const [newNotePosition, setNewNotePosition] = useState({ x: 100, y: 100 });
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const panStartRef = useRef(null);
    const handleWheel = useCallback((e) => {
        if (e.ctrlKey || e.metaKey) {
            // Zoom
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setZoom((prev) => Math.max(0.25, Math.min(2, prev + delta)));
        }
        else {
            // Pan
            e.preventDefault();
            setPan((prev) => ({
                x: prev.x - e.deltaX,
                y: prev.y - e.deltaY,
            }));
        }
    }, []);
    const handleMouseDown = (e) => {
        if (e.target === canvasRef.current || e.target === containerRef.current) {
            if (!readOnly) {
                setIsPanning(true);
                panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
            }
        }
    };
    const handleDoubleClick = (e) => {
        if (readOnly)
            return;
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
        const handleMouseMove = (e) => {
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
    const handleCreateNote = (content) => {
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
    return (_jsxs("div", { ref: containerRef, className: `notes-canvas relative w-full h-full overflow-hidden bg-gray-100 dark:bg-gray-900 ${className}`, onWheel: handleWheel, onMouseDown: handleMouseDown, onDoubleClick: handleDoubleClick, children: [_jsxs("div", { className: "absolute top-4 left-4 z-50 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2", children: [!readOnly && (_jsx("button", { type: "button", className: "p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors", onClick: () => {
                            setNewNotePosition({ x: 100 - pan.x / zoom, y: 100 - pan.y / zoom });
                            setShowNewNoteDialog(true);
                        }, "aria-label": labels.create ?? 'Create note', children: _jsx(Plus, { className: "w-5 h-5" }) })), _jsx("div", { className: "w-px h-6 bg-gray-300 dark:bg-gray-600" }), _jsx("button", { type: "button", className: "p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors", onClick: handleZoomOut, "aria-label": "Zoom out", children: _jsx(ZoomOut, { className: "w-5 h-5" }) }), _jsxs("span", { className: "text-sm font-medium min-w-[3rem] text-center", children: [Math.round(zoom * 100), "%"] }), _jsx("button", { type: "button", className: "p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors", onClick: handleZoomIn, "aria-label": "Zoom in", children: _jsx(ZoomIn, { className: "w-5 h-5" }) }), _jsx("button", { type: "button", className: "p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors", onClick: handleResetZoom, "aria-label": "Reset zoom", children: _jsx(Maximize, { className: "w-5 h-5" }) })] }), notes.length === 0 && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none", children: _jsxs("div", { className: "text-center text-gray-500 dark:text-gray-400", children: [_jsx("p", { className: "text-lg font-medium mb-2", children: labels.newNote ?? 'No notes yet' }), _jsx("p", { className: "text-sm", children: readOnly
                                ? labels.edit ?? 'Double-click anywhere to create a note'
                                : 'Double-click anywhere to create your first note' })] }) })), _jsx("div", { ref: canvasRef, className: "absolute inset-0", style: {
                    transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                    transformOrigin: '0 0',
                    transition: isPanning ? 'none' : 'transform 150ms ease-out',
                    cursor: isPanning ? 'grabbing' : 'grab',
                    minWidth: '5000px',
                    minHeight: '5000px',
                }, children: notes.map((note) => (_jsx(StickyNote, { note: note, onUpdate: onUpdateNote, onDelete: onDeleteNote, isSelected: selectedNoteId === note.id, onSelect: onSelectNote, readOnly: readOnly, labels: labels }, note.id))) }), showNewNoteDialog && (_jsx("div", { className: "fixed inset-0 z-[100] flex items-center justify-center bg-black/50", children: _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: labels.create ?? 'Create Note' }), _jsx("textarea", { autoFocus: true, className: "w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white", placeholder: labels.edit ?? 'Write something...', onKeyDown: (e) => {
                                if (e.key === 'Enter' && e.metaKey) {
                                    const target = e.target;
                                    handleCreateNote(target.value);
                                }
                                if (e.key === 'Escape') {
                                    setShowNewNoteDialog(false);
                                }
                            } }), _jsxs("div", { className: "flex justify-end gap-2 mt-4", children: [_jsx("button", { type: "button", className: "px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors", onClick: () => setShowNewNoteDialog(false), children: "Cancel" }), _jsx("button", { type: "button", className: "px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors", onClick: (e) => {
                                        const textarea = e.currentTarget.parentElement?.querySelector('textarea');
                                        if (textarea) {
                                            handleCreateNote(textarea.value);
                                        }
                                    }, children: "Create" })] })] }) }))] }));
}
