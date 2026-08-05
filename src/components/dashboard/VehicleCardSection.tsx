'use client';

import React from 'react';
import { Vehicle, VehicleCustomer, Customer } from '@/lib/supabase';
import { Car, Palette, Calendar, ImageOff, Camera } from 'lucide-react';

interface VehicleCardSectionProps {
  vehicle: Vehicle | null;
  onStoreImage?: () => void;
}

export const VehicleCardSection: React.FC<VehicleCardSectionProps> = ({ vehicle, onStoreImage }) => {
  if (!vehicle) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 h-full overflow-y-auto flex flex-col items-center justify-center gap-4">
        <Car size={48} className="text-gray-300" />
        <div className="text-center">
          <p className="text-gray-500 font-semibold">No Vehicle Detected</p>
          <p className="text-sm text-gray-400">Waiting for license plate recognition</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 h-full overflow-y-auto">
      {/* Plate + Photo Row */}
      <div className="flex gap-3 mb-4">
        <div className="flex-[2] flex items-center">
          <svg className="w-full h-auto" viewBox="0 0 560 200" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="558" height="198" rx="14" ry="14" fill="#F4D03F" />
            <rect x="1" y="1" width="558" height="198" rx="14" ry="14" fill="none" stroke="#000000" strokeWidth="3" />
            <rect x="10" y="10" width="80" height="180" rx="6" ry="6" fill="#003DA5" stroke="#000000" strokeWidth="1.5" />
            <circle cx="30" cy="34" r="2.4" fill="#FFD700" />
            <circle cx="42" cy="34" r="2.4" fill="#FFD700" />
            <circle cx="48" cy="46" r="2.4" fill="#FFD700" />
            <circle cx="50" cy="60" r="2.4" fill="#FFD700" />
            <circle cx="42" cy="72" r="2.4" fill="#FFD700" />
            <circle cx="30" cy="72" r="2.4" fill="#FFD700" />
            <circle cx="18" cy="68" r="2.4" fill="#FFD700" />
            <circle cx="14" cy="56" r="2.4" fill="#FFD700" />
            <circle cx="18" cy="42" r="2.4" fill="#FFD700" />
            <circle cx="36" cy="52" r="2.4" fill="#FFD700" />
            <circle cx="36" cy="34" r="2.4" fill="#FFD700" />
            <circle cx="36" cy="72" r="2.4" fill="#FFD700" />
            <text x="50" y="130" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">
              GB
            </text>
            <text x="325" y="128" fontFamily="'Arial Black', Arial, sans-serif" fontSize="80" fontWeight="900" fill="#000000" textAnchor="middle" letterSpacing="2">
              {(vehicle?.plate || 'AB12 CDE').toUpperCase()}
            </text>
          </svg>
        </div>
        <div className="flex-[3] relative rounded-xl overflow-hidden bg-gray-900 min-h-[140px] sm:min-h-[180px]">
          {vehicle?.image_url ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={vehicle.image_url}
                alt="Stored vehicle photo"
                className="w-full h-full object-cover absolute inset-0"
              />
              <span className="absolute bottom-2 left-2 bg-black/70 text-white text-sm sm:text-base font-bold px-2 py-1 rounded">
                {(vehicle?.plate || 'AB12 CDE').toUpperCase()}
              </span>
              {onStoreImage && (
                <button
                  onClick={onStoreImage}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-xs font-semibold px-2 py-1 rounded flex items-center gap-1"
                >
                  <Camera size={12} /> Update
                </button>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-500 bg-gray-100 absolute inset-0 px-3 text-center">
              <ImageOff size={26} />
              <p className="text-xs text-gray-500">No stored image for this vehicle</p>
              {onStoreImage && (
                <button
                  onClick={onStoreImage}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1"
                >
                  <Camera size={12} /> Store Vehicle Image
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Specs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
