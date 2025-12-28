"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Building2, Edit, ToggleLeft, ToggleRight } from "lucide-react";
import api from "@/lib/api";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import { useAuth } from "@/lib/auth";

interface Campus {
  id: number;
  name: string;
  location: string;
  capacity: number;
  is_active: boolean;
}

export default function CampusesPage() {
  const { user } = useAuth();
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", location: "", capacity: 100 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCampuses();
  }, []);

  const fetchCampuses = async () => {
    try {
      const { data } = await api.get("/campuses/");
      setCampuses(data);
    } catch (error) {
      console.error("Failed to fetch campuses", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.name) return;
    setSubmitting(true);
    try {
      await api.post("/campuses/", formData);
      setShowAddModal(false);
      setFormData({ name: "", location: "", capacity: 100 });
      fetchCampuses();
    } catch (error) {
      console.error("Failed to add campus", error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCampuses = campuses.filter(c =>
    c.name.includes(search) || c.location.includes(search)
  );

  if (loading) return <div className="p-8 text-center font-urdu text-gray-500">لوڈنگ...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-urdu flex items-center gap-2 text-[var(--color-primary)]">
            <Building2 className="w-7 h-7" />
            کیمپسز
          </h1>
          <p className="text-sm text-gray-700 font-urdu font-bold">کل کیمپسز: {filteredCampuses.length}</p>
        </div>

        {user?.isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg font-urdu flex items-center justify-center gap-2 hover:bg-green-800 transition shadow-sm"
          >
            <Plus className="w-5 h-5" />
            نیا کیمپس
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="تلاش کریں..."
          className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-200 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] font-urdu"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCampuses.map((campus) => (
          <div key={campus.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:border-green-300 transition group">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold font-urdu text-lg text-gray-900">{campus.name}</h3>
              <Badge variant={campus.is_active ? "success" : "secondary"}>
                {campus.is_active ? "فعال" : "غیر فعال"}
              </Badge>
            </div>
            <p className="text-gray-700 font-urdu text-sm mb-2 font-medium">{campus.location || "—"}</p>
            {user?.isAdmin && (
              <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-sm">
                <span className="text-gray-800 font-urdu font-semibold">گنجائش: {campus.capacity}</span>
                <button className="text-[var(--color-primary)] hover:text-green-900 font-urdu font-bold underline">ایڈیٹ</button>
              </div>
            )}
          </div>
        ))}
        {filteredCampuses.length === 0 && (
          <p className="text-center text-gray-400 font-urdu py-8 col-span-full">کوئی ریکارڈ نہیں</p>
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="نیا کیمپس">
        <div className="space-y-4" dir="rtl">
          {/* ... Inputs ... */}
          <div className="space-y-1">
            <label className="block text-sm font-medium font-urdu text-gray-700">کیمپس کا نام *</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-400 rounded-lg font-urdu"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium font-urdu text-gray-700">مقام</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-400 rounded-lg font-urdu"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium font-urdu text-gray-700">گنجائش</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-400 rounded-lg"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={submitting}
            className="w-full bg-[var(--color-primary)] text-white py-2 rounded-lg font-urdu hover:bg-green-800 transition disabled:opacity-50 font-bold"
          >
            {submitting ? "محفوظ ہو رہا ہے..." : "محفوظ کریں"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
