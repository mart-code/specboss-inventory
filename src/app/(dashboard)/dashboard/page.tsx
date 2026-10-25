import { getDashboardMetrics } from "@/lib/data/dashboard";
import { getProducts } from "@/lib/data/products";
import { getOrders } from "@/lib/data/orders";
import { getInventory } from "@/lib/data/inventory";
import { seedStatesIfEmpty } from "@/lib/data/states";
import { RevenueCards } from "@/components/revenue-cards";
import { StatCards } from "@/components/stat-cards";
import { formatCurrency, formatDate, LOW_STOCK_THRESHOLD, startOfDay, startOfWeek, startOfMonth, startOfYear } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await seedStatesIfEmpty();
  const [metrics, products, orders, inventory] = await Promise.all([
    getDashboardMetrics(),
    getProducts(false),
    getOrders(),
    getInventory(),
  ]);
  const productMap = Object.fromEntries(products.map((p) => [p.id, p.name]));
  const cancelledOrders = (metrics.recentOrders || []).filter((o) => o.status === "cancelled");

  const invByProduct: Record<string, number> = {};
  for (const i of inventory) {
    invByProduct[i.productId] = (invByProduct[i.productId] || 0) + i.quantity;
  }
  const ordersByProduct: Record<string, number> = {};
  const unitsByProduct: Record<string, number> = {};
  const revenueByProduct: Record<string, number> = {};
  for (const o of orders) {
    ordersByProduct[o.productId] = (ordersByProduct[o.productId] || 0) + 1;
    if (o.status === "successful") {
      unitsByProduct[o.productId] = (unitsByProduct[o.productId] || 0) + o.quantity;
      revenueByProduct[o.productId] = (revenueByProduct[o.productId] || 0) + o.total;
    }
  }

  const toBreakdown = (rec: Record<string, number>) =>
    products.map((p) => ({ name: p.name, value: rec[p.id] || 0 }));

  const statBreakdowns = {
    totalOrders: toBreakdown(ordersByProduct),
    unitsSold: toBreakdown(unitsByProduct),
    currentStock: toBreakdown(invByProduct),
    lowStockItems: products.map((p) => ({ name: p.name, value: inventory.filter((i) => i.productId === p.id && i.quantity <= LOW_STOCK_THRESHOLD).length })),
  };

  const now = new Date();
  // import time helpers? use utils
  const todayStart = startOfDay(now).getTime();
  const weekStart = startOfWeek(now).getTime();
  const monthStart = startOfMonth(now).getTime();
  const yearStart = startOfYear(now).getTime();

  const revenueByPeriod: Record<string, Record<string, number>> = {
    today: {},
    week: {},
    month: {},
    year: {},
  };
  for (const o of orders) {
    if (o.status !== "successful") continue;
    const amt = o.total;
    if (o.orderDate >= todayStart) revenueByPeriod.today[o.productId] = (revenueByPeriod.today[o.productId] || 0) + amt;
    if (o.orderDate >= weekStart) revenueByPeriod.week[o.productId] = (revenueByPeriod.week[o.productId] || 0) + amt;
    if (o.orderDate >= monthStart) revenueByPeriod.month[o.productId] = (revenueByPeriod.month[o.productId] || 0) + amt;
    if (o.orderDate >= yearStart) revenueByPeriod.year[o.productId] = (revenueByPeriod.year[o.productId] || 0) + amt;
  }

  const revenueBreakdowns = {
    todayRevenue: toBreakdown(revenueByPeriod.today),
    weekRevenue: toBreakdown(revenueByPeriod.week),
    monthRevenue: toBreakdown(revenueByPeriod.month),
    yearRevenue: toBreakdown(revenueByPeriod.year),
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <RevenueCards
        todayRevenue={metrics.todayRevenue}
        weekRevenue={metrics.weekRevenue}
        monthRevenue={metrics.monthRevenue}
        yearRevenue={metrics.yearRevenue}
        breakdowns={revenueBreakdowns}
      />

      <StatCards
        totalOrders={metrics.totalOrders}
        unitsSold={metrics.unitsSold}
        currentStock={metrics.currentStock}
        lowStockItems={metrics.lowStockItems}
        breakdowns={statBreakdowns}
      />

      {cancelledOrders.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-red-800 mb-3">Cancelled Orders</h2>
          <div className="space-y-3">
            {cancelledOrders.slice(-3).map((order) => (
              <div key={order.id} className="bg-white border border-red-100 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">{formatDate(order.orderDate)}</p>
                  </div>
                  <span className="inline-block px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                    {order.status}
                  </span>
                </div>
                {order.cancellationReason && (
                  <p className="text-sm text-red-700 mt-2">&ldquo;{order.cancellationReason}&rdquo;</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
                <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {metrics.recentOrders.map((order) => (
                <tr key={order.id} className="border-t text-gray-700">
                  <td className="px-4 py-2">{order.orderNumber}</td>
                  <td className="px-4 py-2">{productMap[order.productId] || order.productId}</td>
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
