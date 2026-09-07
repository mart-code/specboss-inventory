import { Order } from "@/lib/types";
import { getOrders } from "./orders";
import { getInventory } from "./inventory";
import { startOfDay, startOfWeek, startOfMonth, startOfYear } from "@/lib/utils";
import { LOW_STOCK_THRESHOLD } from "@/lib/utils";

export interface DashboardMetrics {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  yearRevenue: number;
  totalOrders: number;
  unitsSold: number;
  currentStock: number;
  lowStockItems: number;
  recentOrders: Order[];
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [orders, inventory] = await Promise.all([
    getOrders(),
    getInventory(),
  ]);

  const now = new Date();
  const todayStart = startOfDay(now).getTime();
  const weekStart = startOfWeek(now).getTime();
  const monthStart = startOfMonth(now).getTime();
  const yearStart = startOfYear(now).getTime();

  const successfulOrders = orders.filter((o) => o.status === "successful");

  const todayRevenue = successfulOrders
    .filter((o) => o.orderDate >= todayStart)
    .reduce((sum, o) => sum + o.subtotal, 0);

  const weekRevenue = successfulOrders
    .filter((o) => o.orderDate >= weekStart)
    .reduce((sum, o) => sum + o.subtotal, 0);

  const monthRevenue = successfulOrders
    .filter((o) => o.orderDate >= monthStart)
    .reduce((sum, o) => sum + o.subtotal, 0);

  const yearRevenue = successfulOrders
    .filter((o) => o.orderDate >= yearStart)
    .reduce((sum, o) => sum + o.subtotal, 0);

  const unitsSold = successfulOrders.reduce((sum, o) => sum + o.quantity, 0);

  const currentStock = inventory.reduce((sum, i) => sum + i.quantity, 0);
  const lowStockItems = inventory.filter((i) => i.quantity <= LOW_STOCK_THRESHOLD).length;

  return {
    todayRevenue,
    weekRevenue,
    monthRevenue,
    yearRevenue,
    totalOrders: orders.length,
    unitsSold,
    currentStock,
    lowStockItems,
    recentOrders: orders.slice(0, 10),
  };
}
