'use client';

import React from 'react';
import { Vehicle } from '@/lib/supabase';
import { Car, Car as CarIcon } from 'lucide-react';

interface DetectedPlatesSectionProps {
  vehicle: Vehicle | null;
  time: string;
}

export const DetectedPlatesSection: React.FC<DetectedPlatesSectionProps> = ({ vehicle, time }) => {
  return (
    <div className="bg-blue-600 rounded-xl overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Car size={14} className="text-white" />
          <p className="text-white font-bold text-xs">Detected Plates</p>
        </div>
        <span className="bg-white text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">1 New</span>
      </div>
      <div className="bg-white mx-1 mb-1 rounded-lg px-3 py-2 flex items-center justify-between flex-1 overflow-y-auto">
        <span className="font-bold text-gray-900 text-sm">{(vehicle?.plate || 'AB12 CDE').toUpperCase()}</span>
        <span className="text-gray-400 text-xs">{time}</span>
      </div>
    </div>
  );
};
