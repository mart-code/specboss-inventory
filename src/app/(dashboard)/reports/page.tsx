"use client";

import { useState, useEffect } from "react";
import { Order } from "@/lib/types";
import { getOrders } from "@/lib/data/orders";
import { getStates } from "@/lib/data/states";
import { getDeliveryCompanies } from "@/lib/data/delivery-companies";
import { getReportData, getChartData, getSalesByState, getSalesByCompany } from "@/lib/data/reports";
import { formatCurrency } from "@/lib/utils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type Period = "daily" | "weekly" | "monthly" | "yearly";

export default function ReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePeriod, setActivePeriod] = useState<Period>("daily");
  const [reportData, setReportData] = useState({ revenue: 0, orders: 0, unitsSold: 0 });
  const [chartData, setChartData] = useState<Array<{ date: string; revenue: number }>>([]);
  const [salesByState, setSalesByState] = useState<Array<{ stateName: string; orders: number; unitsSold: number; revenue: number }>>([]);
  const [salesByCompany, setSalesByCompany] = useState<Array<{ companyName: string; orders: number; unitsSold: number; revenue: number }>>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersData, statesData, companiesData] = await Promise.all([
        getOrders(),
        getStates(),
        getDeliveryCompanies(),
      ]);
      setOrders(ordersData);

      const stateNames = new Map(statesData.map((s) => [s.id, s.name]));
      const companyNames = new Map(companiesData.map((c) => [c.id, c.name]));

      const report = await getReportData(ordersData, "daily");
      setReportData(report);

      setChartData(getChartData(ordersData, "daily"));

      const stateSales = await getSalesByState(ordersData, stateNames);
      setSalesByState(stateSales);

      const companySales = await getSalesByCompany(ordersData, companyNames);
      setSalesByCompany(companySales);
    } catch (error) {
      console.error("Failed to load reports", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      getReportData(orders, activePeriod).then(setReportData);
      setChartData(getChartData(orders, activePeriod));
    }
  }, [activePeriod, orders]);

  const periods: { value: Period; label: string }[] = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ];

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports</h1>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => setActivePeriod(p.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activePeriod === p.value
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(reportData.revenue)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Orders</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{reportData.orders}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Units Sold</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{reportData.unitsSold}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Over Time</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
              />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales by State</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium text-gray-500">State</th>
                  <th className="text-right py-2 font-medium text-gray-500">Orders</th>
                  <th className="text-right py-2 font-medium text-gray-500">Units</th>
                  <th className="text-right py-2 font-medium text-gray-500">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {salesByState.map((s) => (
                  <tr key={s.stateName} className="border-b text-gray-500">
                    <td className="py-2">{s.stateName}</td>
                    <td className="py-2 text-right">{s.orders}</td>
                    <td className="py-2 text-right">{s.unitsSold}</td>
                    <td className="py-2 text-right">{formatCurrency(s.revenue)}</td>
                  </tr>
                ))}
                {salesByState.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-500">
                      No sales data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales by Delivery Company</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium text-gray-500">Company</th>
                  <th className="text-right py-2 font-medium text-gray-500">Orders</th>
                  <th className="text-right py-2 font-medium text-gray-500">Units</th>
                  <th className="text-right py-2 font-medium text-gray-500">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {salesByCompany.map((c) => (
                  <tr key={c.companyName} className="border-b text-gray-500">
                    <td className="py-2">{c.companyName}</td>
                    <td className="py-2 text-right">{c.orders}</td>
                    <td className="py-2 text-right">{c.unitsSold}</td>
                    <td className="py-2 text-right">{formatCurrency(c.revenue)}</td>
                  </tr>
                ))}
                {salesByCompany.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-500">
                      No sales data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
