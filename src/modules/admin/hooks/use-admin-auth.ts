"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AdminUser {
    userId: string;
    applicationUserId?: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
}

export function useAdminAuth() {
    const router = useRouter();
    const [user, setUser] = useState<AdminUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            try {
                const token = localStorage.getItem("token");
                const userData = localStorage.getItem("user");

                if (!token || !userData) {
                    router.push("/login");
                    return;
                }

                const parsedUser = JSON.parse(userData);

                // Check if user is admin from roles array
                const isAdmin = parsedUser.roles?.some((role: string) =>
                    role.toLowerCase() === "admin"
                );

                if (!isAdmin) {
                    // If not admin, redirect to appropriate dashboard
                    if (parsedUser.roles?.includes("Teacher") || parsedUser.roles?.includes("Assistant")) {
                        router.push("/dashboard/teacher");
                    } else if (parsedUser.roles?.includes("Student")) {
                        router.push("/dashboard/student");
                    } else {
                        router.push("/login");
                    }
                    return;
                }

                setUser({
                    userId: parsedUser.applicationUserId || parsedUser.id || parsedUser.userId,
                    applicationUserId: parsedUser.applicationUserId,
                    email: parsedUser.email,
                    firstName: parsedUser.firstName,
                    lastName: parsedUser.lastName,
                    roles: parsedUser.roles || []
                });
            } catch (error) {
                console.error("Auth check failed:", error);
                router.push("/login");
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        router.push("/login");
    };

    return {
        user,
        isLoading,
        logout,
        isAuthenticated: !!user
    };
}
