"use client";

import { useState, useEffect } from "react";
import { Users, UserCheck, UserX, Building2, BookOpen, GraduationCap, TrendingUp } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

interface DashboardStats {
  students: { total: number; active: number; left: number };
  enrollments: { active: number };
  counts: { classes: number; campuses: number; programs: number };
  campus_breakdown: { id: number; name: string; student_count: number; capacity: number }[];
  program_breakdown: { id: number; name: string; student_count: number }[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/dashboard/stats/");
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center font-urdu text-gray-500">لوڈنگ...</div>;
  if (!stats) return <div className="p-8 text-center font-urdu text-red-500">ڈیٹا لوڈ نہیں ہو سکا</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-urdu text-gray-900 mb-6">ڈیش بورڈ</h1>
        <p className="text-gray-600 font-semibold font-urdu font-medium mt-4 text-sm">مدرسہ مینجمنٹ سسٹم کا خلاصہ</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/students" className="bg-[#15803d] text-white p-5 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 relative overflow-hidden group">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-white font-urdu text-sm mb-1 font-bold">کل طلباء</p>
              <p className="text-4xl font-bold font-urdu">{stats.students.total}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
        </Link>

        {/* Active Students - Secondary Blue */}
        <div className="bg-[#0ea5e9] text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white font-urdu text-sm mb-1 font-bold">فعال طلباء</p>
              <p className="text-4xl font-bold font-urdu">{stats.students.active}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <UserCheck className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/20">
            <div className="flex items-center gap-1 text-white text-sm font-urdu font-bold">
              <TrendingUp className="w-4 h-4" />
              <span>{stats.students.total > 0 ? Math.round((stats.students.active / stats.students.total) * 100) : 0}% حاضری تناسب</span>
            </div>
          </div>
        </div>

        {/* Left Students - Neutral/Gray for less emphasis or Amber for caution? Let's use Amber/Gold as Accent for 'Attention' items or just generic stats. 'Left' is negative, maybe Gray or Red. But user wants Holy Palette. Let's use Gold/Amber for specific 'status' or highlights. Let's stick to simple clean look. Maybe White card with colored icon?
        User requested Holy Palette: Green, White, Gold, Soft Blue.
        Let's make this one White with Gold accent for a change. Or just Gold.
        Let's try Gold for "Programs" or "Classes".
        Let's use Gold for "Left" to warn/highlight? Or maybe just keep it separate.
        Let's use a standard white card design for secondary stats to avoid rainbow dashboard.
        Actually, let's keep the vibrant top cards but refine colors.
        
        Let's use Amber (Gold) for "Classes" or "Programs" to integrate the Gold.
        And for Left, maybe simple Gray to de-emphasize.
        Wait, I need to update the 3rd and 4th cards.
        */}

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 relative group hover:border-red-300 transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-700 font-urdu text-sm font-bold">خارج شدہ</p>
              <p className="text-4xl font-bold font-urdu text-gray-900 mt-1">{stats.students.left}</p>
            </div>
            <div className="bg-red-50 p-2 rounded-lg text-red-600 group-hover:bg-red-100 transition-colors">
              <UserX className="w-8 h-8" />
            </div>
          </div>
        </div>

        <Link href="/classes" className="bg-[#d97706] text-white p-5 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-amber-50 font-urdu text-sm mb-1 opacity-90">کل کلاسز</p>
              <p className="text-4xl font-bold font-urdu">{stats.counts.classes}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
        </Link>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Link href="/campuses" className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:border-green-600 transition group hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-600 transition-colors">
              <Building2 className="w-6 h-6 text-green-700 group-hover:text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.counts.campuses}</p>
              <p className="text-gray-900 font-urdu text-sm font-bold">کیمپسز</p>
            </div>
          </div>
        </Link>

        <Link href="/programs" className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:border-blue-600 transition group hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
              <BookOpen className="w-6 h-6 text-blue-700 group-hover:text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.counts.programs}</p>
              <p className="text-gray-900 font-urdu text-sm font-bold">پروگرامز</p>
            </div>
          </div>
        </Link>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:border-purple-600 transition group hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors">
              <TrendingUp className="w-6 h-6 text-purple-700 group-hover:text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.enrollments.active}</p>
              <p className="text-gray-900 font-urdu text-sm font-bold">فعال انرولمنٹس</p>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campus Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold font-urdu mb-4 flex items-center gap-2 text-gray-900">
            <Building2 className="w-5 h-5 text-green-600" />
            کیمپس کے لحاظ سے طلباء
          </h2>
          <div className="space-y-3">
            {stats.campus_breakdown.map((campus) => (
              <div key={campus.id} className="flex items-center justify-between">
                <span className="font-urdu text-gray-700">{campus.name}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${campus.capacity > 0 ? Math.min((campus.student_count / campus.capacity) * 100, 100) : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-16 text-left text-gray-600">
                    {campus.student_count} / {campus.capacity}
                  </span>
                </div>
              </div>
            ))}
            {stats.campus_breakdown.length === 0 && (
              <p className="text-gray-500 font-urdu text-center py-4">کوئی کیمپس نہیں</p>
            )}
          </div>
        </div>

        {/* Program Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 font-urdu mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            پروگرام کے لحاظ سے طلباء
          </h2>
          <div className="space-y-3">
            {stats.program_breakdown.map((program) => (
              <div key={program.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-urdu text-gray-700 font-medium">{program.name}</span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                  {program.student_count} طلباء
                </span>
              </div>
            ))}
            {stats.program_breakdown.length === 0 && (
              <p className="text-gray-500 font-urdu text-center py-4">کوئی پروگرام نہیں</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h2 className="text-lg font-bold font-urdu mb-4 text-gray-900">فوری کارروائیاں</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {user?.isAdmin ? (
            <Link href="/students/add" className="bg-green-50 text-green-900 font-bold p-4 rounded-lg text-center font-urdu hover:bg-green-100 transition border border-green-100">
              نیا طالب علم
            </Link>
          ) : (
            <div className="bg-gray-50 text-gray-500 p-4 rounded-lg text-center font-urdu cursor-not-allowed text-sm">
              نیا طالب علم (صرف ایڈمن)
            </div>
          )}

          <Link href="/campuses" className="bg-blue-50 text-blue-900 font-bold p-4 rounded-lg text-center font-urdu hover:bg-blue-100 transition border border-blue-100">
            کیمپس دیکھیں
          </Link>
          <Link href="/programs" className="bg-purple-50 text-purple-900 font-bold p-4 rounded-lg text-center font-urdu hover:bg-purple-100 transition border border-purple-100">
            پروگرامز
          </Link>
          <Link href="/classes" className="bg-amber-50 text-amber-900 font-bold p-4 rounded-lg text-center font-urdu hover:bg-amber-100 transition border border-amber-100">
            کلاسز
          </Link>
        </div>
      </div>
    </div>
  );
}
