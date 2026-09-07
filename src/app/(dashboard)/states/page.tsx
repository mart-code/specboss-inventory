"use client";

import { useState, useEffect } from "react";
import { State } from "@/lib/types";
import { getStates, seedStatesIfEmpty } from "@/lib/data/states";
import { formatDate } from "@/lib/utils";

export default function StatesPage() {
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);

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

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">State</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Active</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Created</th>
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
              </tr>
            ))}
            {states.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-4 text-center text-gray-500">
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
