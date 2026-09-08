"use client";

import { useState, useEffect } from "react";
import { Order, Product, State, DeliveryCompany, OrderStatus } from "@/lib/types";
import { getOrder, updateOrderStatus } from "@/lib/data/orders";
import { getProduct } from "@/lib/data/products";
import { getState } from "@/lib/data/states";
import { getDeliveryCompany } from "@/lib/data/delivery-companies";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/toast-context";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params?.id as string;
  const { showToast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [state, setState] = useState<State | null>(null);
  const [company, setCompany] = useState<DeliveryCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusChanging, setStatusChanging] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) return;
      setLoading(true);
      try {
        const orderData = await getOrder(orderId);
        if (!orderData) return;
        setOrder(orderData);

        const [productData, stateData, companyData] = await Promise.all([
          getProduct(orderData.productId),
          getState(orderData.stateId),
          getDeliveryCompany(orderData.deliveryCompanyId),
        ]);
        setProduct(productData);
        setState(stateData);
        setCompany(companyData);
      } catch (error) {
        console.error("Failed to load order", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order || order.status === newStatus) return;

    if (order.status === "successful" && newStatus !== "successful") {
      const confirmed = window.confirm(
        `Changing status from Successful to ${newStatus} will restore ${order.quantity} units to inventory. Continue?`
      );
      if (!confirmed) return;
    }
    if (order.status !== "successful" && newStatus === "successful") {
      const confirmed = window.confirm(
        `Changing status to Successful will deduct ${order.quantity} units from inventory. Continue?`
      );
      if (!confirmed) return;
    }

    setStatusChanging(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      const updated = await getOrder(orderId);
      setOrder(updated);
      showToast("Order status updated", "success");
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : "Failed to update status", "error");
    } finally {
      setStatusChanging(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  if (!order) {
    return <div className="text-center py-8 text-gray-500">Order not found</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/orders" className="text-sm text-blue-600 hover:text-blue-800">
          &larr; Back to Orders
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Order {order.orderNumber}
          </h1>
          <span className={`inline-block px-3 py-1 text-sm rounded-full ${
            order.status === "successful"
              ? "bg-green-100 text-green-800"
              : order.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}>
            {order.status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-2">Order Details</h2>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-600">Product</dt>
                <dd className="text-gray-600">{product?.name || order.productId}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">State</dt>
                <dd className="text-gray-600">{state?.name || order.stateId}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Delivery Company</dt>
                <dd className="text-gray-600">{company?.name || order.deliveryCompanyId}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Quantity</dt>
                <dd className="text-gray-600">{order.quantity}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Sale Price</dt>
                <dd className="text-gray-600">{formatCurrency(order.salePrice)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Subtotal</dt>
                <dd className="text-gray-600">{formatCurrency(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Delivery Cost</dt>
                <dd className="text-gray-600">{formatCurrency(order.deliveryCost)}</dd>
              </div>
              <div className="flex justify-between border-t pt-2">
                <dt className="text-gray-600 font-medium">Total</dt>
                <dd className="font-bold text-gray-600">{formatCurrency(order.total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Order Date</dt>
                <dd className="text-gray-600">{formatDate(order.orderDate)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Created</dt>
                <dd className="text-gray-600">{formatDate(order.createdAt)}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-2">Customer Details</h2>
            {/* <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-600">Name</dt>
                <dd>{order.customerName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Phone</dt>
                <dd>{order.customerPhone || "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Address</dt>
                <dd>{order.customerAddress || "—"}</dd>
              </div>
            </dl> */}

            <div className="mt-6">
              <h2 className="text-sm font-medium text-gray-500 mb-2">Change Status</h2>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                disabled={statusChanging}
                className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="pending">Pending</option>
                <option value="successful">Successful</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
