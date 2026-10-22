export interface Expense {
  id: string;
  title: string;
  category?: string;
  amount: number;
  date: number;
  notes?: string;
  createdAt: number;
}

const STORAGE_KEY = "sb_expenses";

function readStorage(): Expense[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Expense[];
  } catch (e) {
    console.error("Failed to read expenses from storage", e);
    return [];
  }
}

function writeStorage(items: Expense[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to write expenses to storage", e);
  }
}

export async function getExpenses(): Promise<Expense[]> {
  // simple client-side persistence
  return readStorage().sort((a, b) => b.date - a.date);
}

export async function createExpense(data: Omit<Expense, "id" | "createdAt">): Promise<Expense> {
  const now = Date.now();
  const id = `exp_${now}_${Math.floor(Math.random() * 1000)}`;
  const newItem: Expense = { id, createdAt: now, ...data } as Expense;
  const items = readStorage();
  items.push(newItem);
  writeStorage(items);
  return newItem;
}

export async function updateExpense(id: string, data: Partial<Expense>): Promise<void> {
  const items = readStorage();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) throw new Error("Expense not found");
  items[idx] = { ...items[idx], ...data, updatedAt: Date.now() } as Expense;
  writeStorage(items);
}

export async function deleteExpense(id: string): Promise<void> {
  const items = readStorage().filter((i) => i.id !== id);
  writeStorage(items);
}

export interface ExpenseFilters {
  q?: string;
  category?: string;
  dateFrom?: number;
  dateTo?: number;
  minAmount?: number;
  maxAmount?: number;
}

export async function searchExpenses(filters: ExpenseFilters): Promise<Expense[]> {
  let items = readStorage();
  if (filters.q) {
    const q = filters.q.toLowerCase();
    items = items.filter((i) => i.title.toLowerCase().includes(q) || (i.notes || "").toLowerCase().includes(q));
  }
  if (filters.category) items = items.filter((i) => i.category === filters.category);
  if (filters.dateFrom !== undefined) items = items.filter((i) => i.date >= filters.dateFrom!);
  if (filters.dateTo !== undefined) items = items.filter((i) => i.date <= filters.dateTo!);
  if (filters.minAmount !== undefined) items = items.filter((i) => i.amount >= filters.minAmount!);
  if (filters.maxAmount !== undefined) items = items.filter((i) => i.amount <= filters.maxAmount!);
  return items.sort((a, b) => b.date - a.date);
}
