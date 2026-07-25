'use client';

import { Order } from '@/lib/supabase';
import { OrderCard } from './OrderCard';

interface ActiveOrdersListProps {
  orders: Order[];
  isLoading?: boolean;
}

export function ActiveOrdersList({ orders, isLoading }: ActiveOrdersListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <p className="text-gray-500 text-lg">No active orders</p>
        <p className="text-gray-400 text-sm mt-2">Ready and waiting for new orders!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
