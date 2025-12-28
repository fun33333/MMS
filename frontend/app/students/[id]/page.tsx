import { User, Phone, MapPin, Calendar, History, ArrowRight } from "lucide-react";
import Badge from "@/components/Badge";
import Link from "next/link";
import { Student } from "@/lib/api";
import StudentActions from "@/components/StudentActions";

interface PageProps {
    params: Promise<{ id: string }>;
}

import { cookies } from "next/headers";

async function getStudent(id: string): Promise<Student | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("access_token");

        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token.value}`;
        }

        const res = await fetch(`http://127.0.0.1:8000/api/students/${id}/`, {
            cache: 'no-store',
            headers: headers
        });

        if (!res.ok) {
            console.error(`Fetch failed with status: ${res.status}`);
            return null;
        }
        return res.json();
    } catch (error) {
        console.error("Failed to fetch student", error);
        return null;
    }
}

export default async function StudentDetail({ params }: PageProps) {
    const { id } = await params;
    const student = await getStudent(id);

    if (!student) {
        return (
            <div className="flex flex-col items-center justify-center h-64 font-urdu">
                <h2 className="text-xl font-bold text-gray-700">طالب علم نہیں ملا</h2>
                <Link href="/students" className="mt-4 text-green-600 hover:underline">
                    واپس جائیں
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header / Breadcrumb */}
            <div className="flex items-center gap-2 text-gray-500 text-sm font-urdu">
                <Link href="/students" className="hover:text-green-700">طلباء</Link>
                <ArrowRight className="w-4 h-4 rotate-180" /> {/* RTL arrow */}
                <span className="text-gray-900">{student.name}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-green-50/50 p-6 border-b border-gray-100 flex items-start justify-between">
                            <div className="flex gap-4">
                                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                                    <User className="w-8 h-8" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold font-urdu text-gray-900">{student.name}</h1>
                                    <p className="text-gray-700 font-urdu text-lg font-medium">ولد: {student.father_name}</p>
                                </div>
                            </div>
                            <Badge variant={student.status === "Active" ? "success" : "destructive"}>
                                {student.status === "Active" ? "حاضر" : "خارج"}
                            </Badge>
                        </div>

                        <div className="p-6 space-y-4 font-urdu">
                            <div className="flex items-center gap-3 text-gray-800">
                                <Phone className="w-5 h-5 text-gray-500" />
                                <span dir="ltr" className="font-medium">{student.mobile_number}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-800">
                                <MapPin className="w-5 h-5 text-gray-500" />
                                <span>{student.address || "کوئی پتہ نہیں"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-800">
                                <Calendar className="w-5 h-5 text-gray-500" />
                                <span>داخلہ: {student.admission_date}</span>
                            </div>
                        </div>
                    </div>

                    {/* Enrollment History */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-bold font-urdu mb-4 flex items-center gap-2 text-gray-900">
                            <History className="w-5 h-5 text-gray-600" />
                            تعلیمی ریکارڈ
                        </h2>

                        <div className="space-y-6">
                            {/* Active Enrollments */}
                            <div>
                                <h3 className="text-sm font-bold font-urdu text-green-800 mb-3 bg-green-100 inline-block px-3 py-1 rounded-full">
                                    جاری کلاسز
                                </h3>
                                <div className="space-y-3">
                                    {student.active_enrollments?.map((record, index) => (
                                        <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-green-50 border border-green-200 shadow-sm">
                                            <div className="flex-1">
                                                <h3 className="font-bold font-urdu text-xl text-gray-900">{record.enrolled_class_details.name}</h3>
                                                <div className="text-base text-gray-700 flex gap-4 mt-1 font-urdu">
                                                    <span>شروع: {record.start_date}</span>
                                                    {record.end_date && <span>ختم: {record.end_date}</span>}
                                                </div>
                                            </div>
                                            <Badge variant="success">جاری</Badge>
                                        </div>
                                    ))}
                                    {!student.active_enrollments?.length && (
                                        <p className="text-gray-500 font-urdu text-sm italic">کوئی جاری کلاس نہیں</p>
                                    )}
                                </div>
                            </div>

                            {/* Past History */}
                            <div>
                                <h3 className="text-sm font-bold font-urdu text-gray-700 mb-3 bg-gray-200 inline-block px-3 py-1 rounded-full">
                                    سابقہ ریکارڈ
                                </h3>
                                <div className="space-y-3">
                                    {student.history?.filter(h => !h.is_active).map((record, index) => (
                                        <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                                            <div className="flex-1">
                                                <h3 className="font-bold font-urdu text-lg text-gray-800">{record.enrolled_class_details.name}</h3>
                                                <div className="text-sm text-gray-600 flex gap-4 mt-1 font-urdu">
                                                    <span>شروع: {record.start_date}</span>
                                                    <span>ختم: {record.end_date || "—"}</span>
                                                    {/* Display Status if available in history API */}
                                                </div>
                                            </div>
                                            <Badge variant="secondary">مکمل / ختم</Badge>
                                        </div>
                                    ))}
                                    {!student.history?.filter(h => !h.is_active).length && (
                                        <p className="text-gray-500 font-urdu text-sm italic">کوئی سابقہ ریکارڈ نہیں</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Actions */}
                {/* Right Column: Actions */}
                <div className="space-y-4">
                    <StudentActions
                        student={student}
                        currentClassId={student.active_enrollments?.[0]?.enrolled_class}
                    />
                </div>
            </div>
        </div>
    );
}
