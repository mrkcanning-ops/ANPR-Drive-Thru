'use client';

import { useEffect, useState } from 'react';
import { supabase, Order, DailyStats, Vehicle, Customer, VehicleCustomer } from '@/lib/supabase';
import { Sidebar } from '@/components/Sidebar';
import { BottomNav } from '@/components/BottomNav';
import { DraggablePanel } from '@/components/DraggablePanel';
import { LayoutProvider, useLayout } from '@/context/LayoutContext';
import { LayoutEditorToolbar, LayoutEditorContainer } from '@/components/LayoutEditorToolbar';
import { VehicleCardSection } from '@/components/dashboard/VehicleCardSection';
import { CustomersSection } from '@/components/dashboard/CustomersSection';
import { NotesLoyaltySection } from '@/components/dashboard/NotesLoyaltySection';
import { OrdersSection } from '@/components/dashboard/OrdersSection';
import { CameraSection } from '@/components/dashboard/CameraSection';
import { DetectedPlatesSection } from '@/components/dashboard/DetectedPlatesSection';
import { LaneStatusSection, TopItemsSection, RecognitionConfidenceSection } from '@/components/dashboard/StatusSections';
import { Radio } from 'lucide-react';

const recentArrivals = [
  { time: '10:24:31', plate: 'AB12 CDE' },
  { time: '10:24:19', plate: 'YX20 LBU' },
  { time: '10:24:05', plate: 'GF19 OMM' },
  { time: '10:23:52', plate: 'HJ68 VKT' },
  { time: '10:23:41', plate: 'NU21 ZPT' },
  { time: '10:23:29', plate: 'SL18 KXR' },
  { time: '10:23:17', plate: 'BD66 YHW' },
  { time: '10:23:06', plate: 'WV12 XPL' },
];

