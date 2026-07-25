'use client';

import { Sidebar } from '@/components/Sidebar';
import { BottomNav } from '@/components/BottomNav';

export default function TeamPage() {
  const team = [
    { id: 1, name: 'Sarah Johnson', role: 'Barista', status: 'Active', shift: 'Morning' },
    { id: 2, name: 'Mike Chen', role: 'Barista', status: 'Active', shift: 'Afternoon' },
    { id: 3, name: 'Emma Davis', role: 'Shift Manager', status: 'Active', shift: 'Morning' },
    { id: 4, name: 'Alex Martinez', role: 'Barista', status: 'Break', shift: 'Afternoon' },
    { id: 5, name: 'Lisa Anderson', role: 'Barista', status: 'Inactive', shift: 'Off' },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 pb-16 lg:pb-0">
      <Sidebar activeItem="Team" />

      <main className="flex-1 p-3 lg:p-6">
        <div className="mb-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Team</h1>
          <p className="text-xs lg:text-sm text-gray-600">Staff & shift management</p>
        </div>

          {/* Team Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs lg:text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs lg:text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs lg:text-sm font-semibold text-gray-900">Role</th>
                    <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs lg:text-sm font-semibold text-gray-900">Shift</th>
                    <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs lg:text-sm font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {team.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 lg:px-6 py-2 lg:py-4">
                        <div className="flex items-center gap-2 lg:gap-3">
                          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-xs lg:text-sm">
                            {member.name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900 text-xs lg:text-sm">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-2 lg:py-4 text-xs lg:text-sm text-gray-600">{member.role}</td>
                      <td className="px-3 lg:px-6 py-2 lg:py-4 text-xs lg:text-sm text-gray-600">{member.shift}</td>
                      <td className="px-3 lg:px-6 py-2 lg:py-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            member.status === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : member.status === 'Break'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {member.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
      </main>

      <BottomNav />
    </div>
  );
}
