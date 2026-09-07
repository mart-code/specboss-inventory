"use client";

interface StatCardsProps {
  totalOrders: number;
  unitsSold: number;
  currentStock: number;
  lowStockItems: number;
}

function StatCard({ title, value, icon }: { title: string; value: number | string; icon: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

export function StatCards({ totalOrders, unitsSold, currentStock, lowStockItems }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard title="Total Orders" value={totalOrders} icon="📦" />
      <StatCard title="Units Sold" value={unitsSold} icon="📊" />
      <StatCard title="Current Stock" value={currentStock} icon="🏭" />
      <StatCard title="Low Stock Items" value={lowStockItems} icon="⚠️" />
    </div>
  );
}
