import { Order } from '@/lib/supabase';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    preparing: 'bg-blue-100 text-blue-800',
    ready: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-emerald-500">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-gray-600 text-sm font-medium">Order #{order.order_number}</p>
          <h4 className="text-lg font-semibold text-gray-900">{order.customer_name}</h4>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        {order.items.map((item, idx) => (
          <p key={idx} className="text-sm text-gray-600">
            • {item}
          </p>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <span className="text-2xl font-bold text-emerald-600">${order.total_price.toFixed(2)}</span>
        <span className="text-xs text-gray-500">
          {new Date(order.created_at).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
