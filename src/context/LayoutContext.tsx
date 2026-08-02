import React, { createContext, useContext, useState, useCallback } from 'react';

export interface PanelLayout {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  zIndex: number;
  minWidth: number;
  minHeight: number;
}

interface LayoutContextType {
  isEditMode: boolean;
  setIsEditMode: (mode: boolean) => void;
  panels: Record<string, PanelLayout>;
  updatePanel: (id: string, updates: Partial<PanelLayout>) => void;
  resetLayout: () => void;
  saveLayout: () => void;
  loadLayout: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

const DEFAULT_PANELS: Record<string, PanelLayout> = {
  'vehicle-card': {
    id: 'vehicle-card',
    title: 'Vehicle Card',
    x: 0,
    y: 0,
    width: 50,
    height: 40,
    visible: true,
    zIndex: 1,
    minWidth: 30,
    minHeight: 30,
  },
  'customers': {
    id: 'customers',
    title: 'Customers',
    x: 0,
    y: 40,
    width: 50,
    height: 30,
    visible: true,
    zIndex: 2,
    minWidth: 30,
    minHeight: 20,
  },
  'notes-loyalty': {
    id: 'notes-loyalty',
    title: 'Notes & Loyalty',
    x: 0,
    y: 70,
    width: 50,
    height: 30,
    visible: true,
    zIndex: 3,
    minWidth: 30,
    minHeight: 20,
  },
  'orders': {
    id: 'orders',
    title: 'Previous & Suggested Orders',
    x: 0,
    y: 100,
    width: 50,
    height: 30,
    visible: true,
    zIndex: 4,
    minWidth: 30,
    minHeight: 20,
  },
  'camera': {
    id: 'camera',
    title: 'Live Camera',
    x: 50,
    y: 0,
    width: 50,
    height: 50,
    visible: true,
    zIndex: 5,
    minWidth: 30,
    minHeight: 30,
  },
  'detected-plates': {
    id: 'detected-plates',
    title: 'Detected Plates',
    x: 50,
    y: 50,
    width: 50,
    height: 15,
    visible: true,
    zIndex: 6,
    minWidth: 30,
    minHeight: 15,
  },
  'lane-status': {
    id: 'lane-status',
    title: 'Lane Status',
    x: 50,
    y: 65,
    width: 25,
    height: 35,
    visible: true,
    zIndex: 7,
    minWidth: 20,
    minHeight: 20,
  },
  'top-items': {
    id: 'top-items',
    title: 'Top Items',
    x: 75,
    y: 65,
    width: 25,
    height: 35,
    visible: true,
    zIndex: 8,
    minWidth: 20,
    minHeight: 20,
  },
  'recognition': {
    id: 'recognition',
    title: 'Recognition Confidence',
    x: 50,
    y: 100,
    width: 50,
    height: 10,
    visible: true,
    zIndex: 9,
    minWidth: 40,
    minHeight: 10,
  },
};

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [panels, setPanels] = useState<Record<string, PanelLayout>>(() => {
    const saved = localStorage.getItem('dashboard-layout');
    return saved ? JSON.parse(saved) : DEFAULT_PANELS;
  });

  const updatePanel = useCallback((id: string, updates: Partial<PanelLayout>) => {
    setPanels((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...updates },
    }));
  }, []);

  const resetLayout = useCallback(() => {
    setPanels(DEFAULT_PANELS);
    localStorage.removeItem('dashboard-layout');
  }, []);

  const saveLayout = useCallback(() => {
    localStorage.setItem('dashboard-layout', JSON.stringify(panels));
  }, [panels]);

  const loadLayout = useCallback(() => {
    const saved = localStorage.getItem('dashboard-layout');
    if (saved) {
      setPanels(JSON.parse(saved));
    }
  }, []);

  return (
    <LayoutContext.Provider value={{ isEditMode, setIsEditMode, panels, updatePanel, resetLayout, saveLayout, loadLayout }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within LayoutProvider');
  }
  return context;
};
