'use client';

import React from 'react';
import { Clock, ThumbsUp, Plus } from 'lucide-react';

export const OrdersSection: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-3 h-full">
      <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col overflow-y-auto">
        <div className="flex items-center gap-2 mb-2">
          <Clock size={14} className="text-gray-500" />
          <p className="text-xs font-bold text-gray-900">Previous Order</p>
        </div>
        <p className="text-xs text-gray-400 mb-2">21 May 2025, 09:12</p>
        <div className="space-y-1 mb-2 flex-1">
          <label className="flex items-center justify-between text-xs cursor-pointer">
            <span className="flex items-center gap-2 text-gray-700">
              <input type="checkbox" className="w-2.5 h-2.5 rounded border-gray-300" />
              Large Latte
            </span>
            <span className="text-gray-700 font-medium">£3.35</span>
          </label>
          <label className="flex items-center justify-between text-xs cursor-pointer">
            <span className="flex items-center gap-2 text-gray-700">
              <input type="checkbox" className="w-2.5 h-2.5 rounded border-gray-300" />
              Blueberry Muffin
            </span>
            <span className="text-gray-700 font-medium">£2.45</span>
          </label>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 pt-1 mb-2">
          <span className="text-xs font-bold text-gray-900">Total</span>
          <span className="text-xs font-bold text-gray-900">£5.80</span>
        </div>
        <button className="w-full bg-white border border-gray-300 text-gray-700 text-xs font-semibold py-1 rounded hover:bg-gray-50">
          View History
        </button>
      </div>
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex flex-col overflow-y-auto">
        <div className="flex items-center gap-2 mb-2">
          <ThumbsUp size={14} className="text-emerald-600" />
          <p className="text-xs font-bold text-gray-900">Suggested</p>
        </div>
        <p className="text-xs text-gray-500 mb-2">Based on history</p>
        <div className="space-y-1 mb-2 flex-1">
          <label className="flex items-center justify-between text-xs cursor-pointer">
            <span className="flex items-center gap-2 text-gray-700">
              <input type="checkbox" className="w-2.5 h-2.5 rounded border-gray-300" />
              Large Latte
            </span>
            <span className="text-gray-700 font-medium">£3.35</span>
          </label>
          <label className="flex items-center justify-between text-xs cursor-pointer">
            <span className="flex items-center gap-2 text-gray-700">
              <input type="checkbox" className="w-2.5 h-2.5 rounded border-gray-300" />
              Blueberry Muffin
            </span>
            <span className="text-gray-700 font-medium">£2.45</span>
          </label>
          <label className="flex items-center justify-between text-xs cursor-pointer">
            <span className="flex items-center gap-2 text-gray-700">
              <input type="checkbox" className="w-2.5 h-2.5 rounded border-gray-300" />
              Oat Milk
            </span>
            <span className="text-gray-700 font-medium">£0.60</span>
          </label>
        </div>
        <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-1.5 rounded-full flex items-center justify-center gap-1">
          <Plus size={12} /> Add All
        </button>
      </div>
    </div>
  );
};
