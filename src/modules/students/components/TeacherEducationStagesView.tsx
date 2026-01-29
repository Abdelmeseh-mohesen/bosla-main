"use client";

import React from "react";
import { Teacher } from "../types/student.types";
import { ArrowLeft, GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface TeacherEducationStagesViewProps {
    teacher: Teacher;
    onBack: () => void;
    onSelectStage: (stageId: number, stageName: string) => void;
}

export function TeacherEducationStagesView({
    teacher,
    onBack,
    onSelectStage
}: TeacherEducationStagesViewProps) {
    return (
        <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0d1117] border border-white/5 p-8">
                <div className="absolute top-0 right-0 h-48 w-48 bg-brand-red/10 blur-[80px] -mr-24 -mt-24" />

                <div className="relative flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={onBack}
                        className="rounded-2xl border-white/10 hover:bg-white/5 gap-2 h-14 px-6"
                    >
                        <ArrowLeft size={20} />
                        رجوع
                    </Button>

                    <div className="text-right">
                        <div className="inline-flex items-center gap-2 bg-brand-red/10 text-brand-red px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
                            <GraduationCap size={12} />
                            اختر المرحلة الدراسية
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white">
                            أ/ {teacher.teacherName}
                        </h2>
                        <p className="text-gray-400 font-bold mt-2">
                            {teacher.subjectName}
                        </p>
                    </div>
                </div>
            </div>

            {/* Education Stages Grid */}
            <div className="space-y-6">
                <div className="text-right">
                    <h3 className="text-2xl font-black text-white flex items-center gap-2 justify-end">
                        المراحل الدراسية المتاحة
                        <span className="w-1.5 h-6 bg-brand-red rounded-full" />
                    </h3>
                    <p className="text-gray-500 font-bold text-sm mt-2">
                        {teacher.teacherEducationStages.length} مرحلة دراسية متاحة
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teacher.teacherEducationStages.map((stage) => (
                        <button
                            key={stage.id}
                            onClick={() => onSelectStage(stage.id, stage.educationStageName)}
                            className="group relative overflow-hidden rounded-[2rem] bg-[#0d1117] border border-white/5 hover:border-brand-red/30 transition-all duration-500 p-6 text-right"
                        >
                            {/* Background Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Icon */}
                            <div className="relative mb-4">
                                <div className="w-16 h-16 rounded-2xl bg-brand-red/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                    <GraduationCap size={32} className="text-brand-red" />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="relative">
                                <h4 className="text-xl font-black text-white group-hover:text-brand-red transition-colors mb-2">
                                    {stage.educationStageName}
                                </h4>
                                <p className="text-gray-500 text-sm font-bold mb-4">
                                    اضغط لعرض الكورسات المتاحة
                                </p>

                                {/* Arrow */}
                                <div className="flex items-center gap-2 text-brand-red font-bold text-sm">
                                    عرض الكورسات
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>

                            {/* Hover Border Glow */}
                            <div className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none border-2 border-brand-red/20" />
                        </button>
                    ))}
                </div>

                {teacher.teacherEducationStages.length === 0 && (
                    <div className="text-center py-16 bg-white/5 rounded-[2rem] border-2 border-dashed border-white/5">
                        <GraduationCap size={48} className="mx-auto text-gray-600 mb-4" />
                        <p className="text-xl font-bold text-gray-500">لا توجد مراحل دراسية متاحة</p>
                    </div>
                )}
            </div>
        </div>
    );
}
