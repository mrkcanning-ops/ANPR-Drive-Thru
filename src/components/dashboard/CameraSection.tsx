'use client';

import React from 'react';
import { WebRTCVideo } from '@/app/components/WebRTCVideo';
import { Radio, Maximize2, Camera } from 'lucide-react';

export const CameraSection: React.FC = () => {
  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 flex-shrink-0">
        <p className="text-white font-bold text-xs">Live Camera – Lane 1</p>
        <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded-full">
          <Radio size={10} /> Live
        </span>
      </div>
      <div className="relative flex-1 bg-black overflow-hidden">
        <WebRTCVideo />
        <span className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded z-10">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span> Live
        </span>
        <div className="absolute bottom-2 right-2 flex gap-1 z-10">
          <button className="bg-black/60 text-white p-1 rounded hover:bg-black/80">
            <Maximize2 size={12} />
          </button>
          <button className="bg-black/60 text-white p-1 rounded hover:bg-black/80">
            <Camera size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
