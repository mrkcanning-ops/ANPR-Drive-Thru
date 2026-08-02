'use client';

import React from 'react';
import { useLayout } from '@/context/LayoutContext';
import { Settings, Play, RotateCcw, Save } from 'lucide-react';

export const LayoutEditorToolbar: React.FC = () => {
  const { isEditMode, setIsEditMode, saveLayout, resetLayout, panels } = useLayout();

  const visiblePanelsCount = Object.values(panels).filter((p) => p.visible).length;
  const totalPanelsCount = Object.keys(panels).length;

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b-2 border-blue-500 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Settings size={18} className="text-blue-400" />
          <span className="text-white font-semibold">Dashboard Layout Editor</span>
        </div>
        <div className="text-xs text-gray-400">
          {visiblePanelsCount} / {totalPanelsCount} panels visible
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isEditMode ? (
          <>
            <button
              onClick={() => {
                saveLayout();
                setIsEditMode(false);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm"
            >
              <Play size={14} /> Exit Edit Mode
            </button>
            <button
              onClick={saveLayout}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
            >
              <Save size={14} /> Save Layout
            </button>
            <button
              onClick={resetLayout}
              className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
              title="Reset to default layout"
            >
              <RotateCcw size={14} />
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditMode(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm"
          >
            <Settings size={14} /> Edit Layout
          </button>
        )}
      </div>
    </div>
  );
};

export const LayoutEditorContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isEditMode } = useLayout();

  if (isEditMode) {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <div className="absolute inset-0 overflow-auto">
          <div className="relative w-full h-full min-h-screen" style={{ perspective: '1000px' }}>
            {children}
          </div>
        </div>
      </div>
    );
  }

  return <div className="w-full h-full">{children}</div>;
};
