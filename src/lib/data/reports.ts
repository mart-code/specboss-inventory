import { Order } from "@/lib/types";
import { startOfDay, startOfWeek, startOfMonth, startOfYear } from "@/lib/utils";

export interface ReportData {
  revenue: number;
  orders: number;
  unitsSold: number;
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
}

export async function getReportData(orders: Order[], period: "daily" | "weekly" | "monthly" | "yearly"): Promise<ReportData> {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case "daily":
      startDate = startOfDay(now);
      break;
    case "weekly":
      startDate = startOfWeek(now);
      break;
    case "monthly":
      startDate = startOfMonth(now);
      break;
    case "yearly":
      startDate = startOfYear(now);
      break;
  }

  const start = startDate.getTime();
  const successful = orders.filter((o) => o.status === "successful" && o.orderDate >= start);

  return {
    revenue: successful.reduce((sum, o) => sum + o.total, 0),
    orders: successful.length,
    unitsSold: successful.reduce((sum, o) => sum + o.quantity, 0),
  };
}

export function getChartData(orders: Order[], period: "daily" | "weekly" | "monthly" | "yearly"): ChartDataPoint[] {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case "daily":
      startDate = startOfDay(now);
      break;
    case "weekly":
      startDate = startOfWeek(now);
      break;
    case "monthly":
      startDate = startOfMonth(now);
      break;
    case "yearly":
      startDate = startOfYear(now);
      break;
  }

  const start = startDate.getTime();
  const successful = orders.filter((o) => o.status === "successful" && o.orderDate >= start);

  const dailyMap = new Map<string, number>();

  successful.forEach((order) => {
    const dateKey = new Date(order.orderDate).toISOString().split("T")[0];
    dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + order.total);
  });

  return Array.from(dailyMap.entries())
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export interface SalesByStateData {
  stateId: string;
  stateName: string;
  orders: number;
  unitsSold: number;
  revenue: number;
}

export async function getSalesByState(orders: Order[], stateNames: Map<string, string>): Promise<SalesByStateData[]> {
  const successful = orders.filter((o) => o.status === "successful");
  const map = new Map<string, { orders: number; units: number; revenue: number }>();

  successful.forEach((order) => {
    const key = order.stateId;
    const existing = map.get(key) || { orders: 0, units: 0, revenue: 0 };
    map.set(key, {
      orders: existing.orders + 1,
      units: existing.units + order.quantity,
      revenue: existing.revenue + order.total,
    });
  });

  return Array.from(map.entries())
    .map(([stateId, data]) => ({
      stateId,
      stateName: stateNames.get(stateId) || stateId,
      orders: data.orders,
      unitsSold: data.units,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export interface SalesByCompanyData {
  companyId: string;
  companyName: string;
  orders: number;
  unitsSold: number;
  revenue: number;
}

export async function getSalesByCompany(orders: Order[], companyNames: Map<string, string>): Promise<SalesByCompanyData[]> {
  const successful = orders.filter((o) => o.status === "successful");
  const map = new Map<string, { orders: number; units: number; revenue: number }>();

  successful.forEach((order) => {
    const key = order.deliveryCompanyId;
    const existing = map.get(key) || { orders: 0, units: 0, revenue: 0 };
    map.set(key, {
      orders: existing.orders + 1,
      units: existing.units + order.quantity,
      revenue: existing.revenue + order.total,
    });
  });

  return Array.from(map.entries())
    .map(([companyId, data]) => ({
      companyId,
      companyName: companyNames.get(companyId) || companyId,
      orders: data.orders,
      unitsSold: data.units,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}
