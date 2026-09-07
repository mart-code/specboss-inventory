import { getDashboardMetrics } from "@/lib/data/dashboard";
import { seedStatesIfEmpty } from "@/lib/data/states";
import { RevenueCards } from "@/components/revenue-cards";
import { StatCards } from "@/components/stat-cards";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await seedStatesIfEmpty();
  const metrics = await getDashboardMetrics();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <RevenueCards
        todayRevenue={metrics.todayRevenue}
        weekRevenue={metrics.weekRevenue}
        monthRevenue={metrics.monthRevenue}
        yearRevenue={metrics.yearRevenue}
      />

      <StatCards
        totalOrders={metrics.totalOrders}
        unitsSold={metrics.unitsSold}
        currentStock={metrics.currentStock}
        lowStockItems={metrics.lowStockItems}
      />

      <div className="bg-white rounded-lg shadow">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/orders" className="text-sm text-blue-600 hover:text-blue-800">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Order #</th>
                <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {metrics.recentOrders.map((order) => (
                <tr key={order.id} className="border-t text-gray-700">
                  <td className="px-4 py-2">{order.orderNumber}</td>
                  <td className="px-4 py-2">{formatCurrency(order.total)}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        order.status === "successful"
                          ? "bg-green-100 text-green-800"
                          : order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">{formatDate(order.orderDate)}</td>
                </tr>
              ))}
              {metrics.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
