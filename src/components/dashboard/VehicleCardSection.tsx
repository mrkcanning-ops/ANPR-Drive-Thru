'use client';

import React from 'react';
import { Vehicle, VehicleCustomer, Customer } from '@/lib/supabase';
import { Car, Palette, Calendar } from 'lucide-react';

interface VehicleCardSectionProps {
  vehicle: Vehicle | null;
}

export const VehicleCardSection: React.FC<VehicleCardSectionProps> = ({ vehicle }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 h-full overflow-y-auto">
      {/* Plate + Snapshot Row */}
      <div className="flex gap-3 mb-4">
        <div className="flex-[2]">
          <svg className="w-full h-auto" viewBox="0 0 560 80" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="558" height="78" rx="12" ry="12" fill="#F4D03F" />
            <rect x="1" y="1" width="558" height="78" rx="12" ry="12" fill="none" stroke="#000000" strokeWidth="2.5" />
            <rect x="8" y="8" width="62" height="64" rx="5" ry="5" fill="#003DA5" stroke="#000000" strokeWidth="1.5" />
            <circle cx="24" cy="16" r="1.8" fill="#FFD700" />
            <circle cx="32" cy="16" r="1.8" fill="#FFD700" />
            <circle cx="36" cy="22" r="1.8" fill="#FFD700" />
            <circle cx="37" cy="30" r="1.8" fill="#FFD700" />
            <circle cx="32" cy="40" r="1.8" fill="#FFD700" />
            <circle cx="24" cy="40" r="1.8" fill="#FFD700" />
            <circle cx="16" cy="38" r="1.8" fill="#FFD700" />
            <circle cx="14" cy="30" r="1.8" fill="#FFD700" />
            <circle cx="16" cy="22" r="1.8" fill="#FFD700" />
            <circle cx="28" cy="28" r="1.8" fill="#FFD700" />
            <circle cx="28" cy="16" r="1.8" fill="#FFD700" />
            <circle cx="28" cy="40" r="1.8" fill="#FFD700" />
            <text x="28" y="58" fontFamily="Arial, sans-serif" fontSize="13" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">
              GB
            </text>
            <text x="290" y="56" fontFamily="'Arial Black', Arial, sans-serif" fontSize="68" fontWeight="900" fill="#000000" textAnchor="middle" letterSpacing="2">
              {vehicle?.plate || 'AB12 CDE'}
            </text>
          </svg>
        </div>
      </div>

      {/* Vehicle Specs Bar */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Car size={14} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Make</p>
            <p className="text-sm font-semibold text-gray-900 truncate">{vehicle?.make || '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Car size={14} className="text-gray-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Model</p>
            <p className="text-sm font-semibold text-gray-900 truncate">{vehicle?.model || '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Palette size={14} className="text-gray-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Colour</p>
            <p className="text-sm font-semibold text-gray-900 flex items-center gap-1 truncate">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: vehicle?.colour?.toLowerCase() || '#ccc' }}
              ></span>
              {vehicle?.colour || '—'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Calendar size={14} className="text-gray-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Year</p>
            <p className="text-sm font-semibold text-gray-900 truncate">{vehicle?.year || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
