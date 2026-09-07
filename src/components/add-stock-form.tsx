"use client";

import { useState, useEffect } from "react";
import { Product, State, DeliveryCompany } from "@/lib/types";
import { getProducts } from "@/lib/data/products";
import { getStates } from "@/lib/data/states";
import { getDeliveryCompanies } from "@/lib/data/delivery-companies";
import { addStock, getAvailableStock } from "@/lib/data/inventory";
import { useToast } from "@/components/ui/toast-context";

interface AddStockFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddStockForm({ onSuccess, onCancel }: AddStockFormProps) {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [companies, setCompanies] = useState<DeliveryCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [quantity, setQuantity] = useState("");

  const [availableStock, setAvailableStock] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [productsData, statesData, companiesData] = await Promise.all([
          getProducts(),
          getStates(),
          getDeliveryCompanies(),
        ]);
        setProducts(productsData);
        setStates(statesData);
        setCompanies(companiesData);
      } catch {
        showToast("Failed to load data", "error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [showToast]);

  useEffect(() => {
    if (selectedProduct && selectedState && selectedCompany) {
      getAvailableStock(selectedProduct, selectedState, selectedCompany).then(setAvailableStock);
    } else {
      setAvailableStock(null);
    }
  }, [selectedProduct, selectedState, selectedCompany]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !selectedState || !selectedCompany || !quantity) {
      showToast("Please fill in all fields", "error");
      return;
    }

    const qty = parseInt(quantity, 10);
    if (qty <= 0) {
      showToast("Quantity must be greater than 0", "error");
      return;
    }

    setSubmitting(true);
    try {
      await addStock({
        productId: selectedProduct,
        stateId: selectedState,
        deliveryCompanyId: selectedCompany,
        quantity: qty,
      });
      showToast("Stock added successfully", "success");
      onSuccess();
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : "Failed to add stock", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-500">Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          required
          className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Product</option>
          {products.map((p) => (
            <option className="text-gray-500" key={p.id} value={p.id} disabled={!p.isActive}>
              {p.name} {p.isActive ? "" : "(Inactive)"}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          required
          className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select State</option>
          {states.filter((s) => s.isActive).map((s) => (
            <option className="text-gray-500" key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Company</label>
        <select
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          required
          className="w-full px-3 text-gray-700 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Delivery Company</option>
          {companies.filter((c) => c.isActive).map((c) => (
            <option className="text-gray-500" key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {availableStock !== null && availableStock !== undefined && (
        <div>
          <p className="text-sm text-gray-600">Current Stock: {availableStock}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          min="1"
          className="w-full px-3 py-2  text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Add Stock"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
