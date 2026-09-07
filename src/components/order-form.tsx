"use client";

import { useState, useEffect } from "react";
import { Product, State, DeliveryCompany, Order, OrderStatus } from "@/lib/types";
import { getProducts } from "@/lib/data/products";
import { getStates } from "@/lib/data/states";
import { getDeliveryCompanies } from "@/lib/data/delivery-companies";
import { getAvailableStock } from "@/lib/data/inventory";
import { createOrder, updateOrder } from "@/lib/data/orders";
import { useToast } from "@/components/ui/toast-context";
import { formatCurrency } from "@/lib/utils";

interface OrderFormProps {
  order?: Order | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function OrderForm({ order, onSuccess, onCancel }: OrderFormProps) {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [companies, setCompanies] = useState<DeliveryCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const isEditing = !!order;

  const [selectedProduct, setSelectedProduct] = useState(order?.productId || "");
  const [selectedState, setSelectedState] = useState(order?.stateId || "");
  const [selectedCompany, setSelectedCompany] = useState(order?.deliveryCompanyId || "");
  const [quantity, setQuantity] = useState(order ? String(order.quantity) : "");
  const [salePrice, setSalePrice] = useState(order ? String(order.salePrice) : "");
  const [deliveryCost, setDeliveryCost] = useState(order ? String(order.deliveryCost) : "");
  // const [customerName, setCustomerName] = useState(order?.customerName || "");
  // const [customerPhone, setCustomerPhone] = useState(order?.customerPhone || "");
  // const [customerAddress, setCustomerAddress] = useState(order?.customerAddress || "");
  const [status, setStatus] = useState<OrderStatus>(order?.status || "pending");

  const [availableStock, setAvailableStock] = useState<number | null>(null);

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProduct && selectedState && selectedCompany) {
      getAvailableStock(selectedProduct, selectedState, selectedCompany).then(setAvailableStock);
    } else {
      setAvailableStock(null);
    }
  }, [selectedProduct, selectedState, selectedCompany]);

  useEffect(() => {
    if (selectedProduct && !isEditing) {
      const product = products.find((p) => p.id === selectedProduct);
      if (product) {
        setSalePrice(String(product.price));
      }
    }
  }, [selectedProduct, products, isEditing]);

  const salePriceNum = typeof salePrice === "string" ? parseFloat(salePrice) || 0 : salePrice;
  const quantityNum = typeof quantity === "string" ? parseInt(quantity, 10) || 0 : quantity;
  const deliveryCostNum = typeof deliveryCost === "string" ? parseFloat(deliveryCost) || 0 : deliveryCost;
  const subtotal = salePriceNum * quantityNum;
  const total = subtotal + deliveryCostNum;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !selectedState || !selectedCompany) {
      showToast("Please select product, state, and delivery company", "error");
      return;
    }
    if (!quantityNum || quantityNum <= 0) {
      showToast("Quantity must be greater than 0", "error");
      return;
    }
    if (status === "successful" && availableStock !== null && quantityNum > availableStock) {
      showToast(`Cannot create successful order: only ${availableStock} in stock`, "error");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing && order) {
        await updateOrder(order.id, {
            productId: selectedProduct,
            stateId: selectedState,
            deliveryCompanyId: selectedCompany,
            quantity: quantityNum,
            salePrice: salePriceNum,
            deliveryCost: deliveryCostNum,

            status,

          });
         showToast("Order updated successfully", "success");
       } else {
        await createOrder({
            productId: selectedProduct,
            stateId: selectedState,
            deliveryCompanyId: selectedCompany,
            quantity: quantityNum,
            salePrice: salePriceNum,
            deliveryCost: deliveryCostNum,
            status,
          });
        showToast("Order created successfully", "success");
      }
      onSuccess();
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : "Failed to save order", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-500">Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            required
            className="w-full px-3 text-gray-700 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id} disabled={!p.isActive}>
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
            className="w-full text-gray-700 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select State</option>
            {states.filter((s) => s.isActive).map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Company</label>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            required
            className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Delivery Company</option>
            {companies.filter((c) => c.isActive).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            min="1"
            className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {availableStock !== null && availableStock !== undefined && (
            <p className="text-xs text-gray-600 mt-1">Available Stock: {availableStock}</p>
          )}
        </div>

        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
            className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer Phone</label>
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            required
            className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer Address</label>
          <input
            type="text"
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            required
            className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div> */}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price (₦)</label>
          <input
            type="number"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            required
            min="0"
            className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Cost (₦)</label>
          <input
            type="number"
            value={deliveryCost}
            onChange={(e) => setDeliveryCost(e.target.value)}
            min="0"
            className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-medium text-gray-700">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Delivery Cost:</span>
          <span className="font-medium text-gray-700">{formatCurrency(deliveryCostNum)}</span>
        </div>
        <div className="flex justify-between border-t pt-2">
          <span className="font-medium text-gray-600">Total:</span>
          <span className="font-bold text-lg text-gray-700 ">{formatCurrency(total)}</span>
        </div>
      </div>


      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="pending">Pending</option>
          <option value="successful">Successful</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Saving..." : isEditing ? "Update Order" : "Create Order"}
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
