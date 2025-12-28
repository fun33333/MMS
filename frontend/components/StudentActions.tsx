"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import api, { Class, Student } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatCNIC, formatMobile, validateCNIC, validateMobile } from "@/lib/validation";

interface StudentActionsProps {
    student: Student;
    currentClassId?: number;
}

export default function StudentActions({ student, currentClassId }: StudentActionsProps) {
    const studentId = student.id;
    const router = useRouter();
    const { user } = useAuth();
    const isAdmin = user?.isAdmin || user?.isStaff === false;
    const showActions = user?.isAdmin;

    // Modal States
    const [showChangeClass, setShowChangeClass] = useState(false);
    const [showDeactivate, setShowDeactivate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showEnroll, setShowEnroll] = useState(false);

    // Data States
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form States for Change Class
    const [newClassId, setNewClassId] = useState("");
    const [reason, setReason] = useState("");
    const [closureStatus, setClosureStatus] = useState("Transferred");
    const [progressNotes, setProgressNotes] = useState("");
    const [selectedOldClassId, setSelectedOldClassId] = useState(currentClassId ? String(currentClassId) : "");

    // Form States for Enroll
    const [enrollClassId, setEnrollClassId] = useState("");

    // Edit Form State
    const [editFormData, setEditFormData] = useState({
        name: "",
        father_name: "",
        mobile_number: "",
        cnic: "",
        address: ""
    });

    useEffect(() => {
        if ((showChangeClass || showEnroll) && classes.length === 0) {
            api.get("/classes/").then(({ data }) => setClasses(data));
        }
        if (showChangeClass) {
            // Default to passed currentClassId or first active enrollment
            if (currentClassId) {
                setSelectedOldClassId(String(currentClassId));
            } else if (student.active_enrollments && student.active_enrollments.length > 0) {
                setSelectedOldClassId(String(student.active_enrollments[0].enrolled_class));
            }
        }
    }, [showChangeClass, showEnroll, currentClassId, student]);

    // Initialize Edit Form when modal opens
    useEffect(() => {
        if (showEdit) {
            setEditFormData({
                name: student.name,
                father_name: student.father_name,
                mobile_number: formatMobile(student.mobile_number),
                cnic: student.cnic ? formatCNIC(student.cnic) : "",
                address: student.address || ""
            });
        }
    }, [showEdit, student]);

    const handleChangeClass = async () => {
        if (!newClassId || !reason) {
            setError("نئی کلاس اور وجہ بیان کرنا ضروری ہے");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await api.post(`/students/${studentId}/change-class/`, {
                old_class_id: selectedOldClassId,
                new_class_id: newClassId,
                reason: reason,
                closure_status: closureStatus,
                progress_notes: progressNotes
            });

            setShowChangeClass(false);
            router.refresh();
            setReason("");
            setNewClassId("");
            setProgressNotes("");
        } catch (err: any) {
            setError(err.response?.data?.error || "غلطی: کلاس تبدیل نہیں ہو سکی");
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        if (!enrollClassId) {
            setError("کلاس منتخب کرنا ضروری ہے");
            return;
        }

        // Check for duplicate enrollment
        const isAlreadyEnrolled = student.active_enrollments?.some(e => e.enrolled_class === parseInt(enrollClassId));
        if (isAlreadyEnrolled) {
            setError("طالب علم پہلے ہی اس کلاس میں موجود ہے۔");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await api.post(`/students/${studentId}/enroll/`, {
                class_id: enrollClassId
            });
            setShowEnroll(false);
            router.refresh();
            setEnrollClassId("");
        } catch (err: any) {
            setError(err.response?.data?.error || "داخلہ نہیں ہو سکا");
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivate = async () => {
        if (!reason) {
            setError("وجہ بیان کرنا ضروری ہے");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await api.post(`/students/${studentId}/deactivate/`, {
                reason: reason
            });

            setShowDeactivate(false);
            router.refresh();
            setReason("");
        } catch (err: any) {
            setError(err.response?.data?.error || "غلطی: طالب علم غیر فعال نہیں ہو سکا");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        setError("");

        if (!editFormData.name || !editFormData.father_name || !editFormData.mobile_number) {
            setError("براہ کرم تمام ضروری خانے پُر کریں۔");
            return;
        }
        if (!validateMobile(editFormData.mobile_number)) {
            setError("موبائل نمبر کا فارمیٹ درست نہیں ہے۔");
            return;
        }
        if (editFormData.cnic && !validateCNIC(editFormData.cnic)) {
            setError("شناختی کارڈ کا فارمیٹ درست نہیں ہے۔");
            return;
        }

        setLoading(true);
        try {
            await api.patch(`/students/${studentId}/`, editFormData);
            setShowEdit(false);
            router.refresh();
        } catch (err: any) {
            setError(err.response?.data?.error || "اپ ڈیٹ کرنے میں ناکامی ہوئی۔");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 no-print">
                <h3 className="font-bold font-urdu mb-4 text-lg">انتظامی امور</h3>
                <div className="space-y-3">
                    {showActions && (
                        <>
                            <button
                                onClick={() => setShowEnroll(true)}
                                className="w-full bg-green-600 text-white py-2 rounded-lg font-urdu hover:bg-green-700 transition"
                            >
                                نئی کلاس میں داخلہ (Add Class)
                            </button>
                            <button
                                onClick={() => setShowChangeClass(true)}
                                disabled={!currentClassId}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg font-urdu hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                کلاس تبدیل / ٹرانسفر کریں
                            </button>
                            <button
                                onClick={() => setShowEdit(true)}
                                className="w-full bg-white border border-gray-400 text-gray-700 py-2 rounded-lg font-urdu hover:bg-gray-50 transition"
                            >
                                پروفائل ایڈیٹ کریں
                            </button>
                        </>
                    )}

                    <button
                        onClick={() => window.print()}
                        className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-urdu hover:bg-gray-200 transition"
                    >
                        🖨️ پرنٹ کریں
                    </button>

                    {showActions && (
                        <button
                            onClick={() => setShowDeactivate(true)}
                            className="w-full text-red-600 py-2 rounded-lg font-urdu hover:bg-red-50 transition text-sm"
                        >
                            غیر فعال / خارج کریں
                        </button>
                    )}
                </div>
            </div>

            {/* Enroll Modal */}
            <Modal isOpen={showEnroll} onClose={() => setShowEnroll(false)} title="نئی کلاس میں داخلہ">
                <div className="space-y-4" dir="rtl">
                    {error && <div className="text-red-600 bg-red-50 p-2 rounded text-sm font-urdu">{error}</div>}
                    <div className="space-y-1">
                        <label className="block text-sm font-medium font-urdu text-gray-700">کلاس منتخب کریں</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-400 rounded-lg font-urdu"
                            value={enrollClassId}
                            onChange={(e) => setEnrollClassId(e.target.value)}
                        >
                            <option value="">منتخب کریں...</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>{cls.name} ({cls.shift})</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={handleEnroll} disabled={loading} className="w-full bg-green-600 text-white py-2 rounded-lg font-urdu hover:bg-green-700 transition disabled:opacity-50">
                        {loading ? "داخلہ ہو رہا ہے..." : "داخل کریں"}
                    </button>
                </div>
            </Modal>

            {/* Change Class Modal */}
            <Modal isOpen={showChangeClass} onClose={() => setShowChangeClass(false)} title="کلاس تبدیل / ٹرانسفر">
                <div className="space-y-4" dir="rtl">
                    {error && <div className="text-red-600 bg-red-50 p-2 rounded text-sm font-urdu">{error}</div>}

                    {/* FROM CLASS SELECTION (If multiple or just to be explicit) */}
                    <div className="space-y-1">
                        <label className="block text-sm font-medium font-urdu text-gray-700">کس کلاس سے ٹرانسفر کرنا ہے؟</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-400 rounded-lg font-urdu"
                            value={selectedOldClassId}
                            onChange={(e) => setSelectedOldClassId(e.target.value)}
                            // Disabled if only 1 active class, logic: auto-select but show it.
                            // Better UX: Always allow selection if > 1, disable if == 1 but still show value
                            disabled={!student.active_enrollments || student.active_enrollments.length <= 1}
                        >
                            {/* Ensure options are populated from active enrollments */}
                            {student.active_enrollments?.map(enrollment => (
                                <option key={enrollment.enrolled_class} value={enrollment.enrolled_class}>
                                    {enrollment.enrolled_class_details.name} ({enrollment.enrolled_class_details.shift})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg space-y-3 border border-gray-100">
                        <h4 className="font-bold font-urdu text-sm text-gray-700">موجودہ کلاس کا سٹیٹس</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="block text-xs font-medium font-urdu text-gray-600">وجہ / سٹیٹس</label>
                                <select
                                    className="w-full px-2 py-1.5 border border-gray-400 rounded text-sm font-urdu"
                                    value={closureStatus}
                                    onChange={(e) => setClosureStatus(e.target.value)}
                                >
                                    <option value="Transferred">Transferred (ٹرانسفر)</option>
                                    <option value="Completed">Completed (مکمل)</option>
                                    {/* Left removed as per requirements */}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs font-medium font-urdu text-gray-600">موجودہ سبق / پروگریس</label>
                                <input
                                    type="text"
                                    placeholder="مثال: پارہ 3، سورہ یسین..."
                                    className="w-full px-2 py-1.5 border border-gray-400 rounded text-sm font-urdu"
                                    value={progressNotes}
                                    onChange={(e) => setProgressNotes(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium font-urdu text-gray-700">نئی کلاس منتخب کریں</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-400 rounded-lg font-urdu"
                            value={newClassId}
                            onChange={(e) => setNewClassId(e.target.value)}
                        >
                            <option value="">منتخب کریں...</option>
                            {classes
                                .filter(c => !student.active_enrollments?.some(e => e.enrolled_class === c.id))
                                .map(cls => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.name} ({cls.shift})
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium font-urdu text-gray-700">تفصیل / نوٹ</label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-400 rounded-lg font-urdu"
                            rows={2}
                            placeholder="مثال: پروموشن..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        ></textarea>
                    </div>

                    <button
                        onClick={handleChangeClass}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-urdu hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? "تبدیل ہو رہا ہے..." : "تبدیل کریں"}
                    </button>
                </div>
            </Modal>

            {/* Edit Profile Modal */}
            <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="طالب علم کی معلومات میں ترمیم">
                <div className="space-y-4" dir="rtl">
                    {error && <div className="text-red-600 bg-red-50 p-2 rounded text-sm font-urdu">{error}</div>}

                    <div className="space-y-1">
                        <label className="block text-sm font-medium font-urdu text-gray-700">نام طالب علم</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-400 rounded-lg font-urdu"
                            value={editFormData.name}
                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-sm font-medium font-urdu text-gray-700">نام والد</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-400 rounded-lg font-urdu"
                            value={editFormData.father_name}
                            onChange={(e) => setEditFormData({ ...editFormData, father_name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-sm font-medium font-urdu text-gray-700">موبائل نمبر</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-400 rounded-lg font-urdu"
                            dir="ltr"
                            value={editFormData.mobile_number}
                            onChange={(e) => setEditFormData({ ...editFormData, mobile_number: formatMobile(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-sm font-medium font-urdu text-gray-700">شناختی کارڈ (اختیاری)</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-400 rounded-lg font-urdu"
                            dir="ltr"
                            value={editFormData.cnic}
                            onChange={(e) => setEditFormData({ ...editFormData, cnic: formatCNIC(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-sm font-medium font-urdu text-gray-700">پتہ</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-400 rounded-lg font-urdu"
                            value={editFormData.address}
                            onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                        />
                    </div>

                    <button
                        onClick={handleEdit}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-urdu hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? "اپ ڈیٹ ہو رہا ہے..." : "اپ ڈیٹ کریں"}
                    </button>
                </div>
            </Modal>

            {/* Deactivate Modal */}
            <Modal isOpen={showDeactivate} onClose={() => setShowDeactivate(false)} title="طالب علم کو خارج کریں">
                <div className="space-y-4" dir="rtl">
                    <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm font-urdu">
                        انتباہ: یہ عمل طالب علم کو "غیر فعال" کر دے گا اور تمام موجودہ کلاسز ختم کر دی جائیں گی۔
                    </div>

                    {error && <div className="text-red-600 bg-red-50 p-2 rounded text-sm font-urdu">{error}</div>}

                    <div className="space-y-1">
                        <label className="block text-sm font-medium font-urdu text-gray-700">وجہ اخراج</label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-400 rounded-lg font-urdu"
                            rows={3}
                            placeholder="مثال: تعلیم مکمل، ذاتی وجوہات..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        ></textarea>
                    </div>

                    <button
                        onClick={handleDeactivate}
                        disabled={loading}
                        className="w-full bg-red-600 text-white py-2 rounded-lg font-urdu hover:bg-red-700 transition disabled:opacity-50"
                    >
                        {loading ? "پروسیسنگ..." : "تصدیق کریں اور خارج کریں"}
                    </button>
                </div>
            </Modal>
        </>
    );
}
