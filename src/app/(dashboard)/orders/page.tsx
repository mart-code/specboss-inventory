"use client";

import { useState, useEffect } from "react";
import { Order, Product, State, DeliveryCompany } from "@/lib/types";
import { deleteOrder, getOrders } from "@/lib/data/orders";
import { getProducts } from "@/lib/data/products";
import { getStates } from "@/lib/data/states";
import { getDeliveryCompanies } from "@/lib/data/delivery-companies";
import { OrderForm } from "@/components/order-form";
import { useToast } from "@/components/ui/toast-context";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

export default function OrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [companies, setCompanies] = useState<DeliveryCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filters, setFilters] = useState({
    productId: "",
    stateId: "",
    deliveryCompanyId: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    productId: "",
    stateId: "",
    deliveryCompanyId: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersData, productsData, statesData, companiesData] = await Promise.all([
        getOrders(),
        getProducts(false),
        getStates(),
        getDeliveryCompanies(false),
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
    const matchesProduct = appliedFilters.productId ? order.productId === appliedFilters.productId : true;
    const matchesState = appliedFilters.stateId ? order.stateId === appliedFilters.stateId : true;
    const matchesCompany = appliedFilters.deliveryCompanyId
      ? order.deliveryCompanyId === appliedFilters.deliveryCompanyId
      : true;
    return matchesSearch && matchesStatus && matchesProduct && matchesState && matchesCompany;
  });

  const getProductName = (id: string) => products.find((p) => p.id === id)?.name || "—";
  const getStateName = (id: string) => states.find((s) => s.id === id)?.name || "—";
  const getCompanyName = (id: string) => companies.find((c) => c.id === id)?.name || "—";

  const handleDelete = async (order: Order) => {
    const confirmed = window.confirm(`Delete order ${order.orderNumber}? Reserved stock will be restored.`);
    if (!confirmed) return;

    try {
      await deleteOrder(order.id);
      showToast("Order deleted", "success");
      loadData();
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : "Failed to delete order", "error");
    }
  };

  const applyFilters = () => {
    setAppliedFilters(filters);
  };

  const clearFilters = () => {
    const emptyFilters = { productId: "", stateId: "", deliveryCompanyId: "" };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setSearchTerm("");
    setStatusFilter("");
  };

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <input
              type="text"
              placeholder="Search by order number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border text-gray-500 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <select
              value={filters.productId}
              onChange={(e) => setFilters({ ...filters, productId: e.target.value })}
              className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Products</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <select
              value={filters.stateId}
              onChange={(e) => setFilters({ ...filters, stateId: e.target.value })}
              className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All States</option>
              {states.map((state) => (
                <option key={state.id} value={state.id}>{state.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Company</label>
            <select
              value={filters.deliveryCompanyId}
              onChange={(e) => setFilters({ ...filters, deliveryCompanyId: e.target.value })}
              className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Companies</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2 pt-4">
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Clear
          </button>
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
                    className="text-blue-600 hover:text-blue-800 mr-2"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => { setEditingOrder(order); setShowForm(true); }}
                    className="text-blue-600 hover:text-blue-800 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(order)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
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
