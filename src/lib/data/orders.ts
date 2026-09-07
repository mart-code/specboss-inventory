import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  runTransaction,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order, OrderStatus } from "@/lib/types";

export interface CreateOrderData {
  productId: string;
  stateId: string;
  deliveryCompanyId: string;
  quantity: number;
  salePrice: number;
  deliveryCost: number;

  status: OrderStatus;
  orderDate?: number;
}

export async function generateOrderNumber(): Promise<string> {
  const counterRef = doc(db, "counters", "orderNumber");
  let orderNum = "SB-000001";

  await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    let count = 0;
    if (counterDoc.exists()) {
      count = counterDoc.data()?.count || 0;
    }
    count += 1;
    transaction.set(counterRef, { count });
    orderNum = `SB-${String(count).padStart(6, "0")}`;
  });

  return orderNum;
}

export async function getOrders(): Promise<Order[]> {
  const snapshot = await getDocs(collection(db, "orders"));
  const orders: Order[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data() as Omit<Order, "id">;
    orders.push({
      id: docSnap.id,
      ...data,
      orderDate: data.orderDate || data.createdAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  });
  return orders.sort((a, b) => b.orderDate - a.orderDate);
}

export async function getOrder(id: string): Promise<Order | null> {
  const docSnap = await getDoc(doc(db, "orders", id));
  if (!docSnap.exists()) return null;
  const data = docSnap.data() as Omit<Order, "id">;
  return {
    id: docSnap.id,
    ...data,
    orderDate: data.orderDate || data.createdAt,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function createOrder(data: CreateOrderData): Promise<Order> {
  const now = Date.now();
  const orderNumber = await generateOrderNumber();
  const subtotal = data.salePrice * data.quantity;
  const total = subtotal + data.deliveryCost;

  const orderData: Omit<Order, "id"> = {
    orderNumber,
    productId: data.productId,
    stateId: data.stateId,
    deliveryCompanyId: data.deliveryCompanyId,
    quantity: data.quantity,
    salePrice: data.salePrice,
    deliveryCost: data.deliveryCost,
    subtotal,
    total,
    status: data.status,
    orderDate: data.orderDate || now,
    createdAt: now,
    updatedAt: now,
  };

  const orderRef = doc(collection(db, "orders"));

  if (data.status === "successful") {
    await runTransaction(db, async (transaction) => {
      const inventoryQ = query(
        collection(db, "inventory"),
        where("productId", "==", data.productId),
        where("stateId", "==", data.stateId),
        where("deliveryCompanyId", "==", data.deliveryCompanyId)
      );
      const inventorySnap = await getDocs(inventoryQ);

      if (inventorySnap.empty) {
        throw new Error("No inventory found for this product/location combination");
      }

      const invDoc = inventorySnap.docs[0];
      const currentQty = (invDoc.data() as { quantity: number }).quantity;

      if (currentQty < data.quantity) {
        throw new Error("Insufficient stock for this order");
      }

      transaction.update(doc(db, "inventory", invDoc.id), {
        quantity: currentQty - data.quantity,
        updatedAt: now,
      });

      transaction.set(orderRef, orderData);
    });
  } else {
    await runTransaction(db, async (transaction) => {
      transaction.set(orderRef, orderData);
    });
  }

  const saved = await getOrder(orderRef.id);
  if (!saved) throw new Error("Failed to create order");
  return saved;
}

async function adjustInventoryForStatusChange(
  fromStatus: OrderStatus,
  toStatus: OrderStatus,
  oldQuantity: number,
  newQuantity: number,
  location: { productId: string; stateId: string; deliveryCompanyId: string }
): Promise<void> {
  if (fromStatus === toStatus && oldQuantity === newQuantity) return;

  await runTransaction(db, async (transaction) => {
    const inventoryQ = query(
      collection(db, "inventory"),
      where("productId", "==", location.productId),
      where("stateId", "==", location.stateId),
      where("deliveryCompanyId", "==", location.deliveryCompanyId)
    );
    const inventorySnap = await getDocs(inventoryQ);

    let quantityAdjust = 0;

    if (fromStatus === "successful") {
      quantityAdjust += oldQuantity;
    }

    if (toStatus === "successful") {
      quantityAdjust -= newQuantity;
    }

    if (quantityAdjust === 0) return;

    if (inventorySnap.empty) {
      throw new Error("No inventory found for this product/location combination");
    }

    const invDoc = inventorySnap.docs[0];
    const currentQty = (invDoc.data() as { quantity: number }).quantity;
    const newQty = currentQty + quantityAdjust;

    if (newQty < 0) {
      throw new Error("Insufficient stock");
    }

    transaction.update(doc(db, "inventory", invDoc.id), {
      quantity: newQty,
      updatedAt: Date.now(),
    });
  });
}

export async function updateOrder(
  id: string,
  data: Partial<CreateOrderData>
): Promise<void> {
  const existingOrder = await getOrder(id);
  if (!existingOrder) {
    throw new Error("Order not found");
  }

  const oldStatus = existingOrder.status;
  const newStatus = data.status ?? oldStatus;
  const oldQuantity = existingOrder.quantity;
  const newQuantity = data.quantity ?? existingOrder.quantity;
  const now = Date.now();

  const updates: Record<string, unknown> = {
    updatedAt: now,
  };

  if (data.productId) updates.productId = data.productId;
  if (data.stateId) updates.stateId = data.stateId;
  if (data.deliveryCompanyId) updates.deliveryCompanyId = data.deliveryCompanyId;
  if (data.quantity !== undefined) updates.quantity = data.quantity;
  if (data.salePrice !== undefined) updates.salePrice = data.salePrice;
  if (data.deliveryCost !== undefined) updates.deliveryCost = data.deliveryCost;
  if (data.orderDate !== undefined) updates.orderDate = data.orderDate;


  if (data.quantity !== undefined || data.salePrice !== undefined || data.deliveryCost !== undefined) {
    const salePrice = data.salePrice ?? existingOrder.salePrice;
    const quantity = data.quantity ?? existingOrder.quantity;
    const deliveryCost = data.deliveryCost ?? existingOrder.deliveryCost;
    updates.subtotal = salePrice * quantity;
    updates.total = salePrice * quantity + deliveryCost;
  }
  if (data.status) updates.status = data.status;

  const productId = data.productId || existingOrder.productId;
  const stateId = data.stateId || existingOrder.stateId;
  const deliveryCompanyId = data.deliveryCompanyId || existingOrder.deliveryCompanyId;

  if (oldStatus !== newStatus) {
    await adjustInventoryForStatusChange(oldStatus, newStatus, oldQuantity, newQuantity, {
      productId,
      stateId,
      deliveryCompanyId,
    });
  }

  await updateDoc(doc(db, "orders", id), updates);
}

export async function updateOrderStatus(id: string, newStatus: OrderStatus): Promise<void> {
  const existingOrder = await getOrder(id);
  if (!existingOrder) {
    throw new Error("Order not found");
  }

  await adjustInventoryForStatusChange(existingOrder.status, newStatus, existingOrder.quantity, existingOrder.quantity, {
    productId: existingOrder.productId,
    stateId: existingOrder.stateId,
    deliveryCompanyId: existingOrder.deliveryCompanyId,
  });

  await updateDoc(doc(db, "orders", id), {
    status: newStatus,
    updatedAt: Date.now(),
  });
}

export interface OrderFilters {
  orderNumber?: string;
  productId?: string;
  stateId?: string;
  deliveryCompanyId?: string;
  status?: OrderStatus;
  dateFrom?: number;
  dateTo?: number;
}

export async function searchOrders(filters: OrderFilters): Promise<Order[]> {
  const constraints = [];

  if (filters.orderNumber) {
    constraints.push(where("orderNumber", "==", filters.orderNumber));
  }
  // if (filters.customerName) {
  //   constraints.push(where("customerName", ">=", filters.customerName));
  //   constraints.push(where("customerName", "<=", filters.customerName + "\uf8ff"));
  // }
  if (filters.productId) {
    constraints.push(where("productId", "==", filters.productId));
  }
  if (filters.stateId) {
    constraints.push(where("stateId", "==", filters.stateId));
  }
  if (filters.deliveryCompanyId) {
    constraints.push(where("deliveryCompanyId", "==", filters.deliveryCompanyId));
  }
  if (filters.status) {
    constraints.push(where("status", "==", filters.status));
  }
  if (filters.dateFrom !== undefined) {
    constraints.push(where("orderDate", ">=", filters.dateFrom));
  }
  if (filters.dateTo !== undefined) {
    constraints.push(where("orderDate", "<=", filters.dateTo));
  }

  const q = constraints.length > 0
    ? query(collection(db, "orders"), ...constraints)
    : query(collection(db, "orders"));

  const snapshot = await getDocs(q);
  const orders: Order[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data() as Omit<Order, "id">;
    orders.push({
      id: docSnap.id,
      ...data,
      orderDate: data.orderDate || data.createdAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  });
  return orders.sort((a, b) => b.orderDate - a.orderDate);
}

export async function deleteOrder(id: string): Promise<void> {
  const existingOrder = await getOrder(id);
  if (!existingOrder) return;

  if (existingOrder.status === "successful") {
    await adjustInventoryForStatusChange("successful", "cancelled", existingOrder.quantity, existingOrder.quantity, {
      productId: existingOrder.productId,
      stateId: existingOrder.stateId,
      deliveryCompanyId: existingOrder.deliveryCompanyId,
    });
  }

  await updateDoc(doc(db, "orders", id), {
    status: "cancelled",
    updatedAt: Date.now(),
  });
}
