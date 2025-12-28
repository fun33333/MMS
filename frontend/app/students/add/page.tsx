"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api, { Class } from "@/lib/api";
import { formatCNIC, formatMobile, validateCNIC, validateMobile } from "@/lib/validation";

export default function AddStudent() {
    const router = useRouter();
    const [classes, setClasses] = useState<Class[]>([]);
    const [loadingClasses, setLoadingClasses] = useState(true);

    const [formData, setFormData] = useState({
        name: "",
        father_name: "",
        mobile_number: "",
        cnic: "",
        address: "",
        class_id: "",
        admission_date: new Date().toISOString().split('T')[0]
    });

    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Fetch Classes for Dropdown
        api.get("/classes/").then(({ data }) => {
            setClasses(data);
            setLoadingClasses(false);
        }).catch(err => console.error("Failed to load classes", err));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        // Basic Validation
        if (!formData.name || !formData.father_name || !formData.mobile_number) {
            setError("براہ کرم تمام ضروری خانے پُر کریں۔");
            setSubmitting(false);
            return;
        }

        if (!validateMobile(formData.mobile_number)) {
            setError("موبائل نمبر کا فارمیٹ درست نہیں ہے۔ (+92-3XX-XXXXXXX)");
            setSubmitting(false);
            return;
        }

        if (formData.cnic && !validateCNIC(formData.cnic)) {
            setError("شناختی کارڈ کا فارمیٹ درست نہیں ہے۔ (XXXXX-XXXXXXX-X)");
            setSubmitting(false);
            return;
        }

        try {
            // 1. Create Student
            const studentPayload = {
                name: formData.name,
                father_name: formData.father_name,
                mobile_number: formData.mobile_number,
                cnic: formData.cnic,
                address: formData.address,
                // admission_date is read-only auto_now_add in model usually, but let's see if we passed it in serializer
                // If serializer doesn't accept admission_date, it will be ignored which is fine (defaults to today)
            };

            const { data: student } = await api.post("/students/", studentPayload);

            // 2. Enroll in Class (if selected)
            if (formData.class_id && student.id) {
                await api.post(`/students/${student.id}/enroll/`, {
                    class_id: formData.class_id
                });
            }

            router.push("/students");

        } catch (err: any) {
            console.error("Submission failed", err);
            setError(err.response?.data?.error || "محفوظ کرنے میں ناکامی ہوئی۔ دوبارہ کوشش کریں۔");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 text-right" dir="rtl">
            {/* Header */}
            <div className="flex items-center gap-2 text-gray-500 text-sm font-urdu">
                <Link href="/students" className="hover:text-green-700">طلباء</Link>
                <ArrowRight className="w-4 h-4 rotate-180" />
                <span className="text-gray-900">نیا اندراج</span>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h1 className="text-2xl font-bold font-urdu mb-6 border-b border-gray-100 pb-4">
                    نیا طالب علم داخل کریں
                </h1>

                {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 font-urdu text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Section 1: Personal Info */}
                    <div>
                        <h3 className="text-lg font-bold font-urdu text-gray-700 mb-4">ذاتی معلومات</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="block text-sm font-medium font-urdu text-gray-700">نام طالب علم *</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-urdu"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-medium font-urdu text-gray-700">نام والد *</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-urdu"
                                    value={formData.father_name}
                                    onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-medium font-urdu text-gray-700">موبائل نمبر * (+92-3XX-XXXXXXX)</label>
                                <input
                                    type="text"
                                    placeholder="+92-300-1234567"
                                    className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    dir="ltr"
                                    value={formData.mobile_number}
                                    onChange={(e) => setFormData({ ...formData, mobile_number: formatMobile(e.target.value) })}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-medium font-urdu text-gray-700">شناختی کارڈ / ب فارم (اختیاری)</label>
                                <input
                                    type="text"
                                    placeholder="XXXXX-XXXXXXX-X"
                                    className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    dir="ltr"
                                    value={formData.cnic}
                                    onChange={(e) => setFormData({ ...formData, cnic: formatCNIC(e.target.value) })}
                                />
                            </div>
                            <div className="md:col-span-2 space-y-1">
                                <label className="block text-sm font-medium font-urdu text-gray-700">پتہ</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-urdu"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Enrollment Info */}
                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-lg font-bold font-urdu text-gray-700 mb-4">داخلہ کی تفصیلات</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="block text-sm font-medium font-urdu text-gray-700">تاریخ داخلہ</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    value={formData.admission_date}
                                    onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-medium font-urdu text-gray-700">کلاس / شعبہ</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-urdu"
                                    value={formData.class_id}
                                    onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                    disabled={loadingClasses}
                                >
                                    <option value="">منتخب کریں...</option>
                                    {classes.map(cls => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name} ({cls.shift})
                                        </option>
                                    ))}
                                </select>
                                {loadingClasses && <p className="text-xs text-gray-400">کلاسز لوڈ ہو رہی ہیں...</p>}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-6 flex justify-end gap-3">
                        <Link
                            href="/students"
                            className="px-4 py-2 border border-gray-400 rounded-lg text-gray-700 font-urdu hover:bg-gray-50 transition"
                        >
                            منسوخ کریں
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg font-urdu hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {submitting ? "محفوظ ہو رہا ہے..." : "محفوظ کریں"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
