import {
  collection,
  query,
  where,
  getDocs,
  doc,
  runTransaction,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Inventory } from "@/lib/types";

export interface AddStockData {
  productId: string;
  stateId: string;
  deliveryCompanyId: string;
  quantity: number;
}

export async function getInventory(): Promise<Inventory[]> {
  const snapshot = await getDocs(collection(db, "inventory"));
  const items: Inventory[] = [];
  snapshot.forEach((docSnap) => {
    items.push({
      id: docSnap.id,
      ...(docSnap.data() as Omit<Inventory, "id">),
    });
  });
  return items;
}

export async function getInventoryWithFilters(filters: {
  productId?: string;
  stateId?: string;
  deliveryCompanyId?: string;
}): Promise<Inventory[]> {
  const constraints = [];

  if (filters.productId) {
    constraints.push(where("productId", "==", filters.productId));
  }
  if (filters.stateId) {
    constraints.push(where("stateId", "==", filters.stateId));
  }
  if (filters.deliveryCompanyId) {
    constraints.push(where("deliveryCompanyId", "==", filters.deliveryCompanyId));
  }

  const q = constraints.length > 0
    ? query(collection(db, "inventory"), ...constraints)
    : query(collection(db, "inventory"));

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

export async function getInventoryItem(
  productId: string,
  stateId: string,
  deliveryCompanyId: string
): Promise<Inventory | null> {
  const q = query(
    collection(db, "inventory"),
    where("productId", "==", productId),
    where("stateId", "==", stateId),
    where("deliveryCompanyId", "==", deliveryCompanyId)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const docSnap = snapshot.docs[0];
  return {
    id: docSnap.id,
    ...(docSnap.data() as Omit<Inventory, "id">),
  };
}

export async function addStock(data: AddStockData): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const q = query(
      collection(db, "inventory"),
      where("productId", "==", data.productId),
      where("stateId", "==", data.stateId),
      where("deliveryCompanyId", "==", data.deliveryCompanyId)
    );
    const snapshot = await getDocs(q);

    const now = Date.now();

    if (snapshot.empty) {
      transaction.set(doc(collection(db, "inventory")), {
        productId: data.productId,
        stateId: data.stateId,
        deliveryCompanyId: data.deliveryCompanyId,
        quantity: data.quantity,
        updatedAt: now,
      });
    } else {
      const docSnap = snapshot.docs[0];
      const currentQty = (docSnap.data() as Inventory).quantity;
      transaction.update(doc(db, "inventory", docSnap.id), {
        quantity: currentQty + data.quantity,
        updatedAt: now,
      });
    }
  });
}

export async function adjustStock(
  productId: string,
  stateId: string,
  deliveryCompanyId: string,
  quantityChange: number
): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const q = query(
      collection(db, "inventory"),
      where("productId", "==", productId),
      where("stateId", "==", stateId),
      where("deliveryCompanyId", "==", deliveryCompanyId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error("Inventory item not found");
    }

    const docSnap = snapshot.docs[0];
    const currentQty = (docSnap.data() as Inventory).quantity;
    const newQty = currentQty + quantityChange;

    if (newQty < 0) {
      throw new Error("Insufficient stock");
    }

    transaction.update(doc(db, "inventory", docSnap.id), {
      quantity: newQty,
      updatedAt: Date.now(),
    });
  });
}

export async function getAvailableStock(
  productId: string,
  stateId: string,
  deliveryCompanyId: string
): Promise<number> {
  const item = await getInventoryItem(productId, stateId, deliveryCompanyId);
  return item ? item.quantity : 0;
}
