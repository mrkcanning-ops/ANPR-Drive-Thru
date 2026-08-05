// src/components/dashboard/CustomerProfiles.tsx
export default function CustomerProfiles() {
  const dummyCustomers = [
    { name: 'John Smith', role: 'Primary Driver', phone: '07700 900123', email: 'john@email.com' },
    { name: 'Sarah Smith', role: 'Family Member', phone: '07700 900124', email: 'sarah@email.com' },
    { name: 'Emily Smith', role: 'Family Member', phone: '07700 900125', email: 'emily@email.com' },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center px-1">
        <h3 className="font-semibold text-purple-900 flex items-center gap-2">
           <span className="text-purple-500">👥</span> Customers Using This Vehicle
        </h3>
        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium">3</span>
      </div>

      {/* The Scrollable Horizontal Row */}
      <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
        {dummyCustomers.map((customer, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm min-w-[260px] flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                👤
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900">{customer.name}</p>
                <p className="text-xs text-purple-600 font-medium">{customer.role}</p>
              </div>
            </div>
            <div className="space-y-2 text-xs text-gray-600">
               <p className="flex items-center gap-2">📞 {customer.phone}</p>
               <p className="flex items-center gap-2">✉️ {customer.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}