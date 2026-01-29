"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { StudentService } from "../services/student.service";
import { SubjectCard } from "./SubjectCard";
import { Loader2, Sparkles, BookOpen } from "lucide-react";

interface SubjectsListProps {
    onSelectSubject: (id: number, name: string) => void;
}

export function SubjectsList({ onSelectSubject }: SubjectsListProps) {
    const { data: response, isLoading, error } = useQuery({
        queryKey: ["subjects"],
        queryFn: () => StudentService.getSubjects(1, 10),
    });

    if (isLoading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-brand-red" size={50} />
                <p className="text-xl font-bold text-gray-400">جاري تحميل المواد الدراسية...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <p className="text-xl font-bold text-brand-red text-center">
                    حدث خطأ أثناء تحميل المواد. <br />
                    يرجى المحاولة مرة أخرى لاحقاً.
                </p>
            </div>
        );
    }

    const subjects = response?.data || [];

    return (
        <div className="relative space-y-6 pb-10 overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute -top-24 -right-24 h-[500px] w-[500px] rounded-full bg-brand-red/5 blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 -left-48 h-[600px] w-[600px] rounded-full bg-blue-500/5 blur-[150px] pointer-events-none" />

            {/* Header Section - Compact */}
            <div className="relative text-right space-y-3 max-w-3xl ml-auto mb-8">
                <div className="space-y-2 animate-in fade-in slide-in-from-right-12 duration-1000">
                    <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                        استكشف <span className="text-transparent bg-clip-text bg-gradient-to-l from-brand-red via-red-500 to-orange-500">مستقبلك</span> بموادنا الدراسية
                    </h1>
                    <p className="text-gray-500 font-bold text-sm md:text-base">
                        نقدم لك تجربة تعليمية فريدة قائمة على الابتكار والمعايير الدولية، لتكون دائماً في الصدارة.
                    </p>
                </div>

                <div className="flex justify-end items-center gap-4">
                    <div className="h-1 w-24 bg-gradient-to-l from-brand-red via-brand-red/50 to-transparent rounded-full" />
                    <div className="w-2 h-2 rounded-full bg-brand-red animate-ping" />
                </div>
            </div>

            {/* Grid Section */}
            <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
                {subjects.map((subject, index) => (
                    <SubjectCard
                        key={subject.id}
                        subject={subject}
                        onClick={() => onSelectSubject(subject.id, subject.name)}
                    />
                ))}
            </div>

            {/* Empty State */}
            {subjects.length === 0 && (
                <div className="text-center py-20 bg-[#0d1117]/50 rounded-[3rem] border-2 border-dashed border-white/5 backdrop-blur-sm">
                    <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-500">
                        <BookOpen size={40} />
                    </div>
                    <p className="text-2xl font-bold text-gray-400">لا توجد مواد دراسية متاحة حالياً</p>
                    <p className="text-gray-600 mt-2">يرجى مراجعة الإدارة أو المحاولة لاحقاً</p>
                </div>
            )}
        </div>
    );
}
