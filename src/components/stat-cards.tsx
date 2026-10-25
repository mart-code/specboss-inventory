"use client";

import { useState } from "react";

interface BreakdownItem {
  name: string;
  value: number | string;
}

interface StatCardsProps {
  totalOrders: number;
  unitsSold: number;
  currentStock: number;
  lowStockItems: number;
  breakdowns?: {
    totalOrders?: BreakdownItem[];
    unitsSold?: BreakdownItem[];
    currentStock?: BreakdownItem[];
    lowStockItems?: BreakdownItem[];
  };
}

function StatCard({ title, value, icon, breakdown }: { title: string; value: number | string; icon: string; breakdown?: BreakdownItem[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-lg shadow p-4 relative">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
      <button
        onClick={() => setOpen(true)}
        className="absolute top-2 right-2 text-gray-700 hover:text-black"
        aria-label="View breakdown"
      >
        ⋮
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-lg p-4 w-96 max-h-96 overflow-auto text-gray-900" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold mb-2">{title} breakdown</h3>
            <ul className="space-y-1">
              {(breakdown || []).map((b, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span>{b.name}</span>
                  <span className="font-medium">{b.value}</span>
                </li>
              ))}
              {(!breakdown || breakdown.length === 0) && <li className="text-sm text-gray-500">No data</li>}
            </ul>
            <button onClick={() => setOpen(false)} className="mt-3 text-sm text-blue-600">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function StatCards({ totalOrders, unitsSold, currentStock, lowStockItems, breakdowns }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard title="Total Orders" value={totalOrders} icon="📦" breakdown={breakdowns?.totalOrders} />
      <StatCard title="Units Sold" value={unitsSold} icon="📊" breakdown={breakdowns?.unitsSold} />
      <StatCard title="Current Stock" value={currentStock} icon="🏭" breakdown={breakdowns?.currentStock} />
      <StatCard title="Low Stock Items" value={lowStockItems} icon="⚠️" breakdown={breakdowns?.lowStockItems} />
    </div>
  );
}
