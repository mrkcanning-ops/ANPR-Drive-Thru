'use client';

import { useEffect, useState } from 'react';
import { supabase, Order, DailyStats, Vehicle, Customer, VehicleCustomer } from '@/lib/supabase';
import { Sidebar } from '@/components/Sidebar';
import { BottomNav } from '@/components/BottomNav';
import { WebRTCVideo } from '@/app/components/WebRTCVideo';
import { useAnprPolling } from '@/lib/useAnprPolling';
import { VehicleInfoCard } from '@/components/VehicleInfoCard';

interface RecentArrival {
  plate: string;
  detectedAt: number;
  name: string;
  car: string;
  points: number;
  status: 'serving' | 'completed' | 'left';
}

export default function Home() {
  const [time, setTime] = useState<string>('');
      const { detectedPlates, anprProcessing, anprError } = useAnprPolling({
    onPlateDetected: (plate) => {
      recordArrival(plate);
      fetchVehicleData(plate);
    },
  });
    const [currentVehicle, setCurrentVehicle] = useState({ plate: 'AB12 CDE', name: 'John Smith', time: '14 sec', status: 'serving', statusLabel: 'Ordering', car: 'Blue Ford Focus', points: 240 });
  const [recentArrivals, setRecentArrivals] = useState<RecentArrival[]>([]);
  
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



  const fetchDashboardData = async () => {
    try {
      // Fetch active orders
      const { data: activeOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .in('status', ['pending', 'ready'])
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

      // Add a new plate detection to the Recent Arrivals strip, marking any
  // previously "serving" entry as completed.
  const recordArrival = (plate: string) => {
    setRecentArrivals(prev => {
      const now = Date.now();
      const existingIndex = prev.findIndex(a => a.plate === plate);

      if (existingIndex !== -1) {
        const updated = prev.map((a, i) =>
          i === existingIndex
            ? { ...a, detectedAt: now, status: 'serving' as const }
            : { ...a, status: a.status === 'serving' ? ('completed' as const) : a.status }
        );
        return updated;
      }

      const newArrival: RecentArrival = {
        plate,
        detectedAt: now,
        name: 'Unknown',
        car: 'Unknown',
        points: 0,
        status: 'serving',
      };

      const demoted = prev.map(a =>
        a.status === 'serving' ? { ...a, status: 'completed' as const } : a
      );

      return [newArrival, ...demoted].slice(0, 5);
    });
  };

  // Format a timestamp as "X sec"/"X min" for display in Recent Arrivals.
  const formatTimeAgo = (timestamp: number) => {
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 60) return `${diffSec} sec`;
    const diffMin = Math.floor(diffSec / 60);
    return `${diffMin} min`;
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
      const matchedCustomer = primaryDriver?.customer
        ?? (customersData && customersData.length > 0 ? customersData[0].customer : null);

      if (matchedCustomer) {
        setSelectedCustomer(matchedCustomer);
      }

      // Enrich the matching Recent Arrivals entry now that we have real data
      setRecentArrivals(prev => prev.map(a =>
        a.plate === plate
          ? {
              ...a,
              name: matchedCustomer?.name || 'Unknown',
              car: `${vehicleData.colour} ${vehicleData.make} ${vehicleData.model}`,
              points: matchedCustomer?.loyalty_points || 0,
            }
          : a
      ));

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
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 pb-16 lg:pb-0">
      {/* Desktop Sidebar */}
      <Sidebar activeItem="Dashboard" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between flex-shrink-0">
          <div className="text-sm font-semibold text-gray-800">
            Lane 1 <span className="text-green-600">● Online</span>
          </div>
          <div className="text-sm font-semibold text-gray-800">
            {time} <span className="text-green-600">Live</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-3 overflow-hidden">
                {/* Recent Arrivals - Compact */}
          <div className="mb-2 flex-shrink-0">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {recentArrivals.length === 0 && (
                <p className="text-xs text-gray-400 py-2">Waiting for first plate detection…</p>
              )}
              {recentArrivals.map((arrival) => {
                const statusLabel =
                  arrival.status === 'serving' ? 'Ordering'
                  : arrival.status === 'completed' ? '✔ Served'
                  : 'Left';

                return (
                  <button
                    key={arrival.plate}
                    onClick={() => fetchVehicleData(arrival.plate)}
                    className={`flex-shrink-0 w-32 p-2 rounded border-2 text-xs transition-all cursor-pointer ${
                      arrival.status === 'serving'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    <p className="font-bold text-base text-gray-900 mb-1">{arrival.plate}</p>
                    <p className="text-gray-700 font-semibold text-xs truncate">{arrival.name}</p>
                    <p className={`text-xs mt-1 font-semibold ${
                      arrival.status === 'serving' ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {statusLabel}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">{formatTimeAgo(arrival.detectedAt)} ago</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Grid Layout - 5 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 flex-1 overflow-hidden">
            {/* Left/Middle Content - Scrollable */}
            <div className="lg:col-span-3 bg-white rounded shadow-sm overflow-y-auto">
                            {vehicle && (
                <VehicleInfoCard
                  vehicle={vehicle}
                  onCaptureSnapshot={() => console.log('Capture snapshot for vehicle:', vehicle.id)}
                />
              )}

              {/* Customers Linked to Vehicle */}
              {vehicle && (
                <div className="bg-purple-50 rounded p-3 mb-3 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-gray-900">👥 Customers Using This Vehicle</p>
                    <button
                      onClick={() => setShowAddCustomer(!showAddCustomer)}
                      className="bg-emerald-600 text-white px-2 py-1 rounded text-xs font-semibold hover:bg-emerald-700"
                    >
                      {showAddCustomer ? '✕' : '+ Add'}
                    </button>
                  </div>

                  {/* Customer Cards - Horizontal */}
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
                    {vehicleCustomers.map((vc) => (
                      <div
                        key={vc.id}
                        onClick={() => setSelectedCustomer(vc.customer)}
                        className={`flex-shrink-0 w-40 p-2 rounded border-2 cursor-pointer transition-all ${
                          selectedCustomer?.id === vc.customer?.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 bg-white hover:border-blue-300'
                        }`}
                      >
                        <div className="mb-2">
                          <p className="text-xs font-bold text-gray-900 truncate">{vc.customer?.name}</p>
                          <p className="text-xs text-gray-600">
                            {vc.primary_driver ? '👑 Primary' : '🚗'} {vc.relationship}
                          </p>
                        </div>
                        <p className="text-xs text-yellow-600 mb-2">⭐ {vc.customer?.loyalty_points} Points</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCustomerFromVehicle(vc.id);
                          }}
                          className="w-full bg-red-500 text-white px-1 py-1 rounded text-xs font-semibold hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Customer Dropdown */}
                  {showAddCustomer && (
                    <div className="bg-white rounded p-2 border border-emerald-300">
                      <p className="text-xs font-semibold text-gray-900 mb-2">Select customer to add:</p>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            addCustomerToVehicle(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="w-full text-xs border border-gray-300 rounded p-1"
                      >
                        <option value="">-- Choose a customer --</option>
                        {availableCustomers
                          .filter((c) => !vehicleCustomers.some((vc) => vc.customer_id === c.id))
                          .map((customer) => (
                            <option key={customer.id} value={customer.id}>
                              {customer.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Selected Customer Profile */}
              {selectedCustomer && (
                <>
                  {/* Customer Details */}
                  <div className="bg-amber-50 rounded p-2 mb-2 border border-amber-200">
                    <p className="text-xs font-semibold text-gray-700 mb-1">📝 Customer Notes</p>
                    <p className="text-xs text-gray-900">Prefers oat milk</p>
                  </div>

                  {/* Loyalty Status */}
                  <div className="bg-yellow-50 rounded p-2 mb-2 border border-yellow-200">
                    <p className="text-xs font-semibold text-gray-700 mb-1">⭐ Loyalty Status</p>
                    <p className="text-xs text-yellow-700 font-bold">Gold Customer</p>
                    <p className="text-xs text-gray-600 mt-1">Total Points: {selectedCustomer.loyalty_points}</p>
                    <p className="text-xs text-gray-600">Next Reward: {selectedCustomer.loyalty_points + 20} points</p>
                  </div>
                </>
              )}

              {/* Previous Order */}
              <div className="bg-gray-50 rounded p-2 mb-2">
                <p className="text-xs font-semibold text-gray-700 mb-1">Previous Order</p>
                <p className="text-xs text-gray-500 mb-2">⏰ Yesterday, 08:42</p>
                <div className="space-y-1 mb-2">
                  <p className="text-xs text-gray-900">🍵 Large Latte</p>
                  <p className="text-xs text-gray-900">🥓 Bacon Roll</p>
                </div>
                <p className="text-xs font-bold text-gray-900">Total: <span className="text-emerald-600">£7.70</span></p>
              </div>

              {/* Suggested Order */}
              <div className="bg-emerald-50 rounded p-3 border border-emerald-200">
                <p className="text-xs font-bold text-gray-900 mb-2">🍽️ Suggested Order</p>
                <div className="space-y-2 mb-3">
                  <label className="flex items-center text-xs cursor-pointer">
                    <input type="checkbox" checked readOnly className="mr-2 w-4 h-4" />
                    <span className="text-gray-900">🍵 Large Latte</span>
                  </label>
                  <label className="flex items-center text-xs cursor-pointer">
                    <input type="checkbox" checked readOnly className="mr-2 w-4 h-4" />
                    <span className="text-gray-900">🥓 Bacon Roll</span>
                  </label>
                  <label className="flex items-center text-xs cursor-pointer">
                    <input type="checkbox" className="mr-2 w-4 h-4" />
                    <span className="text-gray-900">🥐 Hash Brown</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button className="bg-emerald-600 text-white text-xs font-semibold py-2 rounded hover:bg-emerald-700">
                    Repeat Last Order
                  </button>
                  <button className="bg-blue-600 text-white text-xs font-semibold py-2 rounded hover:bg-blue-700">
                    Start New Order
                  </button>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Camera & Status */}
            <div className="lg:col-span-2 space-y-2 overflow-y-auto flex flex-col">
              {/* Live Camera Feed */}
              <div className="bg-gray-900 rounded shadow-sm overflow-hidden border border-gray-700 flex-1">
                <div className="w-full h-full bg-gray-800 flex items-center justify-center relative">
                  <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 z-10">
                    <span className="w-2 h-2 bg-green-300 rounded-full inline-block animate-pulse"></span>
                    Live WebRTC · ANPR 0.5 FPS
                  </div>
                  <WebRTCVideo />
                  <div className="absolute bottom-2 right-2 text-gray-400 text-xs bg-gray-900 px-2 py-1 rounded">WebRTC</div>
                </div>
              </div>

              {/* Detected Plates from ANPR */}
              {detectedPlates.length > 0 && (
                <div className="bg-blue-900 rounded shadow-sm p-3 border border-blue-700">
                  <h3 className="text-xs font-semibold text-white mb-2">🚗 Detected Plates</h3>
                  <div className="space-y-2">
                    {detectedPlates.slice(0, 3).map((plate, idx) => (
                      <div key={idx} className="bg-blue-800 rounded p-2">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-white font-bold text-sm">{plate.plate}</p>
                          <p className="text-blue-300 text-xs">{Math.round(plate.confidence * 100)}%</p>
                        </div>
                        {plate.vehicle?.color && (
                          <p className="text-blue-200 text-xs">Color: {plate.vehicle.color}</p>
                        )}
                        {plate.vehicle?.type && (
                          <p className="text-blue-200 text-xs">Type: {plate.vehicle.type}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lane Status */}
              <div className="bg-emerald-600 rounded shadow-sm p-2 text-white">
                <h3 className="text-xs font-semibold mb-1">Lane Status</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between bg-emerald-700 rounded px-2 py-1">
                    <span>Lane 1</span>
                    <span className="font-semibold">🟢 Ordering</span>
                  </div>
                  <div className="flex items-center justify-between bg-emerald-700 rounded px-2 py-1">
                    <span>Lane 2</span>
                    <span className="font-semibold">🟢 Empty</span>
                  </div>
                  <div className="flex items-center justify-between bg-red-600 rounded px-2 py-1">
                    <span>Lane 3</span>
                    <span className="font-semibold">🔴 Offline</span>
                  </div>
                </div>
              </div>

              {/* Today's Top Items */}
              <div className="bg-white rounded shadow-sm p-2">
                <h3 className="text-xs font-semibold text-gray-900 mb-1">Today's Top Items</h3>
                <div className="space-y-1">
                  {[
                    { label: '🍵 Latte', value: 24 },
                    { label: '☕ Cappuccino', value: 19 },
                    { label: '🥓 Bacon Roll', value: 17 },
                    { label: '🥐 Croissant', value: 12 },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-xs border-b border-gray-200 pb-1">
                      <span className="text-gray-700 font-medium">{item.label}</span>
                      <span className="text-emerald-600 font-bold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recognition Status Strip */}
        <div className="bg-gray-100 border-t border-gray-200 px-4 py-2 flex items-center justify-start gap-8 flex-shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">📷 Camera: Lane 1</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-700 font-semibold">✔ Plate Confidence: 98.7%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">🕒 Arrived: 14 seconds ago</span>
          </div>
        </div>
      </main>

      {/* Bottom Navigation for Tablet/Mobile */}
      <BottomNav />

      {/* Operator Info - Mobile/Tablet */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-gray-800 text-white px-4 py-2 text-xs flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center font-bold">N</div>
        <div>
          <p className="font-semibold">Natasha</p>
          <p className="text-gray-400">Operator</p>
        </div>
      </div>
    </div>
  );
}
