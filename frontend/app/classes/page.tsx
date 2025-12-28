"use client";

import { useState, useEffect } from "react";
import { Plus, Search, GraduationCap } from "lucide-react";
import api, { Class } from "@/lib/api";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import { useAuth } from "@/lib/auth";

interface Campus { id: number; name: string; }
interface Program { id: number; name: string; }

export default function ClassesPage() {
    const { user } = useAuth();
    const [classes, setClasses] = useState<Class[]>([]);
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        campus: "",
        program: "",
        shift: "Morning",
        capacity: "30"
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [classRes, campusRes, programRes] = await Promise.all([
                api.get("/classes/"),
                api.get("/campuses/"),
                api.get("/programs/")
            ]);
            setClasses(classRes.data);
            setCampuses(campusRes.data);
            setPrograms(programRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!formData.name || !formData.campus || !formData.program) return;
        setSubmitting(true);
        try {
            await api.post("/classes/", {
                ...formData,
                capacity: parseInt(formData.capacity) || 30
            });
            setShowAddModal(false);
            setFormData({ name: "", campus: "", program: "", shift: "Morning", capacity: "30" });
            fetchData();
        } catch (error) {
            console.error("Failed to add class", error);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredClasses = classes.filter(c =>
        c.name.includes(search) || c.shift.includes(search)
    );

    const shiftLabels: Record<string, string> = {
        "Morning": "صبح",
        "Afternoon": "دوپہر",
        "Evening": "شام"
    };

    if (loading) return <div className="p-8 text-center font-urdu text-gray-500">لوڈنگ...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-urdu flex items-center gap-2 text-[var(--color-accent)]">
                        <GraduationCap className="w-7 h-7" />
                        کلاسز
                    </h1>
                    <p className="text-sm text-gray-700 font-urdu font-bold">کل کلاسز: {filteredClasses.length}</p>
                </div>

                {user?.isAdmin && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-[var(--color-accent)] text-white px-4 py-2 rounded-lg font-urdu flex items-center justify-center gap-2 hover:bg-amber-600 transition shadow-sm hover:shadow"
                    >
                        <Plus className="w-5 h-5" />
                        نئی کلاس
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="تلاش کریں..."
                    className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-200 focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] font-urdu"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-right font-urdu">
                    <thead className="bg-[#fffbeb] text-[#92400e] text-sm font-bold border-b border-amber-100">
                        <tr>
                            <th className="px-6 py-3">نام</th>
                            <th className="px-6 py-3">کیمپس</th>
                            <th className="px-6 py-3">پروگرام</th>
                            <th className="px-6 py-3">شفٹ</th>
                            <th className="px-6 py-3">گنجائش</th>
                            {user?.isAdmin && <th className="px-6 py-3">عمل</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredClasses.map((cls) => (
                            <tr key={cls.id} className="hover:bg-amber-50/50 transition">
                                <td className="px-6 py-4 font-bold text-gray-900">{cls.name}</td>
                                <td className="px-6 py-4 text-gray-800 font-medium">{cls.campus_name}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-blue-50 text-blue-900 px-2 py-1 rounded text-sm font-bold border border-blue-100">
                                        {cls.program_name}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant="outline" className="text-gray-900 border-gray-400 font-medium">{shiftLabels[cls.shift] || cls.shift}</Badge>
                                </td>
                                <td className="px-6 py-4 text-gray-900 font-bold">{cls.capacity || "—"}</td>
                                {user?.isAdmin && (
                                    <td className="px-6 py-4">
                                        <button className="text-[var(--color-accent)] hover:text-amber-700 font-bold text-sm underline">ایڈیٹ</button>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {filteredClasses.length === 0 && (
                            <tr>
                                <td colSpan={user?.isAdmin ? 6 : 5} className="text-center py-8 text-gray-400 font-urdu">کوئی ریکارڈ نہیں</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Modal */}
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="نئی کلاس">
                <div className="space-y-4" dir="rtl">
                    <div className="space-y-1">
                        <label className="block text-sm font-medium font-urdu text-gray-700">کلاس کا نام *</label>
                        <input
                            type="text"
                            placeholder="مثال: ناظرہ A، حفظ 1"
                            className="w-full px-3 py-2 border border-gray-400 rounded-lg font-urdu"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium font-urdu text-gray-700">کیمپس *</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-400 rounded-lg font-urdu"
                                value={formData.campus}
                                onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                            >
                                <option value="">منتخب کریں</option>
                                {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-medium font-urdu text-gray-700">پروگرام *</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-400 rounded-lg font-urdu"
                                value={formData.program}
                                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                            >
                                <option value="">منتخب کریں</option>
                                {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium font-urdu text-gray-700">شفٹ</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-400 rounded-lg font-urdu"
                                value={formData.shift}
                                onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                            >
                                <option value="Morning">صبح</option>
                                <option value="Afternoon">دوپہر</option>
                                <option value="Evening">شام</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-medium font-urdu text-gray-700">گنجائش</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 border border-gray-400 rounded-lg"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleAdd}
                        disabled={submitting}
                        className="w-full bg-[var(--color-accent)] text-white py-2 rounded-lg font-urdu hover:bg-amber-600 transition disabled:opacity-50 font-bold"
                    >
                        {submitting ? "محفوظ ہو رہا ہے..." : "محفوظ کریں"}
                    </button>
                </div>
            </Modal>
        </div>
    );
}
