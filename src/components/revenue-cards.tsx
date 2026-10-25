"use client";

import { useState } from "react";

interface BreakdownItem {
  name: string;
  value: number | string;
}

interface RevenueCardsProps {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  yearRevenue: number;
  breakdowns?: {
    todayRevenue?: BreakdownItem[];
    weekRevenue?: BreakdownItem[];
    monthRevenue?: BreakdownItem[];
    yearRevenue?: BreakdownItem[];
  };
}

function RevenueCard({ title, amount, breakdown }: { title: string; amount: number; breakdown?: BreakdownItem[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-lg shadow p-4 relative">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">
        {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount)}
      </p>
      <button onClick={() => setOpen(true)} className="absolute top-2 right-2 text-gray-700 hover:text-black" aria-label="View breakdown">
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

export function RevenueCards({ todayRevenue, weekRevenue, monthRevenue, yearRevenue, breakdowns }: RevenueCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <RevenueCard title="Today's Revenue" amount={todayRevenue} breakdown={breakdowns?.todayRevenue} />
      <RevenueCard title="This Week" amount={weekRevenue} breakdown={breakdowns?.weekRevenue} />
      <RevenueCard title="This Month" amount={monthRevenue} breakdown={breakdowns?.monthRevenue} />
      <RevenueCard title="This Year" amount={yearRevenue} breakdown={breakdowns?.yearRevenue} />
    </div>
  );
}
