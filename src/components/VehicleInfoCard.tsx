'use client';

import { Vehicle } from '@/lib/supabase';

interface VehicleInfoCardProps {
  vehicle: Vehicle;
  onCaptureSnapshot?: () => void;
}

export function VehicleInfoCard({ vehicle, onCaptureSnapshot }: VehicleInfoCardProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded p-3 mb-3">
      <div className="grid grid-cols-2 gap-3">
        {/* Left Column - Registration Plate & Details */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-center">
            <PlateSvg plate={vehicle.plate} />
          </div>

          <div className="space-y-1 text-sm">
            <p className="text-gray-700">
              <span className="font-semibold">Make:</span> {vehicle.make}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Model:</span> {vehicle.model}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Colour:</span> {vehicle.colour}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Year:</span> {vehicle.year}
            </p>
          </div>
        </div>

        {/* Right Column - Stored Vehicle Snapshot Image */}
        <div className="flex flex-col gap-2">
          <div className="bg-gray-200 rounded border-2 border-gray-400 flex-1 min-h-32 overflow-hidden flex items-center justify-center">
            {vehicle.image_url ? (
              <img
                src={vehicle.image_url}
                alt="Vehicle Snapshot"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4">
                <p className="text-gray-600 text-sm font-semibold mb-3">📷 No Image Stored</p>
                <button
                  onClick={onCaptureSnapshot}
                  className="bg-blue-600 text-white px-3 py-2 rounded text-xs font-semibold hover:bg-blue-700"
                >
                  📸 Capture &amp; Save
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

function PlateSvg({ plate }: { plate: string }) {
  return (
    <svg width="560" height="80" viewBox="0 0 560 80" xmlns="http://www.w3.org/2000/svg">
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
      <text
        x="290"
        y="56"
        fontFamily="'Arial Black', Arial, sans-serif"
        fontSize="68"
        fontWeight="900"
        fill="#000000"
        textAnchor="middle"
        letterSpacing="2"
      >
        {plate}
      </text>
    </svg>
  );
}