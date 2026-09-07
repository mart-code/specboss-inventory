import {
  collection,
  query,
  orderBy,
  addDoc,
  updateDoc,
  getDocs,
  doc,
  getDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DeliveryCompany } from "@/lib/types";

export async function getDeliveryCompanies(activeOnly = true): Promise<DeliveryCompany[]> {
  let q = query(collection(db, "deliveryCompanies"), orderBy("name"));
  if (activeOnly) {
    q = query(collection(db, "deliveryCompanies"), where("isActive", "==", true), orderBy("name"));
  }
  const snapshot = await getDocs(q);
  const companies: DeliveryCompany[] = [];
  snapshot.forEach((docSnap) => {
    companies.push({
      id: docSnap.id,
      ...(docSnap.data() as Omit<DeliveryCompany, "id">),
    });
  });
  return companies;
}

export async function getDeliveryCompany(id: string): Promise<DeliveryCompany | null> {
  const docSnap = await getDoc(doc(db, "deliveryCompanies", id));
  if (!docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...(docSnap.data() as Omit<DeliveryCompany, "id">),
  };
}

export async function createDeliveryCompany(name: string): Promise<string> {
  const now = Date.now();
  const docRef = await addDoc(collection(db, "deliveryCompanies"), {
    name,
    isActive: true,
    createdAt: now,
  });
  return docRef.id;
}

export async function updateDeliveryCompany(id: string, data: { name?: string; isActive?: boolean }): Promise<void> {
  await updateDoc(doc(db, "deliveryCompanies", id), data);
}

export async function toggleDeliveryCompanyStatus(id: string, isActive: boolean): Promise<void> {
  await updateDoc(doc(db, "deliveryCompanies", id), { isActive });
}
