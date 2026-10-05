"use client";

import { useState, useEffect } from "react";
import { Order } from "@/lib/types";
import { getOrders } from "@/lib/data/orders";
import { getStates } from "@/lib/data/states";
import { getDeliveryCompanies } from "@/lib/data/delivery-companies";
import {
  getReportData,
  getChartData,
  getSalesByState,
  getSalesByCompany,
  getFilteredSuccessfulOrders,
  ReportFilter,
} from "@/lib/data/reports";
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

type Period = "day" | "month" | "year" | "range";

function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMonthInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

const today = new Date();

export default function ReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePeriod, setActivePeriod] = useState<Period>("day");
  const [dayFilter, setDayFilter] = useState(formatDateInput(today));
  const [monthFilter, setMonthFilter] = useState(formatMonthInput(today));
  const [yearFilter, setYearFilter] = useState(String(today.getFullYear()));
  const [rangeFrom, setRangeFrom] = useState(formatDateInput(today));
  const [rangeTo, setRangeTo] = useState(formatDateInput(today));
  const [stateNames, setStateNames] = useState<Map<string, string>>(new Map());
  const [companyNames, setCompanyNames] = useState<Map<string, string>>(new Map());
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

      setStateNames(new Map(statesData.map((s) => [s.id, s.name])));
      setCompanyNames(new Map(companiesData.map((c) => [c.id, c.name])));
    } catch (error) {
      console.error("Failed to load reports", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getActiveFilter = (): ReportFilter => {
    if (activePeriod === "month") {
      return { type: "month", month: monthFilter };
    }
    if (activePeriod === "year") {
      return { type: "year", year: yearFilter };
    }
    if (activePeriod === "range") {
      return { type: "range", from: rangeFrom, to: rangeTo };
    }
    return { type: "day", date: dayFilter };
  };

  useEffect(() => {
    const refreshReport = async () => {
      const filter = getActiveFilter();
      const filteredOrders = getFilteredSuccessfulOrders(orders, filter);
      setReportData(await getReportData(orders, filter));
      setChartData(getChartData(orders, filter));
      setSalesByState(await getSalesByState(filteredOrders, stateNames));
      setSalesByCompany(await getSalesByCompany(filteredOrders, companyNames));
    };

    refreshReport();
  }, [activePeriod, dayFilter, monthFilter, yearFilter, rangeFrom, rangeTo, orders, stateNames, companyNames]);

  const periods: { value: Period; label: string }[] = [
    { value: "day", label: "Day" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
    { value: "range", label: "Range" },
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

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {activePeriod === "day" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specific Day</label>
              <input
                type="date"
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value)}
                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          {activePeriod === "month" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specific Month</label>
              <input
                type="month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          {activePeriod === "year" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specific Year</label>
              <input
                type="number"
                min="2000"
                max="2100"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          {activePeriod === "range" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <input
                  type="date"
                  value={rangeFrom}
                  onChange={(e) => setRangeFrom(e.target.value)}
                  className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input
                  type="date"
                  value={rangeTo}
                  onChange={(e) => setRangeTo(e.target.value)}
                  className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
        </div>
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
