'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { X, GripVertical } from 'lucide-react';
const NOTE_COLORS = [
    '#feff9c', // Yellow
    '#ffadad', // Red
    '#ffd6a5', // Orange
    '#fdffb6', // Light Yellow
    '#caffbf', // Green
    '#9bf6ff', // Cyan
    '#a0c4ff', // Blue
    '#bdb2ff', // Purple
    '#ffc6ff', // Pink
    '#fffffc', // White
];
export function StickyNote({ note, onUpdate, onDelete, isSelected = false, onSelect, readOnly = false, labels = {}, className = '', }) {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(note.content);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [position, setPosition] = useState({ x: note.x, y: note.y });
    const [size, setSize] = useState({ width: note.width, height: note.height });
    const noteRef = useRef(null);
    const dragStartRef = useRef(null);
    const resizeStartRef = useRef(null);
    useEffect(() => {
        setContent(note.content);
        setPosition({ x: note.x, y: note.y });
        setSize({ width: note.width, height: note.height });
    }, [note]);
    const handleMouseDown = (e) => {
        if (readOnly || isEditing)
            return;
        if (e.target.closest('.note-actions'))
            return;
        e.preventDefault();
        setIsDragging(true);
        onSelect?.(note.id);
        dragStartRef.current = {
            x: position.x,
            y: position.y,
            mouseX: e.clientX,
            mouseY: e.clientY,
        };
    };
    const handleResizeStart = (e) => {
        if (readOnly || isEditing)
            return;
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        resizeStartRef.current = {
            x: size.width,
            y: size.height,
            mouseX: e.clientX,
            mouseY: e.clientY,
        };
    };
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging && dragStartRef.current) {
                const dx = e.clientX - dragStartRef.current.mouseX;
                const dy = e.clientY - dragStartRef.current.mouseY;
                const newX = Math.max(0, dragStartRef.current.x + dx);
                const newY = Math.max(0, dragStartRef.current.y + dy);
                setPosition({ x: newX, y: newY });
            }
            if (isResizing && resizeStartRef.current) {
                const dx = e.clientX - resizeStartRef.current.mouseX;
                const dy = e.clientY - resizeStartRef.current.mouseY;
                const newWidth = Math.max(200, resizeStartRef.current.x + dx);
                const newHeight = Math.max(200, resizeStartRef.current.y + dy);
                setSize({ width: newWidth, height: newHeight });
            }
        };
        const handleMouseUp = () => {
            if (isDragging && dragStartRef.current) {
                if (position.x !== note.x || position.y !== note.y) {
                    onUpdate?.(note.id, { x: position.x, y: position.y });
                }
                setIsDragging(false);
                dragStartRef.current = null;
            }
            if (isResizing && resizeStartRef.current) {
                if (size.width !== note.width || size.height !== note.height) {
                    onUpdate?.(note.id, { width: size.width, height: size.height });
                }
                setIsResizing(false);
                resizeStartRef.current = null;
            }
        };
        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, position, size, note, onUpdate]);
    const handleContentChange = (e) => {
        setContent(e.target.value);
    };
    const handleContentBlur = () => {
        setIsEditing(false);
        if (content !== note.content) {
            onUpdate?.(note.id, { content });
        }
    };
    const handleContentKeyDown = (e) => {
        if (e.key === 'Escape') {
            setContent(note.content);
            setIsEditing(false);
        }
        if (e.key === 'Enter' && e.metaKey) {
            e.currentTarget.blur();
        }
    };
    const handleColorChange = (color) => {
        setShowColorPicker(false);
        onUpdate?.(note.id, { color });
    };
    const handleDelete = () => {
        if (confirm(labels.delete ?? 'Are you sure you want to delete this note?')) {
            onDelete?.(note.id);
        }
    };
    const noteStyle = {
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        backgroundColor: note.color,
        boxShadow: isSelected ? '0 0 0 3px rgba(59, 130, 246, 0.5)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        transition: isDragging || isResizing ? 'none' : 'transform 150ms ease-out, box-shadow 150ms ease-out',
        cursor: readOnly ? 'default' : 'move',
        zIndex: isSelected ? 100 : 1,
    };
    return (_jsxs("div", { ref: noteRef, className: `sticky-note rounded-lg shadow-lg flex flex-col ${className}`, style: noteStyle, onMouseDown: handleMouseDown, children: [_jsxs("div", { className: "note-header flex items-center justify-between px-2 py-1 border-b border-black/10", children: [_jsxs("div", { className: "flex items-center gap-1", children: [!readOnly && (_jsx("button", { type: "button", className: "p-1 hover:bg-black/5 rounded transition-colors cursor-grab active:cursor-grabbing", "aria-label": "Drag note", children: _jsx(GripVertical, { className: "w-4 h-4 text-black/40" }) })), _jsx("span", { className: "text-xs text-black/50", children: new Date(note.createdAt).toLocaleDateString() })] }), !readOnly && (_jsxs("div", { className: "note-actions flex items-center gap-1", children: [_jsx("button", { type: "button", className: "p-1 hover:bg-black/5 rounded transition-colors", onClick: () => setShowColorPicker(!showColorPicker), "aria-label": "Change color", children: _jsx("div", { className: "w-4 h-4 rounded border border-black/10", style: { backgroundColor: note.color } }) }), _jsx("button", { type: "button", className: "p-1 hover:bg-red-500 hover:text-white rounded transition-colors", onClick: handleDelete, "aria-label": labels.delete ?? 'Delete note', children: _jsx(X, { className: "w-4 h-4" }) })] }))] }), showColorPicker && (_jsx("div", { className: "absolute top-10 right-2 bg-white rounded-lg shadow-lg p-2 border border-gray-200 z-50", children: _jsx("div", { className: "grid grid-cols-5 gap-1", children: NOTE_COLORS.map((color) => (_jsx("button", { type: "button", className: "w-6 h-6 rounded border border-black/10 hover:scale-110 transition-transform", style: { backgroundColor: color }, onClick: () => handleColorChange(color), "aria-label": `Select color ${color}` }, color))) }) })), _jsx("textarea", { value: content, onChange: handleContentChange, onBlur: handleContentBlur, onKeyDown: handleContentKeyDown, onFocus: () => !readOnly && setIsEditing(true), readOnly: readOnly, className: "flex-1 w-full p-3 bg-transparent border-0 resize-none focus:outline-none focus:ring-0 text-black placeholder:text-black/30", placeholder: labels.edit ?? 'Write something...', style: {
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    cursor: readOnly ? 'default' : 'text',
                    minHeight: '120px',
                } }), !readOnly && (_jsx("div", { className: "absolute bottom-0 right-0 w-4 h-4 cursor-se-resize", onMouseDown: handleResizeStart, children: _jsx("div", { className: "absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-black/20 rounded-br" }) }))] }));
}
