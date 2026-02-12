"use client";

import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ExamManager } from "@/modules/teacher/components/ExamManager";
import { Button } from "@/shared/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { TeacherService } from "@/modules/teacher/services/teacher.service";
import { useTeacherAuth } from "@/modules/teacher/hooks/use-teacher-auth";

export default function ExamPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { teacherId } = useTeacherAuth();

    const courseId = Number(params.courseId);
    const lectureId = Number(params.lectureId);
    const lectureName = searchParams.get("name") || "المحاضرة";

    // Fetch Course Info to show in header
    const { data: coursesResponse } = useQuery({
        queryKey: ["teacherCourses", teacherId],
        queryFn: () => TeacherService.getCourses(teacherId!),
        enabled: !!teacherId,
    });
    const course = coursesResponse?.data?.find(c => c.id === courseId);

    if (!teacherId || !course) {
        return (
            <div className="min-h-screen bg-[#06080a] flex items-center justify-center text-white font-arabic">
                جاري تحميل البيانات...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#06080a] text-white p-4 md:p-10 font-arabic">
            <div className="max-w-[1800px] mx-auto space-y-8">

                {/* Navigation Header */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-[#0d1117]/80 p-6 md:p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-xl gap-6">
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/dashboard/teacher/courses/${courseId}`)}
                        className="rounded-2xl border-white/10 hover:bg-white/5 p-4 order-2 md:order-1"
                    >
                        <ArrowLeft size={24} />
                    </Button>

                    <div className="text-right flex-1 order-1 md:order-2">
                        <div className="flex items-center justify-end gap-3 mb-2">
                            <span className="bg-brand-red/10 text-brand-red px-3 py-1 rounded-lg text-sm font-black">
                                إدارة الامتحانات
                            </span>
                            <BookOpen className="text-gray-500" size={20} />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-white">
                            {course.title} / {lectureName}
                        </h1>
                    </div>
                </div>

                {/* Exam Manager Content */}
                <div className="bg-[#0d1117]/40 rounded-[2.5rem] border border-white/5 p-2 md:p-6 overflow-hidden">
                    <ExamManager
                        lectureId={lectureId}
                        lectureName={lectureName}
                    />
                </div>
            </div>
        </div>
    );
}
