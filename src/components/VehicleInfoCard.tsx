'use client';

import { Vehicle } from '@/lib/supabase';

interface VehicleInfoCardProps {
  vehicle: Vehicle;
  onCaptureSnapshot?: () => void;
}

export function VehicleInfoCard({ vehicle, onCaptureSnapshot }: VehicleInfoCardProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-100 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-[1.15fr_0.85fr] gap-3 items-stretch">
        {/* Left Column - Plate & Vehicle Details */}
        <div className="flex flex-col gap-3 min-w-0">
          <div className="flex justify-center md:justify-start">
            <PlateSvg plate={vehicle.plate} />
          </div>

          <div className="grid grid-cols-2 gap-2 bg-white/70 rounded-lg border border-white/60 p-2.5">
            <Detail label="Make" value={vehicle.make} />
            <Detail label="Model" value={vehicle.model} />
            <Detail label="Colour" value={vehicle.colour} />
            <Detail label="Year" value={`${vehicle.year}`} />
          </div>
        </div>

        {/* Right Column - Stored Vehicle Snapshot */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="bg-gray-200 rounded-lg border-2 border-gray-300 flex-1 min-h-[170px] overflow-hidden flex items-center justify-center shadow-inner">
            {vehicle.image_url ? (
              <img
                src={vehicle.image_url}
                alt="Vehicle Snapshot"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4">
                <div className="w-14 h-14 rounded-full bg-gray-100 mx-auto mb-3 flex items-center justify-center text-gray-500 text-2xl">
                  📷
                </div>
                <p className="text-gray-600 text-sm font-semibold mb-3">No Image Stored</p>
                <button
                  onClick={onCaptureSnapshot}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-xs font-semibold hover:bg-blue-700 shadow-sm"
                >
                  Capture &amp; Save
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 text-center">Stored Reference</p>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-md border border-gray-200 px-2.5 py-2">
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
    </div>
  );
}

function PlateSvg({ plate }: { plate: string }) {
  return (
    <svg width="520" height="92" viewBox="0 0 520 92" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="518" height="90" rx="12" fill="#F4D03F" />
      <rect x="1" y="1" width="518" height="90" rx="12" fill="none" stroke="#111111" strokeWidth="2.5" />
      <rect x="8" y="8" width="64" height="76" rx="5" fill="#003DA5" stroke="#111111" strokeWidth="1.5" />

      <circle cx="24" cy="18" r="1.8" fill="#FFD700" />
      <circle cx="32" cy="18" r="1.8" fill="#FFD700" />
      <circle cx="38" cy="24" r="1.8" fill="#FFD700" />
      <circle cx="40" cy="33" r="1.8" fill="#FFD700" />
      <circle cx="36" cy="43" r="1.8" fill="#FFD700" />
      <circle cx="28" cy="46" r="1.8" fill="#FFD700" />
      <circle cx="19" cy="43" r="1.8" fill="#FFD700" />
      <circle cx="15" cy="33" r="1.8" fill="#FFD700" />
      <circle cx="17" cy="24" r="1.8" fill="#FFD700" />
      <circle cx="28" cy="31" r="1.8" fill="#FFD700" />

      <text x="30" y="64" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">
        GB
      </text>

      <text
        x="288"
        y="62"
        fontFamily="'Arial Black', Arial, sans-serif"
        fontSize="54"
        fontWeight="900"
        fill="#000000"
        textAnchor="middle"
        letterSpacing="2"
      >
        {plate.toUpperCase()}
      </text>
    </svg>
  );
}