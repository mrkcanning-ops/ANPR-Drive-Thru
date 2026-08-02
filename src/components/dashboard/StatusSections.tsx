'use client';

import React from 'react';
import { Car, Cpu } from 'lucide-react';

export const LaneStatusSection: React.FC = () => {
  return (
    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Car size={14} className="text-emerald-600" />
          <p className="text-xs font-bold text-gray-900">Lane Status</p>
        </div>
        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
      </div>
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Lane 1</span>
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>Online
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Lane 2</span>
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>Online
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Lane 3</span>
          <span className="flex items-center gap-1 text-gray-400 font-semibold">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>Offline
          </span>
        </div>
      </div>
    </div>
  );
};

export const TopItemsSection: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 h-full overflow-y-auto">
      <p className="text-xs font-bold text-gray-900 mb-2">
        Top Items <span className="text-xs font-normal text-gray-400">(Today)</span>
      </p>
      <div className="space-y-1 text-xs">
        {[
          { label: 'Large Latte', value: 42 },
          { label: 'Cappuccino', value: 31 },
          { label: 'Caramel Latte', value: 27 },
          { label: 'Flat White', value: 24 },
          { label: 'Americano', value: 21 },
        ].map((item, i) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-gray-700">{i + 1}. {item.label}</span>
            <span className="text-gray-900 font-semibold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const RecognitionConfidenceSection: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-2 h-full overflow-hidden">
      <div className="flex items-center gap-2 flex-shrink-0">
        <Cpu size={14} className="text-gray-500" />
        <p className="text-xs font-bold text-gray-900 whitespace-nowrap">Confidence</p>
      </div>
      <span className="text-emerald-600 font-bold text-xs flex-shrink-0">98%</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98%' }}></div>
      </div>
      <span className="text-gray-400 text-xs flex-shrink-0">Excellent</span>
    </div>
  );
};
