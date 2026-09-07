"use client";

import { useState, useEffect } from "react";
import { DeliveryCompany } from "@/lib/types";
import {
  getDeliveryCompanies,
  createDeliveryCompany,
  updateDeliveryCompany,
  toggleDeliveryCompanyStatus,
} from "@/lib/data/delivery-companies";
import { useToast } from "@/components/ui/toast-context";
import { formatDate } from "@/lib/utils";

export default function DeliveryCompaniesPage() {
  const { showToast } = useToast();
  const [companies, setCompanies] = useState<DeliveryCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<DeliveryCompany | null>(null);
  const [nameInput, setNameInput] = useState("");

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const data = await getDeliveryCompanies(false);
      setCompanies(data);
    } catch (error) {
      console.error("Failed to load companies", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCompany) {
        await updateDeliveryCompany(editingCompany.id, { name: nameInput });
        showToast("Delivery company updated", "success");
      } else {
        await createDeliveryCompany(nameInput);
        showToast("Delivery company added", "success");
      }
      setShowForm(false);
      setEditingCompany(null);
      setNameInput("");
      loadCompanies();
    } catch {
      showToast("Failed to save delivery company", "error");
    }
  };

  const handleToggleStatus = async (company: DeliveryCompany) => {
    try {
      await toggleDeliveryCompanyStatus(company.id, !company.isActive);
      setCompanies(companies.map((c) =>
        c.id === company.id ? { ...c, isActive: !c.isActive } : c
      ));
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Delivery Companies</h1>
        <button
          onClick={() => { setEditingCompany(null); setNameInput(""); setShowForm(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Delivery Company
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              {editingCompany ? "Edit Delivery Company" : "Add New Delivery Company"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex gap-3 pt-2">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  {editingCompany ? "Save" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingCompany(null); }}
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
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Active</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id} className="border-t text-gray-500">
                <td className="px-4 py-2">{company.name}</td>
                <td className="px-4 py-2">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    company.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {company.isActive ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-4 py-2">{formatDate(company.createdAt)}</td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => { setEditingCompany(company); setNameInput(company.name); setShowForm(true); }}
                    className="text-blue-600 hover:text-blue-800 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(company)}
                    className={`${
                      company.isActive
                        ? "text-orange-600 hover:text-orange-800"
                        : "text-green-600 hover:text-green-800"
                    }`}
                  >
                    {company.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
            {companies.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                  No delivery companies yet. Click &quot;Add Delivery Company&quot; to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
