"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStudentAuth } from "@/modules/students/hooks/use-student-auth";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, isStudent } = useStudentAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/login");
            } else if (!isStudent) {
                router.push("/");
            }
        }
    }, [user, loading, isStudent, router]);

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

    if (!user || !isStudent) {
        return null;
    }

    return <>{children}</>;
}
