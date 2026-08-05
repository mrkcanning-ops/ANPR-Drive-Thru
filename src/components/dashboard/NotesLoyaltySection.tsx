'use client';

import React from 'react';
import { FileText, Star, Plus, Clock, ThumbsUp } from 'lucide-react';
import { Customer } from '@/lib/supabase';

interface NotesLoyaltySectionProps {
  selectedCustomer: Customer | null;
}

export const NotesLoyaltySection: React.FC<NotesLoyaltySectionProps> = ({ selectedCustomer }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-full">
      <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex flex-col flex-1 overflow-y-auto">
        <div className="flex items-center gap-2 mb-2">
          <FileText size={14} className="text-orange-500" />
          <p className="text-xs font-bold text-gray-900">Customer Notes</p>
        </div>
        <ul className="text-xs text-gray-700 space-y-1 mb-2 list-disc list-inside flex-1">
          <li>Regular morning visitor</li>
          <li>Prefers oat milk</li>
          <li>No sugar in hot drinks</li>
        </ul>
        <button className="self-end bg-white border border-orange-300 text-orange-600 text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
          <Plus size={10} /> Add Note
        </button>
      </div>
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <Star size={14} className="text-amber-500" />
          <p className="text-xs font-bold text-gray-900">Loyalty Status</p>
        </div>
        <p className="text-amber-600 font-bold text-sm mb-2">Gold Member</p>
        <div className="flex items-center justify-between gap-2 text-xs">
          <div>
            <p className="text-gray-500">Points Balance</p>
            <p className="font-bold text-gray-900">{selectedCustomer?.loyalty_points ?? 0} pts</p>
          </div>
          <div>
            <p className="text-gray-500">Visits</p>
            <p className="font-bold text-gray-900">28</p>
          </div>
          <button className="bg-white border border-gray-300 text-gray-700 text-xs font-semibold px-2 py-1 rounded">
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
};
