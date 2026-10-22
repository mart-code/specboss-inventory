"use client";

import { useState, useEffect } from "react";
import { Expense } from "@/lib/data/expenses";

interface ExpenseFormProps {
  expense?: Expense | null;
  onSuccess: () => void;
  onCancel: () => void;
  onSave: (data: { title: string; category?: string; amount: number; date: number; notes?: string }) => Promise<void>;
}

export function ExpenseForm({ expense, onSuccess, onCancel, onSave }: ExpenseFormProps) {
  const isEditing = !!expense;
  const [title, setTitle] = useState(expense?.title || "");
  const [category, setCategory] = useState(expense?.category || "");
  const [amount, setAmount] = useState(expense ? String(expense.amount) : "");
  const [date, setDate] = useState(expense ? new Date(expense.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState(expense?.notes || "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (expense) {
      setTitle(expense.title);
      setCategory(expense.category || "");
      setAmount(String(expense.amount));
      setDate(new Date(expense.date).toISOString().split("T")[0]);
      setNotes(expense.notes || "");
    }
  }, [expense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount) || 0;
    if (!title || amt <= 0) return;
    setSubmitting(true);
    try {
      await onSave({ title, category: category || undefined, amount: amt, date: new Date(date).getTime(), notes: notes || undefined });
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
        <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={3} />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-md">{submitting ? "Saving..." : isEditing ? "Update" : "Create"}</button>
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
      </div>
    </form>
  );
}
