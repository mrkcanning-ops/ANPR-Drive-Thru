'use client';

import { useState, useEffect } from 'react';
import { supabase, Order } from '@/lib/supabase';
import { Sidebar } from '@/components/Sidebar';
import { BottomNav } from '@/components/BottomNav';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'completed'>(
    'all'
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 pb-16 lg:pb-0">
      <Sidebar activeItem="Active Orders" />

      <main className="flex-1 p-3 lg:p-6">
        <div className="mb-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-xs lg:text-sm text-gray-600">Real-time order management</p>
        </div>

        {/* Filter Buttons - Compact */}
        <div className="mb-4 flex gap-1 overflow-x-auto pb-2">
          {['all', 'pending', 'preparing', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as typeof filter)}
              className={`px-2 lg:px-4 py-1.5 lg:py-2 rounded-lg font-medium text-xs lg:text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                filter === status
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-emerald-500'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Orders Grid - Optimized for Tablet */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[calc(100vh-200px)] overflow-y-auto">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-emerald-500">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-gray-600 text-xs font-medium">Order #{order.order_number}</p>
                    <h4 className="font-semibold text-gray-900 text-sm">{order.customer_name}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>

                <div className="mb-2 text-xs text-gray-600">
                  {order.items.map((item, idx) => (
                    <p key={idx}>• {item}</p>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="font-bold text-emerald-600">${order.total_price.toFixed(2)}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
