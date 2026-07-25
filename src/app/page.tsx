'use client';

import { useEffect, useState } from 'react';
import { supabase, Order, DailyStats } from '@/lib/supabase';
import { Sidebar } from '@/components/Sidebar';
import { BottomNav } from '@/components/BottomNav';

export default function Home() {
  const [time, setTime] = useState<string>('');
  const [currentVehicle, setCurrentVehicle] = useState({ plate: 'AB12 CDE', name: 'John Smith', time: '14 sec', status: 'serving', statusLabel: 'Ordering', car: 'Blue Ford Focus', points: 240 });
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
        .in('status', ['pending', 'preparing', 'ready'])
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
              {[
                { plate: 'AB12 CDE', name: 'John Smith', time: '14 sec', status: 'serving', statusLabel: 'Ordering', car: 'Blue Ford Focus', points: 240 },
                { plate: 'CD45 EFG', name: 'Sarah Jones', time: '2 min', status: 'completed', statusLabel: '✔ Served', car: 'Red Audi A3', points: 180 },
                { plate: 'EF78 GHI', name: 'Mike Brown', time: '5 min', status: 'completed', statusLabel: '✔ Served', car: 'Silver BMW', points: 95 },
                { plate: 'GH01 IJK', name: 'Emma Davis', time: '8 min', status: 'completed', statusLabel: '✔ Served', car: 'Black VW Golf', points: 320 },
                { plate: 'IJ23 KLM', name: 'Unknown', time: '12 min', status: 'left', statusLabel: 'Left', car: 'Unknown', points: 0 },
              ].map((vehicle) => (
                <button
                  key={vehicle.plate}
                  onClick={() => setCurrentVehicle(vehicle)}
                  className={`flex-shrink-0 w-32 p-2 rounded border-2 text-xs transition-all cursor-pointer ${
                    vehicle.status === 'serving'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <p className="font-bold text-base text-gray-900 mb-1">{vehicle.plate}</p>
                  <p className="text-gray-700 font-semibold text-xs truncate">{vehicle.name}</p>
                  <p className={`text-xs mt-1 font-semibold ${
                    vehicle.status === 'serving' ? 'text-blue-600' : 'text-green-600'
                  }`}>
                    {vehicle.statusLabel}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">{vehicle.time} ago</p>
                </button>
              ))}
            </div>
          </div>

          {/* Main Grid Layout - 3 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 flex-1 overflow-hidden">
            {/* Left/Middle Content - Scrollable */}
            <div className="lg:col-span-2 bg-white rounded shadow-sm overflow-y-auto">
              {/* Vehicle Details Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded p-3 mb-3">
                <div className="flex flex-col gap-3">
                  {/* UK Registration Plate - SVG */}
                  <div className="flex justify-center mb-2">
                    <svg width="560" height="80" viewBox="0 0 560 80" xmlns="http://www.w3.org/2000/svg">
                      {/* Outer rounded rectangle - yellow */}
                      <rect x="1" y="1" width="558" height="78" rx="12" ry="12" fill="#F4D03F" />
                      
                      {/* Black outer border */}
                      <rect x="1" y="1" width="558" height="78" rx="12" ry="12" fill="none" stroke="#000000" strokeWidth="2.5" />
                      
                      {/* Blue EU Section - Square with rounded corners */}
                      <rect x="8" y="8" width="62" height="64" rx="5" ry="5" fill="#003DA5" stroke="#000000" strokeWidth="1.5" />
                      
                      {/* EU Stars - 12 stars arranged in circle */}
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
                      
                      {/* GB Text - Below stars */}
                      <text x="28" y="58" fontFamily="Arial, sans-serif" fontSize="13" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">GB</text>
                      
                      {/* Registration Number Text - Dynamic */}
                      <text x="290" y="56" fontFamily="'Arial Black', Arial, sans-serif" fontSize="68" fontWeight="900" fill="#000000" textAnchor="middle" letterSpacing="2">{currentVehicle.plate}</text>
                    </svg>
                  </div>
                  {/* Customer Details */}
                  <div className="border-t-2 border-blue-300 pt-2">
                    <p className="text-sm text-gray-700 font-semibold">{currentVehicle.name}</p>
                    <p className="text-sm text-gray-600">{currentVehicle.car}</p>
                    <p className="text-xs text-yellow-600 mt-1">⭐ Gold Customer • {currentVehicle.points} Points</p>
                  </div>
                  {/* Vehicle Info */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="bg-gray-200 rounded border border-gray-400 p-2">
                      <p className="text-xs text-gray-600 font-semibold mb-1">Vehicle</p>
                      <p className="text-xs text-gray-700 font-semibold">Ford Focus</p>
                    </div>
                    <div className="bg-gray-200 rounded border border-gray-400 p-2">
                      <p className="text-xs text-blue-600 font-semibold mb-1">Colour</p>
                      <p className="text-xs text-gray-700 font-semibold">Blue</p>
                    </div>
                    <div className="bg-gray-200 rounded border border-gray-400 p-2">
                      <p className="text-xs text-gray-600 font-semibold mb-1">Last Visit</p>
                      <p className="text-xs text-gray-700 font-semibold">Yesterday</p>
                    </div>
                  </div>
                </div>
              </div>

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

              {/* Notes & Loyalty */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-amber-50 rounded p-2 border border-amber-200">
                  <p className="text-xs font-semibold text-gray-700 mb-1">📝 Notes</p>
                  <p className="text-xs text-gray-900">Prefers oat milk</p>
                </div>
                <div className="bg-yellow-50 rounded p-2 border border-yellow-200">
                  <p className="text-xs font-semibold text-gray-700 mb-1">⭐ Loyalty Status</p>
                  <p className="text-xs text-yellow-700 font-bold">Gold Customer</p>
                  <p className="text-xs text-gray-600 mt-1">Total Points: 240</p>
                  <p className="text-xs text-gray-600">Next Reward: 260 points</p>
                </div>
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
            <div className="lg:col-span-2 space-y-3 overflow-y-auto">
              {/* Live Camera Feed */}
              <div className="bg-gray-900 rounded shadow-sm overflow-hidden border border-gray-700">
                <div className="aspect-video bg-gray-800 flex items-center justify-center relative">
                  <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-300 rounded-full inline-block"></span>
                    Live Camera - Lane 1
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">🎥 Live Feed</p>
                    <p className="text-gray-500 text-xs mt-1">Reolink Camera</p>
                  </div>
                  <div className="absolute bottom-2 right-2 text-gray-400 text-xs">FPS: 20</div>
                </div>
              </div>

              {/* Lane Status */}
              <div className="bg-emerald-600 rounded shadow-sm p-3 text-white">
                <h3 className="text-xs font-semibold mb-2">Lane Status</h3>
                <div className="space-y-2 text-xs">
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
              <div className="bg-white rounded shadow-sm p-3">
                <h3 className="text-xs font-semibold text-gray-900 mb-2">Today's Top Items</h3>
                <div className="space-y-2">
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