function DashboardContent() {
  const { isEditMode } = useLayout();
  
  const [time, setTime] = useState<string>('');
  const [cameraRefresh, setCameraRefresh] = useState<number>(0);
  const [detectedPlates, setDetectedPlates] = useState<any[]>([]);
  const [anprProcessing, setAnprProcessing] = useState(false);
  const [lastAnprTime, setLastAnprTime] = useState(0);
  const [currentVehicle, setCurrentVehicle] = useState({ plate: 'AB12 CDE', name: 'John Smith', time: '14 sec', status: 'serving', statusLabel: 'Ordering', car: 'Blue Ford Focus', points: 240 });
  
  // New state for multi-customer vehicle support
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [vehicleCustomers, setVehicleCustomers] = useState<(VehicleCustomer & { customer: Customer })[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [availableCustomers, setAvailableCustomers] = useState<Customer[]>([]);
  
  const [stats, setStats] = useState({
    activeOrders: 0,
    totalOrders: 0,
    revenue: 0,
    avgOrderTime: 0,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Update time display
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Refresh camera snapshot every 100ms (10 fps)
  useEffect(() => {
    const cameraInterval = setInterval(() => {
      setCameraRefresh(prev => {
        const newValue = prev + 1;
        // Run ANPR processing every 20 frames (0.5 fps at 100ms = 2 sec processing)
        // This prevents rate limiting on Plate Recognizer API (free tier limit)
        if (newValue % 20 === 0 && !anprProcessing) {
          processAnpr();
        }
        return newValue;
      });
    }, 100);
    return () => clearInterval(cameraInterval);
  }, [anprProcessing]);

  useEffect(() => {
    fetchDashboardData();
    fetchVehicleData('AB12 CDE'); // Load first vehicle on mount
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ANPR processing function - runs at 1 fps (every 10 frames at 100ms)
  const processAnpr = async () => {
    setAnprProcessing(true);
    try {
      const response = await fetch('/api/anpr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: `/api/camera?t=${cameraRefresh}`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.plates && data.plates.length > 0) {
          setDetectedPlates(data.plates);
          // Auto-select the highest confidence plate
          const topPlate = data.plates.reduce((max: any, plate: any) =>
            (plate.confidence > max.confidence) ? plate : max
          );
          if (topPlate?.plate) {
            fetchVehicleData(topPlate.plate);
          }
        }
      }
    } catch (error) {
      console.error('ANPR processing error:', error);
    } finally {
      setAnprProcessing(false);
      setLastAnprTime(Date.now());
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch active orders
      const { data: activeOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .in('status', ['pending', 'preparing'])
        .order('created_at', { ascending: false })
        .limit(4);

      if (ordersError) throw ordersError;

      setOrders(activeOrders || []);

      // Calculate stats
      const totalOrders = activeOrders?.length || 0;
      const revenue = activeOrders?.reduce((sum, order) => sum + order.total_price, 0) || 0;

      setStats({
        activeOrders: activeOrders?.filter((o) => o.status === 'pending').length || 0,
        totalOrders: totalOrders,
        revenue: revenue,
        avgOrderTime: 8.5,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch vehicle details and linked customers
  const fetchVehicleData = async (plate: string) => {
    try {
      // Fetch vehicle by plate
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('plate', plate)
        .single();

      if (vehicleError) {
        console.error('Error fetching vehicle:', vehicleError);
        return;
      }

      setVehicle(vehicleData);

      // Fetch customers linked to this vehicle
      const { data: customersData, error: customersError } = await supabase
        .from('vehicle_customers')
        .select('*, customer:customer_id(*)')
        .eq('vehicle_id', vehicleData.id);

      if (customersError) {
        console.error('Error fetching vehicle customers:', customersError);
        return;
      }

      setVehicleCustomers(customersData || []);
      
      // Set first customer as selected (primary driver if available)
      const primaryDriver = customersData?.find(vc => vc.primary_driver);
      if (primaryDriver && primaryDriver.customer) {
        setSelectedCustomer(primaryDriver.customer);
      } else if (customersData && customersData.length > 0 && customersData[0].customer) {
        setSelectedCustomer(customersData[0].customer);
      }

      // Fetch all available customers for adding
      const { data: allCustomers } = await supabase
        .from('customers')
        .select('*');

      setAvailableCustomers(allCustomers || []);
    } catch (error) {
      console.error('Error fetching vehicle data:', error);
    }
  };

  // Add customer to vehicle
  const addCustomerToVehicle = async (customerId: string) => {
    if (!vehicle) return;
    
    try {
      const { error } = await supabase
        .from('vehicle_customers')
        .insert([
          {
            vehicle_id: vehicle.id,
            customer_id: customerId,
            relationship: 'shared',
            primary_driver: false,
          },
        ]);

      if (error) throw error;
      
      // Refresh vehicle customers
      await fetchVehicleData(vehicle.plate);
      setShowAddCustomer(false);
    } catch (error) {
      console.error('Error adding customer to vehicle:', error);
    }
  };

  // Remove customer from vehicle
  const removeCustomerFromVehicle = async (vehicleCustomerId: string) => {
    try {
      const { error } = await supabase
        .from('vehicle_customers')
        .delete()
        .eq('id', vehicleCustomerId);

      if (error) throw error;
      
      if (vehicle) {
        await fetchVehicleData(vehicle.plate);
      }
    } catch (error) {
      console.error('Error removing customer from vehicle:', error);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50 overflow-hidden pb-16 lg:pb-0">
      {/* Desktop Sidebar */}
      <Sidebar activeItem="Dashboard" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Layout Editor Toolbar */}
        <LayoutEditorToolbar />

        {/* Top Header Bar (Hidden in Edit Mode) */}
        {!isEditMode && (
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
              <span className="text-emerald-600 font-semibold text-sm">Lane 1 Online</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 border border-emerald-500 text-emerald-600 text-xs font-semibold px-3 py-1 rounded-full">
                <Radio size={12} /> Live
              </span>
              <span className="text-gray-900 font-semibold text-sm">{time}</span>
            </div>
          </div>
        )}

        {/* Timeline Strip (Hidden in Edit Mode) */}
        {!isEditMode && (
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
            <div className="flex gap-2 overflow-x-auto">
              {recentArrivals.map((item) => (
                <button
                  key={item.plate}
                  onClick={() => fetchVehicleData(item.plate)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg border-2 text-left transition-colors ${
                    vehicle?.plate === item.plate ? 'border-emerald-500' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="text-xs text-gray-400">{item.time}</p>
                  <p className="text-sm font-bold text-gray-900">{item.plate}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Layout Editor Container */}
        <LayoutEditorContainer>
          {isEditMode ? (
            <div className="relative w-full h-full p-4">
              <div className="relative w-full h-full min-h-screen">
                <DraggablePanel id="vehicle-card" title="Vehicle Card" className="bg-white">
                  <VehicleCardSection vehicle={vehicle} />
                </DraggablePanel>
                <DraggablePanel id="customers" title="Customers" className="bg-purple-50">
                  <CustomersSection vehicleCustomers={vehicleCustomers} selectedCustomer={selectedCustomer} onSelectCustomer={setSelectedCustomer} />
                </DraggablePanel>
                <DraggablePanel id="notes-loyalty" title="Notes & Loyalty" className="bg-gray-50">
                  <NotesLoyaltySection selectedCustomer={selectedCustomer} />
                </DraggablePanel>
                <DraggablePanel id="orders" title="Orders" className="bg-white">
                  <OrdersSection />
                </DraggablePanel>
                <DraggablePanel id="camera" title="Live Camera" className="bg-slate-900">
                  <CameraSection />
                </DraggablePanel>
                <DraggablePanel id="detected-plates" title="Detected Plates" className="bg-blue-600">
                  <DetectedPlatesSection vehicle={vehicle} time={time} />
                </DraggablePanel>
                <DraggablePanel id="lane-status" title="Lane Status" className="bg-emerald-50">
                  <LaneStatusSection />
                </DraggablePanel>
                <DraggablePanel id="top-items" title="Top Items" className="bg-white">
                  <TopItemsSection />
                </DraggablePanel>
                <DraggablePanel id="recognition" title="Recognition Confidence" className="bg-white">
                  <RecognitionConfidenceSection />
                </DraggablePanel>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* LEFT COLUMN */}
                <div className="space-y-4">
                  <DraggablePanel id="vehicle-card" title="Vehicle Card" className="bg-white">
                    <VehicleCardSection vehicle={vehicle} />
                  </DraggablePanel>
                  <DraggablePanel id="customers" title="Customers" className="bg-purple-50">
                    <CustomersSection vehicleCustomers={vehicleCustomers} selectedCustomer={selectedCustomer} onSelectCustomer={setSelectedCustomer} />
                  </DraggablePanel>
                  <DraggablePanel id="notes-loyalty" title="Notes & Loyalty" className="bg-gray-50">
                    <NotesLoyaltySection selectedCustomer={selectedCustomer} />
                  </DraggablePanel>
                  <DraggablePanel id="orders" title="Orders" className="bg-white">
                    <OrdersSection />
                  </DraggablePanel>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-4">
                  <DraggablePanel id="camera" title="Live Camera" className="bg-slate-900">
                    <CameraSection />
                  </DraggablePanel>
                  <DraggablePanel id="detected-plates" title="Detected Plates" className="bg-blue-600">
                    <DetectedPlatesSection vehicle={vehicle} time={time} />
                  </DraggablePanel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DraggablePanel id="lane-status" title="Lane Status" className="bg-emerald-50">
                      <LaneStatusSection />
                    </DraggablePanel>
                    <DraggablePanel id="top-items" title="Top Items" className="bg-white">
                      <TopItemsSection />
                    </DraggablePanel>
                  </div>
                  <DraggablePanel id="recognition" title="Recognition Confidence" className="bg-white">
                    <RecognitionConfidenceSection />
                  </DraggablePanel>
                </div>
              </div>
            </div>
          )}
        </LayoutEditorContainer>
      </main>

      {/* Bottom Navigation for Tablet/Mobile */}
      <BottomNav />
    </div>
  );
}

export default function Home() {
  return (
    <LayoutProvider>
      <DashboardContent />
    </LayoutProvider>
  );
}
