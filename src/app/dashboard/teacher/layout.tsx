"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTeacherAuth } from "@/modules/teacher/hooks/use-teacher-auth";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, isTeacher, isAssistant } = useTeacherAuth();
    const router = useRouter();

    // السماح لكل من المعلم والمساعد بالوصول
    const hasAccess = isTeacher || isAssistant;

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/login");
            } else if (!hasAccess) {
                router.push("/");
            }
        }
    }, [user, loading, hasAccess, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#06080a] flex items-center justify-center">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-brand-red/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-brand-red rounded-full border-t-transparent animate-spin" />
                </div>
            </div>
        );
    }

    if (!user || !hasAccess) {
        return null;
    }

    return <>{children}</>;
}

