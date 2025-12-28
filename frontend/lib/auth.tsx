"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter, usePathname } from "next/navigation";
import api from "./api";

interface User {
    id: number;
    username: string;
    isAdmin: boolean;
    isStaff: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string, refresh: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => { },
    logout: () => { },
    isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Load user from token on mount
    useEffect(() => {
        const initAuth = async () => {
            const token = Cookies.get("access_token");
            if (!token) {
                setLoading(false);
                if (pathname !== "/login") router.push("/login");
                return;
            }

            try {
                // Fetch user info using the token (api interceptor will attach it)
                // We set token in cookie, but api.ts needs to read it.
                // For initial load, we might need to rely on the cookie presence first
                const { data } = await api.get("/auth/me/");
                setUser(data);
            } catch (error) {
                console.error("Auth check failed", error);
                logout();
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    // Auto-logout on inactivity (15 mins)
    useEffect(() => {
        let timeout: NodeJS.Timeout;
        const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes

        const resetTimer = () => {
            clearTimeout(timeout);
            if (user) {
                timeout = setTimeout(() => {
                    console.log("Auto-logging out due to inactivity");
                    logout();
                }, INACTIVITY_LIMIT);
            }
        };

        if (user) {
            window.addEventListener("mousemove", resetTimer);
            window.addEventListener("keydown", resetTimer);
            resetTimer(); // Start timer
        }

        return () => {
            clearTimeout(timeout);
            window.removeEventListener("mousemove", resetTimer);
            window.removeEventListener("keydown", resetTimer);
        };
    }, [user]);


    const login = async (access: string, refresh: string) => {
        Cookies.set("access_token", access, { expires: 1 / 48 }); // 30 mins
        Cookies.set("refresh_token", refresh, { expires: 1 }); // 1 day

        // Fetch user details immediately
        try {
            const { data } = await api.get("/auth/me/");
            setUser(data);
            router.push("/");
        } catch (e) {
            console.error("Login fetch user failed", e);
        }
    };

    const logout = () => {
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
