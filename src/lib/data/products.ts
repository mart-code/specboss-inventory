import { collection, query, where, addDoc, updateDoc, getDoc, getDocs, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product, Inventory } from "@/lib/types";

export async function getProducts(activeOnly = true): Promise<Product[]> {
  let q = query(collection(db, "products"));
  if (activeOnly) {
    q = query(collection(db, "products"), where("isActive", "==", true));
  }
  const snapshot = await getDocs(q);
  const products: Product[] = [];
  snapshot.forEach((docSnap) => {
    products.push({
      id: docSnap.id,
      ...(docSnap.data() as Omit<Product, "id">),
    });
  });
  return products.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getProduct(id: string): Promise<Product | null> {
  const docSnap = await getDoc(doc(db, "products", id));
  if (!docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...(docSnap.data() as Omit<Product, "id">),
  };
}

export async function createProduct(data: { name: string; sku: string; price: number; description?: string; image?: string }): Promise<string> {
  const now = Date.now();
  const docRef = await addDoc(collection(db, "products"), {
    ...data,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

export async function updateProduct(id: string, data: Partial<Omit<Product, "id" | "createdAt">>): Promise<void> {
  await updateDoc(doc(db, "products", id), {
    ...data,
    updatedAt: Date.now(),
  });
}

export async function toggleProductStatus(id: string, isActive: boolean): Promise<void> {
  await updateDoc(doc(db, "products", id), {
    isActive,
    updatedAt: Date.now(),
  });
}

export async function getProductInventory(productId: string): Promise<Inventory[]> {
  const q = query(collection(db, "inventory"), where("productId", "==", productId));
  const snapshot = await getDocs(q);
  const items: Inventory[] = [];
  snapshot.forEach((docSnap) => {
    items.push({
      id: docSnap.id,
      ...(docSnap.data() as Omit<Inventory, "id">),
    });
  });
  return items;
}
