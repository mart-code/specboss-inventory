"use client";

import { useState, useEffect } from "react";
import { State } from "@/lib/types";
import { getStates, seedStatesIfEmpty, updateState, deleteState } from "@/lib/data/states";
import { useToast } from "@/components/ui/toast-context";
import { formatDate } from "@/lib/utils";

export default function StatesPage() {
  const { showToast } = useToast();
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingState, setEditingState] = useState<State | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [isActiveInput, setIsActiveInput] = useState(true);

  const loadStates = async () => {
    setLoading(true);
    try {
      await seedStatesIfEmpty();
      const data = await getStates();
      setStates(data);
    } catch (error) {
      console.error("Failed to load states", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStates();
  }, []);

  const handleEdit = (state: State) => {
    setEditingState(state);
    setNameInput(state.name);
    setIsActiveInput(state.isActive);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingState) return;

    try {
      await updateState(editingState.id, {
        name: nameInput,
        isActive: isActiveInput,
      });
      showToast("State updated", "success");
      setEditingState(null);
      loadStates();
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : "Failed to update state", "error");
    }
  };

  const handleDelete = async (state: State) => {
    const confirmed = window.confirm(`Delete ${state.name}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteState(state.id);
      showToast("State deleted", "success");
      loadStates();
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : "Failed to delete state", "error");
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">States</h1>
        <button
          onClick={loadStates}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Refresh States
        </button>
      </div>

      {editingState && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Edit State</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="stateActive"
                  checked={isActiveInput}
                  onChange={(e) => setIsActiveInput(e.target.checked)}
                />
                <label htmlFor="stateActive" className="text-sm text-gray-700">
                  Active
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingState(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">State</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Active</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {states.map((state) => (
              <tr key={state.id} className="border-t text-gray-500">
                <td className="px-4 py-2">{state.name}</td>
                <td className="px-4 py-2">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    state.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {state.isActive ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-4 py-2">{formatDate(state.createdAt)}</td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => handleEdit(state)}
                    className="text-blue-600 hover:text-blue-800 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(state)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {states.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                  No states found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
