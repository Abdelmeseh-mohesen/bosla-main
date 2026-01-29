"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ParentUser } from "../types/parent.types";

export function useParentAuth() {
    const router = useRouter();
    const [user, setUser] = useState<ParentUser | null>(null);
    const [parentId, setParentId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");
        const role = localStorage.getItem("role");

        if (!token || !userStr) {
            router.push("/login");
            return;
        }

        // Verify user is a Parent
        if (role !== "Parent") {
            router.push("/login");
            return;
        }

        try {
            const userData = JSON.parse(userStr);
            setUser(userData);

            // Extract parent ID - try multiple possible fields
            const pId = userData.parentId || userData.id || userData.applicationUserId;
            if (pId) {
                // If it's a string (GUID), we need to use a numeric ID
                // For now, we'll use 1 as a fallback - the API might need the numeric parent ID
                setParentId(typeof pId === 'number' ? pId : 1);
            }
        } catch (error) {
            console.error("Error parsing user data:", error);
            router.push("/login");
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    const logout = async () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        router.push("/login");
    };

    return { user, parentId, isLoading, logout };
}
