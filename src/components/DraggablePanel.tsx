'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLayout } from '@/context/LayoutContext';
import { GripVertical, X, Edit2 } from 'lucide-react';

interface DraggablePanelProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const DraggablePanel: React.FC<DraggablePanelProps> = ({ id, title, children, className = '' }) => {
  const { isEditMode, panels, updatePanel } = useLayout();
  const panel = panels[id];
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  if (!panel) return null;

  if (!panel.visible) {
    return null;
  }

  const handleMouseDownDrag = (e: React.MouseEvent) => {
    if (!isEditMode) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panel.x, y: e.clientY - panel.y });
  };

  const handleMouseDownResize = (e: React.MouseEvent) => {
    if (!isEditMode) return;
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: panel.width,
      height: panel.height,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updatePanel(id, {
          x: Math.max(0, Math.min(100 - panel.width, e.clientX - dragStart.x)),
          y: Math.max(0, Math.min(100 - panel.height, e.clientY - dragStart.y)),
        });
      }

      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;

        updatePanel(id, {
          width: Math.max(panel.minWidth, resizeStart.width + deltaX / 10),
          height: Math.max(panel.minHeight, resizeStart.height + deltaY / 10),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart, panel, updatePanel, id]);

  const handleSaveTitle = () => {
    updatePanel(id, { title: editTitle });
    setIsEditingTitle(false);
  };

  const panelStyle = isEditMode
    ? {
        position: 'absolute' as const,
        left: `${panel.x}%`,
        top: `${panel.y}%`,
        width: `${panel.width}%`,
        height: `${panel.height}%`,
        zIndex: panel.zIndex,
        cursor: isDragging ? 'grabbing' : 'grab',
      }
    : {
        gridColumn: 'span 1',
      };

  return (
    <div
      ref={panelRef}
      style={panelStyle}
      className={`
        ${isEditMode ? 'absolute' : 'relative'}
        transition-all duration-200 rounded-lg overflow-hidden
        ${isEditMode ? 'border-2 border-blue-400 bg-blue-50/30 shadow-lg' : ''}
        ${className}
      `}
    >
      {/* Edit Mode Controls */}
      {isEditMode && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Drag Handle */}
          <div
            onMouseDown={handleMouseDownDrag}
            className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-blue-500 to-blue-400 text-white flex items-center gap-2 px-2 cursor-grab active:cursor-grabbing pointer-events-auto z-50 group"
          >
            <GripVertical size={14} />
            {isEditingTitle ? (
              <input
                autoFocus
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                className="flex-1 bg-white text-gray-900 px-2 py-0.5 rounded text-xs font-medium"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                onClick={() => setIsEditingTitle(true)}
                className="flex-1 text-xs font-semibold truncate cursor-text hover:underline"
              >
                {panel.title}
              </span>
            )}
            <button
              onClick={() => updatePanel(id, { visible: false })}
              className="p-1 hover:bg-red-500 rounded transition-colors pointer-events-auto"
            >
              <X size={14} />
            </button>
          </div>

          {/* Resize Handle */}
          <div
            onMouseDown={handleMouseDownResize}
            className="absolute bottom-0 right-0 w-6 h-6 bg-gradient-to-tl from-blue-600 to-transparent cursor-nwse-resize pointer-events-auto hover:from-blue-700"
          />
        </div>
      )}

      {/* Panel Content */}
      <div className={isEditMode ? 'pt-8' : ''}>
        {children}
      </div>
    </div>
  );
};
