"use client";

interface RevenueCardsProps {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  yearRevenue: number;
}

function RevenueCard({ title, amount }: { title: string; amount: number }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">
        {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount)}
      </p>
    </div>
  );
}

export function RevenueCards({ todayRevenue, weekRevenue, monthRevenue, yearRevenue }: RevenueCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <RevenueCard title="Today's Revenue" amount={todayRevenue} />
      <RevenueCard title="This Week" amount={weekRevenue} />
      <RevenueCard title="This Month" amount={monthRevenue} />
      <RevenueCard title="This Year" amount={yearRevenue} />
    </div>
  );
}
