'use client';

import { useState, useEffect } from 'react';
import { supabase, MenuItem } from '@/lib/supabase';
import { Sidebar } from '@/components/Sidebar';
import { BottomNav } from '@/components/BottomNav';

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState<string>('all');

  useEffect(() => {
    fetchMenuItems();
  }, [category]);

  const fetchMenuItems = async () => {
    try {
      let query = supabase.from('menu_items').select('*').order('category');

      if (category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['all', 'Hot Drinks', 'Cold Drinks', 'Pastries', 'Food'];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 pb-16 lg:pb-0">
      <Sidebar activeItem="Menu" />

      <main className="flex-1 p-3 lg:p-6">
        <div className="mb-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Menu</h1>
          <p className="text-xs lg:text-sm text-gray-600">Manage menu items and pricing</p>
        </div>

          {/* Category Filter */}
          <div className="mb-4 flex gap-1 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-2 lg:px-4 py-1.5 lg:py-2 rounded-lg font-medium text-xs lg:text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                  category === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-emerald-500'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-40 animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500 text-sm">No menu items found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">{item.category}</p>
                      <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                    </div>
                    <span className="text-lg font-bold text-emerald-600">${item.price.toFixed(2)}</span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                  )}
                  <div className="flex gap-1 mt-2">
                    <button className="flex-1 px-2 py-1 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700 transition-colors">
                      Edit
                    </button>
                    <button className="flex-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 transition-colors">
                      Delete
                    </button>
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
