'use client';

import { Sidebar } from '@/components/Sidebar';
import { BottomNav } from '@/components/BottomNav';
import { AnalyticsChart } from '@/components/AnalyticsChart';

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 pb-16 lg:pb-0">
      <Sidebar activeItem="Analytics" />

      <main className="flex-1 p-3 lg:p-6">
        <div className="mb-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-xs lg:text-sm text-gray-600">Performance & trends</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <AnalyticsChart
              title="Daily Orders"
              data={[
                { label: 'Monday', value: 45 },
                { label: 'Tuesday', value: 52 },
                { label: 'Wednesday', value: 48 },
                { label: 'Thursday', value: 61 },
                { label: 'Friday', value: 75 },
              ]}
              maxValue={80}
            />

            <AnalyticsChart
              title="Revenue Trends"
              data={[
                { label: 'Week 1', value: 1200 },
                { label: 'Week 2', value: 1450 },
                { label: 'Week 3', value: 1350 },
                { label: 'Week 4', value: 1680 },
              ]}
              maxValue={1800}
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnalyticsChart
              title="Popular Hours"
              data={[
                { label: '07:00-08:00', value: 15 },
                { label: '08:00-09:00', value: 38 },
                { label: '09:00-10:00', value: 42 },
                { label: '10:00-11:00', value: 28 },
                { label: '11:00-12:00', value: 52 },
              ]}
              maxValue={60}
            />

            <AnalyticsChart
              title="Customer Satisfaction"
              data={[
                { label: 'Excellent', value: 320 },
                { label: 'Good', value: 180 },
                { label: 'Average', value: 45 },
                { label: 'Poor', value: 12 },
              ]}
              maxValue={350}
            />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
