import { collection, query, getDocs, setDoc, getDoc, doc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { State } from "@/lib/types";

const NIGERIAN_STATES = ["Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT"];

export async function getStates(): Promise<State[]> {
  const snapshot = await getDocs(collection(db, "states"));
  const states: State[] = [];
  snapshot.forEach((docSnap) => {
    states.push({
      id: docSnap.id,
      ...(docSnap.data() as Omit<State, "id">),
    });
  });
  return states.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getState(id: string): Promise<State | null> {
  const docSnap = await getDoc(doc(db, "states", id));
  if (!docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...(docSnap.data() as Omit<State, "id">),
  };
}

export async function seedStatesIfEmpty(): Promise<void> {
  const snapshot = await getDocs(collection(db, "states"));
  if (!snapshot.empty) {
    return;
  } else {
    const now = Date.now();
    for (const stateName of NIGERIAN_STATES) {
      const stateId = stateName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      await setDoc(doc(db, "states", stateId), {
        name: stateName,
        isActive: true,
        createdAt: now,
      });
    }
  }
}

export async function getStateByName(name: string): Promise<State | null> {
  const q = query(collection(db, "states"), where("name", "==", name));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return {
    id: docSnap.id,
    ...(docSnap.data() as Omit<State, "id">),
  };
}
