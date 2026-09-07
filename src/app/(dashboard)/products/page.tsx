"use client";

import { useState, useEffect } from "react";
import { Product } from "@/lib/types";
import { getProducts, toggleProductStatus } from "@/lib/data/products";
import { getInventory } from "@/lib/data/inventory";
import { ProductForm } from "@/components/product-form";
import { LOW_STOCK_THRESHOLD, formatCurrency } from "@/lib/utils";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [inventoryMap, setInventoryMap] = useState<Record<string, number>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, inventoryData] = await Promise.all([
        getProducts(false),
        getInventory(),
      ]);
      setProducts(productsData);

      const map: Record<string, number> = {};
      for (const item of inventoryData) {
        const key = item.productId;
        map[key] = (map[key] || 0) + item.quantity;
      }
      setInventoryMap(map);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProduct(null);
    loadData();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      await toggleProductStatus(product.id, !product.isActive);
      setProducts(products.map((p) =>
        p.id === product.id ? { ...p, isActive: !p.isActive } : p
      ));
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button
          onClick={() => { setEditingProduct(null); setShowForm(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Product
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h2>
            <ProductForm
              product={editingProduct}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t text-gray-500">
                <td className="px-4 py-2">{product.name}</td>
                <td className="px-4 py-2 text-gray-600">{product.sku}</td>
                <td className="px-4 py-2">{formatCurrency(product.price)}</td>
                <td className="px-4 py-2">
                  <span className={inventoryMap[product.id] <= LOW_STOCK_THRESHOLD && inventoryMap[product.id] > 0 ? "text-orange-600 font-medium" : inventoryMap[product.id] === 0 ? "text-gray-400" : ""}>
                    {inventoryMap[product.id] || 0}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    product.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-blue-600 hover:text-blue-800 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(product)}
                    className={`${
                      product.isActive
                        ? "text-orange-600 hover:text-orange-800"
                        : "text-green-600 hover:text-green-800"
                    }`}
                  >
                    {product.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                  No products yet. Click &quot;Add Product&quot; to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
