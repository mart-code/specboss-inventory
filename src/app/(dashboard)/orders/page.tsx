"use client";

import { useState, useEffect } from "react";
import { Order, Product, State, DeliveryCompany } from "@/lib/types";
import { getOrders } from "@/lib/data/orders";
import { getProducts } from "@/lib/data/products";
import { getStates } from "@/lib/data/states";
import { getDeliveryCompanies } from "@/lib/data/delivery-companies";
import { OrderForm } from "@/components/order-form";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [companies, setCompanies] = useState<DeliveryCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersData, productsData, statesData, companiesData] = await Promise.all([
        getOrders(),
        getProducts(),
        getStates(),
        getDeliveryCompanies(),
      ]);
      setOrders(ordersData);
      setProducts(productsData);
      setStates(statesData);
      setCompanies(companiesData);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const getProductName = (id: string) => products.find((p) => p.id === id)?.name || "—";
  const getStateName = (id: string) => states.find((s) => s.id === id)?.name || "—";
  const getCompanyName = (id: string) => companies.find((c) => c.id === id)?.name || "—";

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <button
          onClick={() => { setEditingOrder(null); setShowForm(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Order
        </button>
      </div>

      <div className="bg-white rounded-lg shadow mb-4 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search by order number, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border text-gray-500 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="successful">Successful</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 my-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              {editingOrder ? "Edit Order" : "Add New Order"}
            </h2>
            <OrderForm
              order={editingOrder}
              onSuccess={() => { setShowForm(false); setEditingOrder(null); loadData(); }}
              onCancel={() => { setShowForm(false); setEditingOrder(null); }}
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Order #</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">State</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Company</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Qty</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-t text-gray-500 ">
                <td className="px-4 py-2">{order.orderNumber}</td>
              
                <td className="px-4 py-2">{getProductName(order.productId)}</td>
                <td className="px-4 py-2">{getStateName(order.stateId)}</td>
                <td className="px-4 py-2">{getCompanyName(order.deliveryCompanyId)}</td>
                <td className="px-4 py-2">{order.quantity}</td>
                <td className="px-4 py-2">{formatCurrency(order.total)}</td>
                <td className="px-4 py-2">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    order.status === "successful"
                      ? "bg-green-100 text-green-800"
                      : order.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-2">{formatDate(order.orderDate)}</td>
                <td className="px-4 py-2 text-right">
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-4 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
