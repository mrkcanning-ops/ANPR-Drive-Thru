'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { Vehicle, Customer, VehicleCustomer } from '@/lib/supabase';

interface PlateRecognitionModalProps {
  isOpen: boolean;
  plate: string;
  vehicle: Vehicle | null;
  vehicleCustomers: (VehicleCustomer & { customer: Customer })[];
  selectedCustomer: Customer | null;
  availableCustomers: Customer[];
  onClose: () => void;
  onSelectCustomer: (customer: Customer) => void;
  onAddVehicle: (plate: string, customerName: string, vehicleInfo: string) => Promise<void>;
  isLoading?: boolean;
  vehicleData?: {
    make?: string;
    model?: string;
    color?: string;
    type?: string;
    year?: string;
  };
}

export const PlateRecognitionModal: React.FC<PlateRecognitionModalProps> = ({
  isOpen,
  plate,
  vehicle,
  vehicleCustomers,
  selectedCustomer,
  availableCustomers,
  onClose,
  onSelectCustomer,
  onAddVehicle,
  isLoading = false,
  vehicleData,
}) => {
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newVehicleInfo, setNewVehicleInfo] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Auto-populate vehicle info when modal opens or vehicleData changes
  useEffect(() => {
    if (isOpen && vehicleData) {
      const vehicleDescription = [
        vehicleData.color,
        vehicleData.year,
        vehicleData.make,
        vehicleData.model,
      ]
        .filter(Boolean)
        .join(' ')
        .trim();
      
      if (vehicleDescription) {
        setNewVehicleInfo(vehicleDescription);
      }
    }
  }, [isOpen, vehicleData]);

  if (!isOpen) return null;

  const handleAddVehicle = async () => {
    if (!newCustomerName.trim()) {
      alert('Please enter a driver name');
      return;
    }

    setIsSaving(true);
    try {
      await onAddVehicle(plate, newCustomerName, newVehicleInfo);
      setShowAddVehicle(false);
      setNewCustomerName('');
      setNewVehicleInfo('');
      onClose();
    } catch (error) {
      console.error('Error adding vehicle:', error);
      alert('Failed to add vehicle');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">License Plate Detected</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={isSaving}
          >
            <X size={24} />
          </button>
        </div>

        {/* Plate Display */}
        <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg px-4 py-3 mb-6 text-center">
          <p className="text-sm text-gray-600">Registration Number</p>
          <p className="text-3xl font-bold text-gray-900 tracking-wider">{plate}</p>
        </div>

        {/* Content */}
        {!showAddVehicle ? (
          <>
            {vehicle && vehicleCustomers.length > 0 ? (
              // Vehicle exists - Show "Likely Driver" buttons
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <p className="text-sm font-medium text-gray-600">Vehicle on System</p>
                </div>

                <p className="text-sm font-medium text-gray-700 mb-3">
                  Select Driver
                </p>
                
                <div className="grid grid-cols-1 gap-2 mb-4">
                  {vehicleCustomers.map((vc) => (
                    <button
                      key={vc.customer.id}
                      onClick={() => onSelectCustomer(vc.customer)}
                      className={`w-full px-4 py-3 rounded-lg font-medium text-sm transition ${
                        selectedCustomer?.id === vc.customer.id
                          ? 'bg-blue-600 text-white border-2 border-blue-700'
                          : 'bg-gray-100 text-gray-900 border-2 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{vc.customer.name}</span>
                        {vc.primary_driver && (
                          <span className="text-xs bg-white/20 px-2 py-0.5 rounded">Primary</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowAddVehicle(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition mb-3"
                >
                  <Plus size={18} />
                  Add Another Driver
                </button>

                <button
                  onClick={onClose}
                  className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  disabled={!selectedCustomer || isSaving}
                >
                  Confirm
                </button>
              </div>
            ) : (
              // Vehicle not found - Show "Add Vehicle & Driver" option
              <div>
                <div className="mb-4 flex items-center gap-2 text-amber-600">
                  <AlertCircle size={20} />
                  <p className="text-sm font-medium">Vehicle Not on System</p>
                </div>

                <p className="text-sm text-gray-600 mb-6">
                  This registration is not recognized. Would you like to add it to the system?
                </p>

                <button
                  onClick={() => setShowAddVehicle(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition mb-3"
                >
                  <Plus size={18} />
                  Add Vehicle & Driver
                </button>

                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Skip
                </button>
              </div>
            )}
          </>
        ) : (
          // Add Vehicle Form
          <div>
            <p className="text-sm text-gray-600 mb-4">Add this vehicle and driver to the system</p>

            {vehicleData && (vehicleData.make || vehicleData.model || vehicleData.color) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-500 mb-1">Detected Vehicle Info</p>
                <p className="text-sm font-medium text-gray-900">
                  {[vehicleData.color, vehicleData.year, vehicleData.make, vehicleData.model]
                    .filter(Boolean)
                    .join(' ')}
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Driver Name *
              </label>
              <input
                type="text"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                placeholder="e.g., John Smith"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSaving}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Details (auto-detected)
              </label>
              <input
                type="text"
                value={newVehicleInfo}
                onChange={(e) => setNewVehicleInfo(e.target.value)}
                placeholder="e.g., Blue Ford Focus"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSaving}
              />
              {vehicleData && (vehicleData.make || vehicleData.model) && (
                <p className="text-xs text-green-600 mt-1">ℹ️ Auto-filled from camera detection</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowAddVehicle(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                disabled={isSaving}
              >
                Back
              </button>
              <button
                onClick={handleAddVehicle}
                className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                disabled={isSaving || !newCustomerName.trim()}
              >
                {isSaving ? 'Saving...' : 'Add'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
