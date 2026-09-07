"use client";

import { OrderForm } from "@/components/order-form";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewOrderPage() {
  const router = useRouter();

  return (
    <div>
      <div className="mb-6">
        <Link href="/orders" className="text-sm text-blue-600 hover:text-blue-800">
          &larr; Back to Orders
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Create New Order</h1>
        <OrderForm
          order={null}
          onSuccess={() => router.push("/orders")}
          onCancel={() => router.push("/orders")}
        />
      </div>
    </div>
  );
}
