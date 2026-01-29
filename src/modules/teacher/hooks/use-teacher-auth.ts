import { useState, useEffect } from "react";
import { TeacherData } from "../types/teacher.types";
import { AuthService } from "@/modules/auth/services/auth.service";

export function useTeacherAuth() {
    const [user, setUser] = useState<TeacherData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {
                console.error("Error parsing user data", e);
            }
        }
        setLoading(false);
    }, []);

    const logout = async () => {
        await AuthService.logout();
    };

    const isAssistant = user?.roles?.includes("Assistant");
    const isTeacher = user?.roles?.includes("Teacher");

    // الحصول على teacherId الرقمي
    // للـ Assistant: نستخدم teacherId من بيانات المستخدم (المعلم الذي يتبعه)
    // للـ Teacher: نستخدم teacherId الرقمي وليس userId (GUID)
    const rawTeacherId = isAssistant
        ? (user as any)?.teacherId
        : (user as any)?.teacherId || (user as any)?.userId;

    // التحقق من أن teacherId رقمي وليس GUID
    let teacherId: number | null = null;

    if (typeof rawTeacherId === 'number') {
        teacherId = rawTeacherId;
    } else if (typeof rawTeacherId === 'string') {
        // إذا كان string ولا يحتوي على "-" (ليس GUID)، حوله لرقم
        if (!rawTeacherId.includes('-')) {
            const parsed = parseInt(rawTeacherId, 10);
            if (!isNaN(parsed)) {
                teacherId = parsed;
            }
        }
    }

    return {
        user,
        teacherId,
        loading,
        logout,
        isTeacher,
        isAssistant
    };
}
