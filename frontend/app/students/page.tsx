"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Filter } from "lucide-react";
import StudentCard from "@/components/StudentCard";
import Badge from "@/components/Badge";
import api, { Student } from "@/lib/api";

export default function StudentList() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const { data } = await api.get("/students/");
            setStudents(data);
        } catch (error) {
            console.error("Failed to fetch students", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.includes(search) || s.mobile_number.includes(search)
    );

    if (loading) return <div className="p-8 text-center font-urdu text-gray-600">لوڈنگ...</div>;

    return (
        <div className="space-y-6">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-urdu text-[var(--color-primary)]">طلباء کی فہرست</h1>
                    <p className="text-sm text-gray-700 font-urdu font-bold">کل طلباء: {filteredStudents.length}</p>
                </div>

                <Link
                    href="/students/add"
                    className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg font-urdu flex items-center justify-center gap-2 hover:bg-green-800 transition shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    نیا طالب علم
                </Link>
            </div>

            {/* Search & Filter */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="تلاش کریں (نام، فون نمبر)..."
                        className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-200 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] font-urdu"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                {/* ... Filter and Print buttons ... */}
                <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 no-print">
                    <Filter className="w-5 h-5" />
                </button>
                <button
                    onClick={() => window.print()}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 no-print"
                    title="پرنٹ"
                >
                    🖨️
                </button>
            </div>

            {/* ... Mobile View ... */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredStudents.map((student) => (
                    <StudentCard
                        key={student.id}
                        name={student.name}
                        fatherName={student.father_name}
                        status={student.status}
                        enrollment={student.active_enrollments?.[0]?.enrolled_class_details?.name}
                        onView={() => console.log("View", student.id)}
                    />
                ))}
                {filteredStudents.length === 0 && (
                    <p className="text-center text-gray-500 font-urdu py-4">کوئی طالب علم نہیں ملا</p>
                )}
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-right font-urdu">
                    <thead className="bg-[#f0fdf4] text-[#15803d] text-sm font-bold border-b border-green-100">
                        <tr>
                            <th className="px-6 py-3">نام</th>
                            <th className="px-6 py-3">ولدیت</th>
                            <th className="px-6 py-3">موبائل نمبر</th>
                            <th className="px-6 py-3">کلاس</th>
                            <th className="px-6 py-3">اسٹیٹس</th>
                            <th className="px-6 py-3">عمل</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredStudents.map((student) => (
                            <tr key={student.id} className="hover:bg-green-50/50 transition">
                                <td className="px-6 py-4 font-bold text-gray-900">{student.name}</td>
                                <td className="px-6 py-4 text-gray-800 font-medium">{student.father_name}</td>
                                <td className="px-6 py-4 font-mono text-sm text-gray-900 font-bold" dir="ltr">{student.mobile_number}</td>
                                <td className="px-6 py-4">
                                    {student.active_enrollments && student.active_enrollments.length > 0 ? (
                                        <span className="bg-blue-50 text-blue-900 px-2 py-1 rounded text-sm font-bold border border-blue-100">
                                            {student.active_enrollments[0].enrolled_class_details.name}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 text-xs">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant={student.status === "Active" ? "success" : "destructive"}>
                                        {student.status === "Active" ? "حاضر" : "خارج"}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4">
                                    <Link href={`/students/${student.id}`} className="text-[var(--color-primary)] hover:text-green-900 font-bold underline">
                                        تفصیل دیکھیں
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {filteredStudents.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-gray-600 font-urdu font-medium">
                                    کوئی ریکارڈ موجود نہیں
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
