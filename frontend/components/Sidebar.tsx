"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    BookOpen,
    School,
    GraduationCap,
    Menu,
    X,
    LogOut
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import Badge from "@/components/Badge";

const navigation = [
    { name: "ڈیش بورڈ", href: "/", icon: LayoutDashboard },
    { name: "طلباء", href: "/students", icon: Users },
    { name: "پروگرامز", href: "/programs", icon: BookOpen },
    { name: "کلاسز", href: "/classes", icon: GraduationCap },
    { name: "کیمپس", href: "/campuses", icon: School },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();

    return (
        <>
            {/* ... Mobile Header items ... */}

            {/* Sidebar Container */}
            <div className={`
        fixed lg:static inset-y-0 right-0 z-50 w-64 bg-[#052e16]/98 text-white border-l border-green-800 
        transform transition-transform duration-200 ease-in-out flex-shrink-0 shadow-2xl
        ${isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
      `}>
                <div className="h-full flex flex-col">
                    {/* Logo / Header */}
                    <div className="h-24 flex flex-col items-center justify-center border-b border-green-800 bg-[#022c22]">
                        <div className="p-2 bg-white rounded-lg mb-2">
                            <School className="w-8 h-8 text-[#15803d]" />
                        </div>
                        <h1 className="text-xl font-bold font-urdu tracking-wide">مدرسہ مینجمنٹ</h1>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                    flex items-center gap-3 px-4 py-3 text-lg font-urdu rounded-xl transition-all duration-200 group
                    ${isActive
                                            ? "bg-[#d97706] text-white shadow-lg shadow-orange-900/20 translate-x-[-4px] font-bold"
                                            : "text-green-100 hover:bg-green-800 hover:text-white hover:translate-x-[-2px]"}
                  `}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Icon className={`w-5 h-5 ml-2 transition-colors ${isActive ? "text-white" : "text-green-300 group-hover:text-white"}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile / Logout */}
                    <div className="p-4 border-t border-green-800 bg-[#022c22]">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#d97706] border-2 border-white flex items-center justify-center text-white font-bold shadow-sm">
                                    {user?.username?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-bold font-urdu truncate text-white">{user?.username}</p>
                                    <Badge variant={user?.isAdmin ? "warning" : "success"} className="text-xs py-0 px-2 mt-1 border-none">
                                        {user?.isAdmin ? "ایڈمن" : "سٹاف"}
                                    </Badge>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 rounded-lg text-sm font-urdu hover:bg-red-700 transition shadow-sm border border-red-700"
                            >
                                <LogOut className="w-4 h-4" />
                                لاگ آؤٹ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
