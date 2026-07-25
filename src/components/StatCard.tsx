interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'green' | 'blue' | 'purple';
}

export function StatCard({ title, value, subtitle, icon, color = 'green' }: StatCardProps) {
  const bgColors = {
    green: 'bg-emerald-600',
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-emerald-500">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
        {icon && <div className={`${bgColors[color]} p-3 rounded-lg text-white`}>{icon}</div>}
      </div>
    </div>
  );
}
