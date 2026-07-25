import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Order {
  id: string;
  order_number: number;
  customer_name: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  items: string[];
  total_price: number;
  created_at: string;
  completed_at?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
}

export interface DailyStats {
  date: string;
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
}
