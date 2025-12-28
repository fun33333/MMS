"use client";

import { useState, useEffect } from "react";
import { Plus, Search, BookOpen } from "lucide-react";
import api from "@/lib/api";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import { useAuth } from "@/lib/auth";

interface Program {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
}

export default function ProgramsPage() {
    const { user } = useAuth();
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchPrograms();
    }, []);

    const fetchPrograms = async () => {
        try {
            const { data } = await api.get("/programs/");
            setPrograms(data);
        } catch (error) {
            console.error("Failed to fetch programs", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!formData.name) return;
        setSubmitting(true);
        try {
            await api.post("/programs/", formData);
            setShowAddModal(false);
            setFormData({ name: "", description: "" });
            fetchPrograms();
        } catch (error) {
            console.error("Failed to add program", error);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredPrograms = programs.filter(p =>
        p.name.includes(search) || p.description?.includes(search)
    );

    if (loading) return <div className="p-8 text-center font-urdu text-gray-500">لوڈنگ...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-urdu flex items-center gap-2 text-[var(--color-secondary)]">
                        <BookOpen className="w-7 h-7" />
                        پروگرامز
                    </h1>
                    <p className="text-sm text-gray-700 font-urdu font-bold">کل پروگرامز: {filteredPrograms.length}</p>
                </div>

                {user?.isAdmin && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-[var(--color-secondary)] text-white px-4 py-2 rounded-lg font-urdu flex items-center justify-center gap-2 hover:bg-sky-600 transition shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        نیا پروگرام
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="تلاش کریں..."
                    className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-200 focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] font-urdu"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPrograms.map((program) => (
                    <div key={program.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:border-sky-300 transition group">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold font-urdu text-lg text-gray-900">{program.name}</h3>
                            <Badge variant={program.is_active ? "success" : "secondary"}>
                                {program.is_active ? "فعال" : "غیر فعال"}
                            </Badge>
                        </div>
                        <p className="text-gray-700 font-urdu text-sm line-clamp-2">{program.description || "—"}</p>
                        {user?.isAdmin && (
                            <div className="flex justify-end items-center pt-3 border-t border-gray-100 mt-3">
                                <button className="text-[var(--color-secondary)] hover:text-sky-800 font-urdu text-sm font-bold underline">ایڈیٹ</button>
                            </div>
                        )}
                    </div>
                ))}
                {filteredPrograms.length === 0 && (
                    <p className="text-center text-gray-400 font-urdu py-8 col-span-full">کوئی ریکارڈ نہیں</p>
                )}
            </div>

            {/* Add Modal */}
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="نیا پروگرام">
                <div className="space-y-4" dir="rtl">
                    <div className="space-y-1">
                        <label className="block text-sm font-medium font-urdu text-gray-700">پروگرام کا نام *</label>
                        <input
                            type="text"
                            placeholder="مثال: ناظرہ، حفظ، تجوید"
                            className="w-full px-3 py-2 border border-gray-400 rounded-lg font-urdu"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-sm font-medium font-urdu text-gray-700">تفصیل</label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-400 rounded-lg font-urdu"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <button
                        onClick={handleAdd}
                        disabled={submitting}
                        className="w-full bg-[var(--color-secondary)] text-white py-2 rounded-lg font-urdu hover:bg-sky-600 transition disabled:opacity-50 font-bold"
                    >
                        {submitting ? "محفوظ ہو رہا ہے..." : "محفوظ کریں"}
                    </button>
                </div>
            </Modal>
        </div>
    );
}
