"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { StudentService } from "../services/student.service";
import { TeacherCard } from "./TeacherCard";
import { Loader2, ArrowLeft, Users } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface TeachersListProps {
    subjectId: number;
    subjectName: string;
    onBack: () => void;
    onSelectTeacher: (teacher: any) => void;
}

export function TeachersList({ subjectId, subjectName, onBack, onSelectTeacher }: TeachersListProps) {
    const { data: subjectData, isLoading, error } = useQuery({
        queryKey: ["subjectTeachers", subjectId],
        queryFn: () => StudentService.getTeachersBySubject(subjectId),
    });

    if (isLoading) {
        return (
            <div className="flex h-[40vh] flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-brand-red" size={50} />
                <p className="text-xl font-bold text-gray-400">جاري البحث عن نخبة المعلمين...</p>
            </div>
        );
    }

    const teachers = subjectData?.teachers || [];

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Nav Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-right">
                    <div className="h-16 w-16 rounded-2xl bg-brand-red/10 flex items-center justify-center text-brand-red">
                        <Users size={32} />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-white">معلمي {subjectName}</h2>
                        <p className="text-gray-500 font-bold">اختر معلمك المفضل لبدء المذاكرة</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    onClick={onBack}
                    className="rounded-2xl border-white/10 hover:bg-white/5 gap-2 h-14"
                >
                    <ArrowLeft size={20} />
                    رجوع للمواد
                </Button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {teachers.map((teacher) => (
                    <TeacherCard
                        key={teacher.id}
                        teacher={teacher}
                        onClick={() => onSelectTeacher(teacher)}
                    />
                ))}
            </div>

            {/* Empty State */}
            {teachers.length === 0 && (
                <div className="text-center py-20 bg-[#0d1117]/50 rounded-[3rem] border-2 border-dashed border-white/5">
                    <p className="text-2xl font-bold text-gray-400">عذراً، لا يوجد معلمون متاحون لهذه المادة حالياً</p>
                </div>
            )}
        </div>
    );
}
