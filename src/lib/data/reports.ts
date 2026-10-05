import { Order } from "@/lib/types";
import { startOfDay, startOfMonth, startOfYear } from "@/lib/utils";

export interface ReportData {
  revenue: number;
  orders: number;
  unitsSold: number;
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
}

export type ReportFilter =
  | { type: "day"; date: string }
  | { type: "month"; month: string }
  | { type: "year"; year: string }
  | { type: "range"; from: string; to: string };

function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getDateRangeForFilter(filter: ReportFilter): { start: number; end: number } {
  if (filter.type === "day") {
    const date = parseLocalDate(filter.date);
    return { start: startOfDay(date).getTime(), end: endOfDay(date).getTime() };
  }

  if (filter.type === "month") {
    const [year, month] = filter.month.split("-").map(Number);
    const start = startOfMonth(new Date(year, month - 1, 1));
    const end = endOfDay(new Date(year, month, 0));
    return { start: start.getTime(), end: end.getTime() };
  }

  if (filter.type === "year") {
    const year = Number(filter.year || new Date().getFullYear());
    const start = startOfYear(new Date(year, 0, 1));
    const end = endOfDay(new Date(year, 11, 31));
    return { start: start.getTime(), end: end.getTime() };
  }

  const from = parseLocalDate(filter.from);
  const to = parseLocalDate(filter.to);
  const startDate = from <= to ? from : to;
  const endDate = from <= to ? to : from;
  return { start: startOfDay(startDate).getTime(), end: endOfDay(endDate).getTime() };
}

export function getFilteredSuccessfulOrders(orders: Order[], filter: ReportFilter): Order[] {
  const { start, end } = getDateRangeForFilter(filter);
  return orders.filter((o) => o.status === "successful" && o.orderDate >= start && o.orderDate <= end);
}

export async function getReportData(orders: Order[], filter: ReportFilter): Promise<ReportData> {
  const successful = getFilteredSuccessfulOrders(orders, filter);

  return {
    revenue: successful.reduce((sum, o) => sum + o.total, 0),
    orders: successful.length,
    unitsSold: successful.reduce((sum, o) => sum + o.quantity, 0),
  };
}

export function getChartData(orders: Order[], filter: ReportFilter): ChartDataPoint[] {
  const successful = getFilteredSuccessfulOrders(orders, filter);
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
