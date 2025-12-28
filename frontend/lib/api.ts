import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Add Auth Token Interceptor
import Cookies from "js-cookie";

api.interceptors.request.use((config) => {
    const token = Cookies.get("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't tried refreshing yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = Cookies.get("refresh_token");

            if (refreshToken) {
                try {
                    const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/token/refresh/`, {
                        refresh: refreshToken
                    });

                    Cookies.set("access_token", data.access, { expires: 1 / 48 });
                    api.defaults.headers["Authorization"] = `Bearer ${data.access}`;
                    originalRequest.headers["Authorization"] = `Bearer ${data.access}`;

                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh failed - logout
                    Cookies.remove("access_token");
                    Cookies.remove("refresh_token");
                    window.location.href = "/login";
                }
            } else {
                // No refresh token - logout
                Cookies.remove("access_token");
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

// Response Types
export interface Student {
    id: number;
    name: string;
    father_name: string;
    mobile_number: string;
    status: "Active" | "Left";
    address?: string;
    cnic?: string;
    admission_date?: string;
    remarks?: string;
    active_enrollments?: Enrollment[];
    history?: Enrollment[];
}

export interface Enrollment {
    id: number;
    enrolled_class: number;
    enrolled_class_details: Class;
    start_date: string;
    end_date: string | null;
    is_active: boolean;
}

export interface Class {
    id: number;
    name: string;
    campus_name: string;
    program_name: string;
    shift: string;
    capacity?: number;
}

export default api;
