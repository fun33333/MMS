"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { AuthProvider } from "@/lib/auth";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";

    return (
        <AuthProvider>
            <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50" dir="rtl">
                {/* Sidebar - Hide on login page and print */}
                {!isLoginPage && <Sidebar />}

                {/* Main Content Area */}
                <main className={`flex-1 p-4 lg:p-8 transition-all duration-300 ${isLoginPage ? 'w-full !p-0' : ''}`}>
                    {children}
                </main>
            </div>
        </AuthProvider>
    );
}
