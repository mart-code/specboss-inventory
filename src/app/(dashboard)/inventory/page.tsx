"use client";

import { useState, useEffect } from "react";
import { Inventory, Product, State, DeliveryCompany } from "@/lib/types";
import { getInventory, getInventoryWithFilters } from "@/lib/data/inventory";
import { getProducts } from "@/lib/data/products";
import { getStates } from "@/lib/data/states";
import { getDeliveryCompanies } from "@/lib/data/delivery-companies";
import { AddStockForm } from "@/components/add-stock-form";
import { LOW_STOCK_THRESHOLD, formatDate } from "@/lib/utils";

export default function InventoryPage() {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [companies, setCompanies] = useState<DeliveryCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddStock, setShowAddStock] = useState(false);
  const [filters, setFilters] = useState<{
    productId: string;
    stateId: string;
    deliveryCompanyId: string;
  }>({ productId: "", stateId: "", deliveryCompanyId: "" });

  const loadData = async () => {
    setLoading(true);
    try {
      const [inventoryData, productsData, statesData, companiesData] = await Promise.all([
        getInventory(),
        getProducts(),
        getStates(),
        getDeliveryCompanies(),
      ]);
      setInventory(inventoryData);
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

  const applyFilters = async () => {
    setLoading(true);
    try {
      const result = await getInventoryWithFilters({
        productId: filters.productId || undefined,
        stateId: filters.stateId || undefined,
        deliveryCompanyId: filters.deliveryCompanyId || undefined,
      });
      setInventory(result);
    } catch (error) {
      console.error("Failed to filter inventory", error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({ productId: "", stateId: "", deliveryCompanyId: "" });
    loadData();
  };

  const handleAddStockSuccess = () => {
    setShowAddStock(false);
    loadData();
  };

  const getProductName = (id: string) => products.find((p) => p.id === id)?.name || "—";
  const getStateName = (id: string) => states.find((s) => s.id === id)?.name || "—";
  const getCompanyName = (id: string) => companies.find((c) => c.id === id)?.name || "—";

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <button
          onClick={() => setShowAddStock(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Stock
        </button>
      </div>

      {showAddStock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Add Stock</h2>
            <AddStockForm
              onSuccess={handleAddStockSuccess}
              onCancel={() => setShowAddStock(false)}
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow mb-4 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <select
              value={filters.productId}
              onChange={(e) => setFilters({ ...filters, productId: e.target.value })}
              className="w-full px-3 py-2 border text-gray-500 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Products</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <select
              value={filters.stateId}
              onChange={(e) => setFilters({ ...filters, stateId: e.target.value })}
              className="w-full px-3 text-gray-500 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All States</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Company</label>
            <select
              value={filters.deliveryCompanyId}
              onChange={(e) => setFilters({ ...filters, deliveryCompanyId: e.target.value })}
              className="w-full px-3 py-2 border text-gray-500 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Companies</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
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

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">State</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Delivery Company</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Available Stock</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Updated</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => {
              const isLowStock = item.quantity <= LOW_STOCK_THRESHOLD;
              return (
                <tr key={item.id} className={`border-t text-gray-500 ${isLowStock ? "bg-orange-50" : ""}`}>
                  <td className="px-4 py-2">{getProductName(item.productId)}</td>
                  <td className="px-4 py-2">{getStateName(item.stateId)}</td>
                  <td className="px-4 py-2">{getCompanyName(item.deliveryCompanyId)}</td>
                  <td className="px-4 py-2">
                    <span className={isLowStock ? "text-orange-600 font-medium" : ""}>
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-2">{formatDate(item.updatedAt)}</td>
                </tr>
              );
            })}
            {inventory.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                  No inventory items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
