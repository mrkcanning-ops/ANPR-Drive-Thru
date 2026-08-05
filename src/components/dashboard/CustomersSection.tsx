'use client';

import React from 'react';
import { VehicleCustomer, Customer } from '@/lib/supabase';
import { Users, User, Phone, Mail } from 'lucide-react';

interface CustomersSectionProps {
  vehicleCustomers: (VehicleCustomer & { customer: Customer })[];
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer) => void;
}

export const CustomersSection: React.FC<CustomersSectionProps> = ({ vehicleCustomers, selectedCustomer, onSelectCustomer }) => {
  return (
    <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-purple-600" />
          <p className="text-sm font-bold text-gray-900">Customers Using This Vehicle</p>
        </div>
        <span className="bg-purple-200 text-purple-700 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
          {vehicleCustomers.length}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {vehicleCustomers.map((vc) => (
          <div
            key={vc.id}
            onClick={() => onSelectCustomer(vc.customer)}
            className={`bg-white rounded-lg border p-3 cursor-pointer transition-all ${
              selectedCustomer?.id === vc.customer?.id ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-100 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-purple-600">
                {vc.customer?.customer_number}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{vc.customer?.name}</p>
                <p className={`text-xs font-medium ${vc.primary_driver ? 'text-purple-600' : 'text-gray-500'}`}>
                  {vc.primary_driver ? 'Primary Driver' : 'Family Member'}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
              <Phone size={11} /> {vc.customer?.phone || '—'}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
              <Mail size={11} /> {vc.customer?.email || '—'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
