"use client";

import { useState, useEffect } from "react";
import { Product } from "@/lib/types";
import { getProduct } from "@/lib/data/products";
import { ProductForm } from "@/components/product-form";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getProduct(id);
        setProduct(data);
      } catch (error) {
        console.error("Failed to load product", error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleSuccess = () => {
    router.push("/products");
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  if (!product) {
    return (
      <div className="text-center py-8 text-gray-500">
        Product not found
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/products" className="text-sm text-blue-600 hover:text-blue-800">
          &larr; Back to Products
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Edit Product</h1>
        <ProductForm
          product={product}
          onSuccess={handleSuccess}
          onCancel={() => router.push("/products")}
        />
      </div>
    </div>
  );
}
