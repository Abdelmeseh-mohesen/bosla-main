import { useState, useEffect } from "react";
import { AuthService } from "@/modules/auth/services/auth.service";

// Helper function to decode JWT token and extract claims
const decodeJwtToken = (token: string): any => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error decoding JWT token", e);
        return null;
    }
};

// Extract userId (GUID) from JWT token's 'sub' claim
const extractUserIdFromToken = (): string | null => {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem("token");
    if (!token) return null;

    const decoded = decodeJwtToken(token);
    if (!decoded) return null;

    // The 'sub' claim contains the userId (GUID)
    const userId = decoded.sub;

    console.log("=== JWT Token Decoded ===");
    console.log("All claims:", decoded);
    console.log("Extracted userId (from sub):", userId);

    return userId ? String(userId) : null;
};

export function useStudentAuth() {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [tokenUserId, setTokenUserId] = useState<string | null>(null);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                console.log("=== USER DATA FROM LOCALSTORAGE ===");
                console.log("Full user object:", parsedUser);
                console.log("user.applicationUserId:", parsedUser?.applicationUserId);
            } catch (e) {
                console.error("Error parsing user data", e);
            }
        }

        // Extract userId from token's 'sub' claim
        const extractedId = extractUserIdFromToken();
        setTokenUserId(extractedId);

        setLoading(false);
    }, []);

    const logout = async () => {
        await AuthService.logout();
    };

    // userId (GUID) - used for fetching student profile
    // Priority: token's sub claim > applicationUserId from user object
    const userId = tokenUserId || (user as any)?.applicationUserId || user?.id;

    // Numeric Student ID (e.g. 34) - used for subscriptions/exams
    // Check both 'userId' (sometimes used) and 'studentId' (from profile response)
    const numericStudentId = user?.studentId ? Number(user.studentId) : (user?.userId && typeof user.userId === 'number' ? Number(user.userId) : null);

    console.log("=== FINAL IDs ===");
    console.log("GUID (userId):", userId);
    console.log("Numeric ID (studentId):", numericStudentId);

    return {
        user,
        // userId (GUID) for profile API
        userId: userId,
        // studentId (Numeric) for business logic (subscriptions, etc)
        studentId: numericStudentId, // Don't fallback to GUID, let it be null if not found to avoid type mix-ups
        numericStudentId,
        applicationUserId: userId, // Keeping for compatibility if needed
        loading,
        logout,
        isStudent: user?.roles?.includes("Student")
    };
}
