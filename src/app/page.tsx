'use client';

import { useEffect, useState } from 'react';
import { supabase, Order, DailyStats, Vehicle, Customer, VehicleCustomer } from '@/lib/supabase';
import { Sidebar } from '@/components/Sidebar';
import { BottomNav } from '@/components/BottomNav';
import { WebRTCVideo } from '@/app/components/WebRTCVideo';
import {
  Radio,
  Camera,
  Maximize2,
  Users,
  User,
  Phone,
  Mail,
  FileText,
  Plus,
  Star,
  Clock,
  ThumbsUp,
  Cpu,
  Car,
  Palette,
  Calendar,
} from 'lucide-react';

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

export default function Home() {
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
        {/* Top Header Bar */}
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

        {/* Timeline Strip */}
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

        {/* Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* LEFT COLUMN */}
            <div className="space-y-4">
              {/* Plate + Snapshot Row */}
              <div className="flex gap-3">
                <div className="flex-[2]">
                  <svg className="w-full h-auto" viewBox="0 0 560 80" xmlns="http://www.w3.org/2000/svg">
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
                    <text x="28" y="58" fontFamily="Arial, sans-serif" fontSize="13" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">GB</text>
                    <text x="290" y="56" fontFamily="'Arial Black', Arial, sans-serif" fontSize="68" fontWeight="900" fill="#000000" textAnchor="middle" letterSpacing="2">{vehicle?.plate || 'AB12 CDE'}</text>
                  </svg>
                </div>
                <div className="flex-1 bg-gray-100 border border-gray-200 rounded-xl flex flex-col items-center justify-center p-3 text-center">
                  <Camera size={22} className="text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500 mb-2">No Image Stored</p>
                  <button
                    onClick={() => console.log('Capture snapshot for vehicle:', vehicle?.id)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Capture &amp; Save
                  </button>
                </div>
              </div>

              {/* Vehicle Specs Bar */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Car size={16} className="text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Make</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{vehicle?.make || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Car size={16} className="text-gray-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Model</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{vehicle?.model || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Palette size={16} className="text-gray-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Colour</p>
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-1 truncate">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: vehicle?.colour?.toLowerCase() || '#ccc' }}></span>
                      {vehicle?.colour || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Calendar size={16} className="text-gray-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Year</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{vehicle?.year || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Customers Using This Vehicle */}
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-purple-600" />
                    <p className="text-sm font-bold text-gray-900">Customers Using This Vehicle</p>
                  </div>
                  <span className="bg-purple-200 text-purple-700 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                    {vehicleCustomers.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {vehicleCustomers.map((vc) => (
                    <div
                      key={vc.id}
                      onClick={() => setSelectedCustomer(vc.customer)}
                      className="bg-white rounded-lg border border-gray-100 p-3 cursor-pointer hover:border-purple-300"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <User size={16} className="text-purple-500" />
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

              {/* Notes + Loyalty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={16} className="text-orange-500" />
                    <p className="text-sm font-bold text-gray-900">Customer Notes</p>
                  </div>
                  <ul className="text-xs text-gray-700 space-y-1 mb-3 list-disc list-inside flex-1">
                    <li>Regular morning visitor</li>
                    <li>Prefers oat milk</li>
                    <li>No sugar in hot drinks</li>
                  </ul>
                  <button className="self-end bg-white border border-orange-300 text-orange-600 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <Plus size={12} /> Add Note
                  </button>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={16} className="text-amber-500" />
                    <p className="text-sm font-bold text-gray-900">Loyalty Status</p>
                  </div>
                  <p className="text-amber-600 font-bold text-lg mb-3">Gold Member</p>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Points Balance</p>
                      <p className="text-sm font-bold text-gray-900">{selectedCustomer?.loyalty_points ?? 0} pts</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Visits</p>
                      <p className="text-sm font-bold text-gray-900">28</p>
                    </div>
                    <button className="bg-white border border-gray-300 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap">
                      View Profile
                    </button>
                  </div>
                </div>
              </div>

              {/* Previous + Suggested Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={16} className="text-gray-500" />
                    <p className="text-sm font-bold text-gray-900">Previous Order</p>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">21 May 2025, 09:12</p>
                  <div className="space-y-2 mb-3">
                    <label className="flex items-center justify-between text-xs cursor-pointer">
                      <span className="flex items-center gap-2 text-gray-700">
                        <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300" />
                        Large Latte
                      </span>
                      <span className="text-gray-700 font-medium">£3.35</span>
                    </label>
                    <label className="flex items-center justify-between text-xs cursor-pointer">
                      <span className="flex items-center gap-2 text-gray-700">
                        <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300" />
                        Blueberry Muffin
                      </span>
                      <span className="text-gray-700 font-medium">£2.45</span>
                    </label>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-2 mb-3">
                    <span className="text-sm font-bold text-gray-900">Total</span>
                    <span className="text-sm font-bold text-gray-900">£5.80</span>
                  </div>
                  <button className="w-full bg-white border border-gray-300 text-gray-700 text-xs font-semibold py-2 rounded-lg hover:bg-gray-50">
                    View Full History
                  </button>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <ThumbsUp size={16} className="text-emerald-600" />
                    <p className="text-sm font-bold text-gray-900">Suggested Order</p>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Based on previous orders</p>
                  <div className="space-y-2 mb-4">
                    <label className="flex items-center justify-between text-xs cursor-pointer">
                      <span className="flex items-center gap-2 text-gray-700">
                        <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300" />
                        Large Latte
                      </span>
                      <span className="text-gray-700 font-medium">£3.35</span>
                    </label>
                    <label className="flex items-center justify-between text-xs cursor-pointer">
                      <span className="flex items-center gap-2 text-gray-700">
                        <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300" />
                        Blueberry Muffin
                      </span>
                      <span className="text-gray-700 font-medium">£2.45</span>
                    </label>
                    <label className="flex items-center justify-between text-xs cursor-pointer">
                      <span className="flex items-center gap-2 text-gray-700">
                        <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300" />
                        Oat Milk
                      </span>
                      <span className="text-gray-700 font-medium">£0.60</span>
                    </label>
                  </div>
                  <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 rounded-full flex items-center justify-center gap-1">
                    <Plus size={14} /> Add All to Order
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-4">
              {/* Live Camera */}
              <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
                <div className="flex items-center justify-between px-4 py-3">
                  <p className="text-white font-bold text-sm">Live Camera – Lane 1</p>
                  <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                    <Radio size={12} /> Live WebRTC
                  </span>
                </div>
                <div className="relative aspect-video bg-black">
                  <WebRTCVideo />
                  <span className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded z-10">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full"></span> Live
                  </span>
                  <div className="absolute bottom-3 right-3 flex gap-2 z-10">
                    <button className="bg-black/60 text-white p-1.5 rounded">
                      <Maximize2 size={14} />
                    </button>
                    <button className="bg-black/60 text-white p-1.5 rounded">
                      <Camera size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Detected Plates */}
              <div className="bg-blue-600 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Car size={16} className="text-white" />
                    <p className="text-white font-bold text-sm">Detected Plates</p>
                  </div>
                  <span className="bg-white text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">1 New</span>
                </div>
                <div className="bg-white mx-1 mb-1 rounded-lg px-4 py-3 flex items-center justify-between">
                  <span className="font-bold text-gray-900 text-sm">{vehicle?.plate || 'AB12 CDE'}</span>
                  <span className="text-gray-400 text-xs">{time}</span>
                </div>
              </div>

              {/* Lane Status + Top Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Car size={16} className="text-emerald-600" />
                      <p className="text-sm font-bold text-gray-900">Lane Status</p>
                    </div>
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Lane 1</span>
                      <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>Online
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Lane 2</span>
                      <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>Online
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Lane 3</span>
                      <span className="flex items-center gap-1.5 text-gray-400 font-semibold">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>Offline
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="text-sm font-bold text-gray-900 mb-3">
                    Top Items <span className="text-xs font-normal text-gray-400">(Today)</span>
                  </p>
                  <div className="space-y-2 text-xs">
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
              </div>

              {/* Recognition Confidence */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Cpu size={16} className="text-gray-500" />
                  <p className="text-sm font-bold text-gray-900 whitespace-nowrap">Recognition Confidence</p>
                </div>
                <span className="text-emerald-600 font-bold text-sm flex-shrink-0">98%</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98%' }}></div>
                </div>
                <span className="text-gray-400 text-xs flex-shrink-0">Excellent</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation for Tablet/Mobile */}
      <BottomNav />
    </div>
  );
}
