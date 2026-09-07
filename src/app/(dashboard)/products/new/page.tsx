"use client";

import { ProductForm } from "@/components/product-form";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewProductPage() {
  const router = useRouter();
  const handleSuccess = () => {
    router.push("/products");
  };

  return (
    <div>
      <div className="mb-6">
        <Link href="/products" className="text-sm text-blue-600 hover:text-blue-800">
          &larr; Back to Products
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Add New Product</h1>
        <ProductForm
          product={null}
          onSuccess={handleSuccess}
          onCancel={() => router.push("/products")}
        />
      </div>
    </div>
  );
}
