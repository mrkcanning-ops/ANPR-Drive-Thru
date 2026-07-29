import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

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

export interface Vehicle {
  id: string;
  plate: string;
  make: string;
  model: string;
  colour: string;
  year?: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  loyalty_points: number;
  preferences?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface VehicleCustomer {
  id: string;
  vehicle_id: string;
  customer_id: string;
  relationship: 'primary' | 'family' | 'shared';
  primary_driver: boolean;
  added_date: string;
  customer?: Customer; // For joined data
}
