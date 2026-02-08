"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TeacherService } from "../services/teacher.service";
import { ExamSubmission, ExamScoreResponse, GradedAnswer } from "../types/teacher.types";
import { Button } from "@/shared/ui/button";
import { User, Clock, CheckCircle2, AlertCircle, ChevronLeft, Loader2, Search, Filter, History, CalendarPlus } from "lucide-react";
import { GradingInterface } from "./GradingInterface";
import { DeadlineExceptionModal } from "./DeadlineExceptionModal";
import { Toast } from "@/shared/ui/toast";

interface SubmissionsManagerProps {
    lectureId: number;
    examId: number;
    lectureName: string;
    onBack: () => void;
}

export function SubmissionsManager({ lectureId, examId, lectureName, onBack }: SubmissionsManagerProps) {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<{ id: number, resultId: number } | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // State for Deadline Exception Modal
    const [exceptionStudent, setExceptionStudent] = useState<{
        studentId: number;
        studentName: string;
        studentEmail: string;
    } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Query: Fetch all submissions for this exam
    const { data: submissionsResponse, isLoading: isLoadingSubmissions } = useQuery({
        // قمنا بتحديث المفتاح ليعتمد على examId بدلاً من lectureId لضمان دقة الكاش
        queryKey: ["examSubmissions", examId],
        // تم التحديث لإرسال examId للدالة بناءً على التعديل في السيرفس
        queryFn: () => TeacherService.getExamSubmissions(examId)
    });

    // Query: Fetch specific student result
    const { data: studentResultResponse, isLoading: isLoadingResult } = useQuery({
        queryKey: ["studentResult", examId, selectedStudent?.id],
        queryFn: () => TeacherService.getStudentExamResult(examId, selectedStudent!.id),
        enabled: !!selectedStudent
    });

    // Mutation: Save Grade
    const gradeMutation = useMutation({
        mutationFn: TeacherService.gradeExam,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["examSubmissions", lectureId, examId] });
            showToast("تم حفظ التصحيح بنجاح");
            setSelectedStudent(null);
        },
        onError: () => showToast("فشل حفظ التصحيح", "error")
    });

    // Get all submissions and filter by current examId
    const allSubmissions = submissionsResponse?.data || [];
    // فلترة النتائج حسب الامتحان المحدد فقط
    const examSubmissions = allSubmissions.filter(s => s.examId === examId);

    // ثم فلترة حسب البحث
    const filteredSubmissions = examSubmissions.filter(s =>
        s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSaveGrade = (gradedAnswers: GradedAnswer[]) => {
        if (!selectedStudent) return;
        gradeMutation.mutate({
            studentExamResultId: selectedStudent.resultId,
            gradedAnswers
        });
    };

    if (isLoadingSubmissions) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <Loader2 className="w-12 h-12 text-brand-red animate-spin" />
                <p className="text-gray-400 font-bold">جاري تحميل تسليمات الطلاب...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {notification && (
                <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[200]">
                    <div className={`px-6 py-3 rounded-2xl shadow-2xl font-black flex items-center gap-3 animate-in slide-in-from-top-4 ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                        {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        {notification.message}
                    </div>
                </div>
            )}

            {/* Header / Sub-nav */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex-1 w-full relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="البحث باسم الطالب أو البريد الإلكتروني..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-11 bg-white/5 border border-white/10 rounded-xl pr-11 pl-4 text-xs md:text-sm text-white font-bold outline-none focus:border-brand-red/50 transition-all placeholder:text-gray-600"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <div className="px-4 h-11 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2">
                        <History size={16} className="text-brand-red" />
                        <span className="text-white font-black text-xs">{examSubmissions.length} تسليماً</span>
                    </div>
                    <Button
                        variant="outline"
                        onClick={onBack}
                        className="h-11 px-6 rounded-xl border-white/10 text-gray-400 hover:bg-white/5 font-black text-xs gap-2"
                    >
                        العودة للمدير
                        <ChevronLeft size={16} />
                    </Button>
                </div>
            </div>

            {/* Submissions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredSubmissions.length > 0 ? (
                    filteredSubmissions.map((s) => (
                        <div
                            key={s.studentExamResultId}
                            className="glass-card p-4 md:p-5 rounded-3xl border border-white/5 hover:border-brand-red/30 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-red/5 blur-3xl -mr-12 -mt-12 group-hover:bg-brand-red/10 transition-all" />

                            <div className="relative space-y-4">
                                {/* Student Info */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 text-right">
                                        <h4 className="text-lg font-black text-white group-hover:text-brand-red transition-colors line-clamp-1">{s.studentName}</h4>
                                        <p className="text-[10px] text-gray-500 font-bold mt-0.5 uppercase tracking-tight line-clamp-1">{s.studentEmail}</p>
                                    </div>
                                    <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-brand-red transition-all">
                                        <User size={20} strokeWidth={1.5} />
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center space-y-0.5">
                                        <p className="text-[9px] font-black text-gray-500 uppercase">الدرجة الحالية</p>
                                        <p className="text-base font-black text-white">{s.currentTotalScore} <span className="text-[10px] text-gray-500">/ {s.maxScore}</span></p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center space-y-0.5">
                                        <p className="text-[9px] font-black text-gray-500 uppercase">تاريخ التسليم</p>
                                        <p className="text-xs font-black text-gray-300">{new Date(s.submittedAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}</p>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className="flex items-center justify-between pt-2">
                                    {s.pendingGradingAnswers > 0 ? (
                                        <div className="flex items-center gap-2 text-yellow-500 text-xs font-black bg-yellow-500/10 px-3 py-1.5 rounded-full">
                                            <AlertCircle size={14} />
                                            <span>{s.pendingGradingAnswers} أسئلة بحاجة لتصحيح</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-green-500 text-xs font-black bg-green-500/10 px-3 py-1.5 rounded-full">
                                            <CheckCircle2 size={14} />
                                            <span>تم التصحيح بالكامل</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold">
                                        <Clock size={12} />
                                        <span>{new Date(s.submittedAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="space-y-2">
                                    <Button
                                        onClick={() => setSelectedStudent({ id: s.studentId, resultId: s.studentExamResultId })}
                                        className="w-full h-10 rounded-lg font-black text-sm transition-all group-hover:gap-3 gap-2"
                                    >
                                        المراجعة والتصحيح
                                        <ChevronLeft size={16} />
                                    </Button>

                                    {/* Deadline Exception Button */}
                                    <button
                                        onClick={() => setExceptionStudent({
                                            studentId: s.studentId,
                                            studentName: s.studentName,
                                            studentEmail: s.studentEmail
                                        })}
                                        className="w-full h-9 rounded-lg font-bold text-[11px] flex items-center justify-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 hover:border-orange-500/40 transition-all"
                                    >
                                        <CalendarPlus size={14} />
                                        استثناء الموعد
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center glass-card rounded-[3rem] border-dashed border-2 border-white/5">
                        <History size={64} className="mx-auto text-gray-600 mb-6 stroke-[1]" />
                        <h5 className="text-2xl font-black text-white">لا توجد تسليمات متاحة</h5>
                        <p className="text-gray-500 font-bold mt-2">لم يقم أي طالب بتسليم الامتحان بعد أو لا يوجد نتائج تطابق بحثك</p>
                    </div>
                )}
            </div>

            {/* Grading Modal Overlay */}
            {selectedStudent && studentResultResponse?.data && (
                <GradingInterface
                    result={studentResultResponse.data}
                    onClose={() => setSelectedStudent(null)}
                    onSave={handleSaveGrade}
                    isLoading={gradeMutation.isPending}
                />
            )}

            {/* Just a loading state for individual results */}
            {selectedStudent && isLoadingResult && (
                <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-[#0d1117] p-10 rounded-[2.5rem] border border-white/10 flex flex-col items-center gap-6 animate-in zoom-in-95">
                        <Loader2 className="w-12 h-12 text-brand-red animate-spin" />
                        <p className="text-white font-black">جاري جلب إجابات الطالب...</p>
                    </div>
                </div>
            )}

            {/* Deadline Exception Modal */}
            {exceptionStudent && (
                <DeadlineExceptionModal
                    examId={examId}
                    studentId={exceptionStudent.studentId}
                    studentName={exceptionStudent.studentName}
                    studentEmail={exceptionStudent.studentEmail}
                    onClose={() => setExceptionStudent(null)}
                    onSuccess={() => showToast("تم إنشاء الاستثناء بنجاح")}
                />
            )}
        </div>
    );
}
