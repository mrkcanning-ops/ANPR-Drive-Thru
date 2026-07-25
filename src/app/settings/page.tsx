'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { BottomNav } from '@/components/BottomNav';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    shopName: 'CoffeeHub Drive-Through',
    email: 'info@coffeehub.com',
    phone: '+1 (555) 123-4567',
    address: '123 Coffee Street, Brew City, BC 12345',
    timezone: 'America/Vancouver',
    currency: 'USD',
    openTime: '07:00',
    closeTime: '18:00',
  });

  const handleChange = (field: string, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 pb-16 lg:pb-0">
      <Sidebar activeItem="Settings" />

      <main className="flex-1 p-3 lg:p-6">
        <div className="mb-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-xs lg:text-sm text-gray-600">Configuration & preferences</p>
        </div>

        {/* Settings Form */}
        <div className="bg-white rounded-lg shadow-sm p-4 lg:p-8 max-w-2xl">
            <form className="space-y-4 lg:space-y-6">
              {/* Shop Information */}
              <div>
                <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">Shop Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
                      Shop Name
                    </label>
                    <input
                      type="text"
                      value={settings.shopName}
                      onChange={(e) => handleChange('shopName', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={settings.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={settings.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div>
                <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">Business Hours</h3>
                <div className="grid grid-cols-2 gap-2 lg:gap-4">
                  <div>
                    <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
                      Opening Time
                    </label>
                    <input
                      type="time"
                      value={settings.openTime}
                      onChange={(e) => handleChange('openTime', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
                      Closing Time
                    </label>
                    <input
                      type="time"
                      value={settings.closeTime}
                      onChange={(e) => handleChange('closeTime', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Regional Settings */}
              <div>
                <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">Regional Settings</h3>
                <div className="grid grid-cols-2 gap-2 lg:gap-4">
                  <div>
                    <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
                      Timezone
                    </label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => handleChange('timezone', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option>America/New_York</option>
                      <option>America/Vancouver</option>
                      <option>Europe/London</option>
                      <option>Asia/Tokyo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) => handleChange('currency', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option>USD</option>
                      <option>CAD</option>
                      <option>EUR</option>
                      <option>GBP</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex gap-2 lg:gap-3">
                <button
                  type="submit"
                  className="px-4 lg:px-6 py-1.5 lg:py-2 bg-emerald-600 text-white rounded-lg text-sm lg:text-base font-medium hover:bg-emerald-700 transition-colors"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="px-4 lg:px-6 py-1.5 lg:py-2 bg-gray-200 text-gray-900 rounded-lg text-sm lg:text-base font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
