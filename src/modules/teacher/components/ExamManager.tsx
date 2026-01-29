"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TeacherService } from "../services/teacher.service";
import { Exam, ExamQuestion, CreateExamRequest, EditExamRequest, CreateQuestionRequest, EditQuestionRequest, CreateOptionRequest, EditOptionRequest } from "../types/teacher.types";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
    Plus,
    FileText,
    Trash2,
    CheckCircle2,
    HelpCircle,
    ChevronDown,
    ChevronUp,
    Image as ImageIcon,
    Loader2,
    Save,
    Upload,
    X,
    CheckCircle,
    Users,
    FilePlus,
    Lightbulb,
    Maximize2,
    Calendar,
    Clock,
    ChevronLeft,
    ChevronRight,
    Search
} from "lucide-react";

import { Toast } from "@/shared/ui/toast";
import { SubmissionsManager } from "./SubmissionsManager";
import { env } from "@/config/env";




interface ExamManagerProps {
    lectureId: number;
    lectureName: string;
}

export function ExamManager({ lectureId, lectureName }: ExamManagerProps) {
    const queryClient = useQueryClient();
    const [isCreatingExam, setIsCreatingExam] = useState(false);
    const [isEditingExam, setIsEditingExam] = useState(false);
    const [examTitle, setExamTitle] = useState("");
    const [deadline, setDeadline] = useState("");
    const [durationInMinutes, setDurationInMinutes] = useState(60);
    const [examType, setExamType] = useState<1 | 2>(1); // 1 = exam, 2 = homework
    const [isVisible, setIsVisible] = useState(true); // إظهار الامتحان للطلاب
    const [isRandomized, setIsRandomized] = useState(false); // ترتيب الأسئلة عشوائي
    const [isViewingSubmissions, setIsViewingSubmissions] = useState(false);
    const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarViewDate, setCalendarViewDate] = useState(new Date());

    const [previewImageModal, setPreviewImageModal] = useState<string | null>(null); // For lightbox
    const addQuestionRef = useRef<HTMLDivElement>(null);

    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    useEffect(() => {
        const savedMsg = localStorage.getItem('exam_manager_toast');
        if (savedMsg) {
            showToast(savedMsg, 'success');
            localStorage.removeItem('exam_manager_toast');
        }
    }, []);

    // Fetch Exam
    const { data: examResponse, isLoading: isLoadingExam, error: examError } = useQuery({
        queryKey: ["lectureExam", lectureId],
        queryFn: () => TeacherService.getExam(lectureId),
    });

    const exam = examResponse?.data;

    // Debug logging
    console.log("===== EXAM MANAGER DEBUG =====");
    console.log("lectureId:", lectureId);
    console.log("isLoadingExam:", isLoadingExam);
    console.log("examError:", examError);
    console.log("examResponse:", examResponse);
    console.log("exam:", exam);

    // Mutation: Create Exam
    const createExamMutation = useMutation({
        mutationFn: TeacherService.createExam,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lectureExam", lectureId] });
            setIsCreatingExam(false);
            setExamTitle("");
            setDeadline("");
            setDurationInMinutes(60);
            setExamType(1);
            setIsVisible(true);
            setIsRandomized(false);
            showToast("تم إنشاء الامتحان بنجاح");
        },
        onError: () => showToast("فشل إنشاء الامتحان", "error")
    });

    // Mutation: Edit Exam
    const editExamMutation = useMutation({
        mutationFn: TeacherService.editExam,
        onSuccess: () => {
            // Will be handled in handleCreateExam or simply here. 
            // Note: if checkVisibility takes longer, invalidation happens twice. Efficient enough.
        },
        onError: () => showToast("فشل تعديل الامتحان", "error")
    });

    // Mutation: Change Exam Visibility
    const changeVisibilityMutation = useMutation({
        mutationFn: TeacherService.changeExamVisibility,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lectureExam", lectureId] });
        },
        onError: () => showToast("فشل تغيير حالة الظهور", "error")
    });


    // Mutation: Create Question
    const createQuestionMutation = useMutation({
        mutationFn: TeacherService.createQuestion,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lectureExam", lectureId] });
            showToast("تم إضافة السؤال");
        },
        onError: () => showToast("فشل إضافة السؤال", "error")
    });

    // Mutation: Edit Question
    const editQuestionMutation = useMutation({
        mutationFn: TeacherService.editQuestion,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lectureExam", lectureId] });
            showToast("تم تعديل السؤال بنجاح");
        },
        onError: () => showToast("فشل تعديل السؤال", "error")
    });

    // Mutation: Delete Question
    const deleteQuestionMutation = useMutation({
        mutationFn: TeacherService.deleteQuestion,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lectureExam", lectureId] });
            showToast("تم حذف السؤال بنجاح");
        },
        onError: () => showToast("فشل حذف السؤال", "error")
    });


    // Mutation: Create Option
    const createOptionMutation = useMutation({
        mutationFn: TeacherService.createOption,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lectureExam", lectureId] });
            showToast("تم إضافة الخيار");
        },
        onError: () => showToast("فشل إضافة الخيار", "error")
    });

    // Mutation: Edit Option
    const editOptionMutation = useMutation({
        mutationFn: TeacherService.editOption,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lectureExam", lectureId] });
            showToast("تم تعديل الاختيار بنجاح");
        },
        onError: () => showToast("فشل تعديل الاختيار", "error")
    });

    // Mutation: Delete Option
    const deleteOptionMutation = useMutation({
        mutationFn: TeacherService.deleteOption,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lectureExam", lectureId] });
            showToast("تم حذف الاختيار بنجاح");
        },
        onError: () => showToast("فشل حذف الاختيار", "error")
    });


    // Mutation: Delete Exam
    const deleteExamMutation = useMutation({
        mutationFn: TeacherService.deleteExam,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lectureExam", lectureId] });
            localStorage.setItem('exam_manager_toast', "تم حذف الامتحان بنجاح");
            window.location.reload();
        },
        onError: () => showToast("فشل حذف الامتحان", "error")
    });

    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const confirmDeleteExam = () => {
        deleteExamMutation.mutate(exam!.id);
        setIsDeleteConfirmOpen(false);
    };

    const handleCreateExam = () => {
        if (!examTitle || !examTitle.trim()) return showToast("يرجى إدخال عنوان الامتحان", "error");
        if (!deadline) return showToast("يرجى اختيار موعد انتهاء الامتحان", "error");

        const duration = Number(durationInMinutes);
        if (isNaN(duration) || duration <= 0) {
            return showToast("يرجى إدخال مدة امتحان صحيحة", "error");
        }

        const deadlineDate = new Date(deadline);
        if (isNaN(deadlineDate.getTime())) {
            return showToast("موعد انتهاء غير صالح", "error");
        }

        if (isEditingExam && exam) {
            editExamMutation.mutate({
                id: exam.id,
                title: examTitle,
                lectureId,
                deadline: deadlineDate.toISOString(),
                durationInMinutes: duration,
                type: examType,
                isRandomized
            }, {
                onSuccess: () => {
                    // Handle visibility change if it's different (or always update to be safe)
                    changeVisibilityMutation.mutate({
                        examId: exam.id,
                        isVisible: isVisible
                    }, {
                        onSuccess: () => {
                            queryClient.invalidateQueries({ queryKey: ["lectureExam", lectureId] });
                            setIsEditingExam(false);
                            showToast("تم تعديل الامتحان بنجاح");
                        }
                    });
                }
            });
        } else {
            createExamMutation.mutate({
                title: examTitle,
                lectureId,
                deadline: deadlineDate.toISOString(),
                durationInMinutes: duration,
                type: examType,
                isVisible,
                isRandomized
            });
        }
    };

    if (isLoadingExam) {

        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-brand-red" size={48} />
            </div>
        );
    }

    // --- Create Exam UI ---
    if (!exam && !isCreatingExam) {
        return (
            <div className="text-center py-12 glass-card rounded-[2.5rem] border-dashed border-2 border-white/10">
                <div className="bg-brand-red/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-red">
                    <FileText size={40} />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">لا يوجد امتحان لهذه المحاضرة</h3>
                <p className="text-gray-400 font-bold mb-8">يمكنك إنشاء امتحان جديد وإضافة أسئلة متنوعة لطلابك</p>
                <Button
                    onClick={() => setIsCreatingExam(true)}
                    className="h-14 px-8 rounded-xl text-lg font-black"
                >
                    <Plus className="ml-2" />
                    إنشاء امتحان الآن
                </Button>
            </div>
        );
    }

    // --- Create/Edit Exam UI ---
    if (isCreatingExam || isEditingExam) {
        return (
            <div className="w-full mx-auto space-y-4 md:space-y-6 relative animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
                {notification && (
                    <Toast
                        message={notification.message}
                        type={notification.type}
                        onClose={() => setNotification(null)}
                    />
                )}

                {/* Modern Header Section */}
                <div className="flex flex-col md:flex-row items-center justify-between bg-gradient-to-l from-brand-red/10 to-transparent p-4 md:p-6 rounded-3xl border border-white/5 shadow-xl shadow-brand-red/5">
                    <div className="flex items-center gap-4 text-right order-2 md:order-1">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-brand-red/20 flex items-center justify-center text-brand-red shadow-lg shadow-brand-red/10 border border-brand-red/20 rotate-3">
                            {isEditingExam ? <Save size={24} /> : <FilePlus size={24} />}
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-white leading-tight">
                                {isEditingExam ? "تحديث بيانات الامتحان" : "تصميم امتحان جديد"}
                            </h3>
                            <div className="flex items-center justify-end gap-2 mt-1 text-gray-500 text-xs font-bold">
                                <span>{lectureName}</span>
                                <span className="w-1 h-1 bg-gray-700 rounded-full" />
                                <span>إعدادات المحاضرة</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setIsCreatingExam(false);
                            setIsEditingExam(false);
                        }}
                        className="mb-4 md:mb-0 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/10 order-1 md:order-2 flex items-center gap-2"
                    >
                        <span className="hidden md:block font-bold text-xs">إغلاق وتراجع</span>
                        <X size={18} />
                    </button>
                </div>

                {/* Two-Column Form Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-start">

                    {/* Main Column: Content & Configuration */}
                    <div className="lg:col-span-7 space-y-4 md:space-y-6">
                        <div className="glass-card p-5 md:p-6 rounded-3xl border border-white/5 space-y-6">
                            <h4 className="text-lg font-black text-white flex items-center justify-end gap-3 border-b border-white/5 pb-3">
                                <span className="text-gray-500 font-normal text-xs">أدخل عنواناً واضحاً للامتحان</span>
                                المعلومات الأساسية
                            </h4>

                            <div className="space-y-2 text-right">
                                <Label className="text-gray-400 text-sm font-bold pr-2">عنوان الامتحان</Label>
                                <Input
                                    value={examTitle}
                                    onChange={(e) => setExamTitle(e.target.value)}
                                    placeholder="مثال: مراجعة نهائية على الفصل الثاني"
                                    className="h-12 md:h-14 rounded-xl text-lg text-right bg-white/[0.02] border-2 border-white/5 focus:border-brand-red focus:bg-white/[0.04] text-white font-black transition-all placeholder:text-gray-600 px-6"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Exam Type Selector */}
                                <div className="space-y-2 text-right">
                                    <Label className="text-gray-400 text-sm font-bold pr-2">نوع الاختبار</Label>
                                    <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                                        <button
                                            type="button"
                                            onClick={() => setExamType(1)}
                                            className={`flex-1 py-2.5 rounded-lg font-black text-xs transition-all duration-300 ${examType === 1
                                                ? 'bg-brand-red text-white shadow-lg shadow-brand-red/30'
                                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                                }`}
                                        >
                                            امتحان
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setExamType(2)}
                                            className={`flex-1 py-2.5 rounded-lg font-black text-xs transition-all duration-300 ${examType === 2
                                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                                }`}
                                        >
                                            واجب منزلي
                                        </button>
                                    </div>
                                </div>

                                {/* Duration Section */}
                                <div className="space-y-2 text-right">
                                    <Label className="text-gray-400 text-sm font-bold pr-2">مدة الامتحان (دقيقة)</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={durationInMinutes}
                                            onChange={(e) => setDurationInMinutes(Number(e.target.value))}
                                            className="h-12 md:h-[50px] rounded-xl text-center text-xl bg-black/40 border border-white/10 focus:border-brand-red text-white font-black pl-12 transition-all"
                                        />
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-1">
                                <Label className="text-gray-400 text-xs font-bold pr-2 block mb-2 text-right">اختيارات سريعة للمدة</Label>
                                <div className="grid grid-cols-6 gap-2">
                                    {[15, 30, 45, 60, 90, 120].map((mins) => (
                                        <button
                                            key={mins}
                                            type="button"
                                            onClick={() => setDurationInMinutes(mins)}
                                            className={`h-9 rounded-lg font-bold text-[11px] transition-all duration-200 border ${durationInMinutes === mins
                                                ? 'bg-brand-red/10 border-brand-red text-brand-red scale-105'
                                                : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/20'
                                                }`}
                                        >
                                            {mins} د
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Status & Options Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                                onClick={() => setIsVisible(!isVisible)}
                                className={`p-5 rounded-3xl border-2 cursor-pointer transition-all duration-500 group relative overflow-hidden ${isVisible
                                    ? 'bg-green-500/10 border-green-500/30 hover:border-green-500/50 shadow-lg shadow-green-500/5'
                                    : 'bg-white/5 border-white/5 hover:border-white/10'
                                    }`}
                            >
                                <div className="flex items-center justify-between relative z-10">
                                    <div className={`w-12 h-7 rounded-full relative transition-all duration-500 ${isVisible ? 'bg-green-500' : 'bg-gray-600'}`}>
                                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all duration-500 ${isVisible ? 'right-1' : 'left-1'}`} />
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-black text-base ${isVisible ? 'text-green-500' : 'text-gray-400'}`}>الظهور للطلاب</p>
                                        <p className="text-[10px] text-gray-500 font-bold mt-0.5">تفعيل عرض الامتحان في المنصة</p>
                                    </div>
                                </div>
                            </div>

                            <div
                                onClick={() => setIsRandomized(!isRandomized)}
                                className={`p-5 rounded-3xl border-2 cursor-pointer transition-all duration-500 group relative overflow-hidden ${isRandomized
                                    ? 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50 shadow-lg shadow-blue-500/5'
                                    : 'bg-white/5 border-white/5 hover:border-white/10'
                                    }`}
                            >
                                <div className="flex items-center justify-between relative z-10">
                                    <div className={`w-12 h-7 rounded-full relative transition-all duration-500 ${isRandomized ? 'bg-blue-500' : 'bg-gray-600'}`}>
                                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all duration-500 ${isRandomized ? 'right-1' : 'left-1'}`} />
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-black text-base ${isRandomized ? 'text-blue-500' : 'text-gray-400'}`}>توزيع عشوائي</p>
                                        <p className="text-[10px] text-gray-500 font-bold mt-0.5">تغيير ترتيب الأسئلة لكل طالب</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Column: Scheduling & Preview */}
                    <div className="lg:col-span-5 space-y-4 md:space-y-6">
                        <div className="glass-card p-5 md:p-6 rounded-3xl border border-white/5 flex flex-col gap-4 bg-gradient-to-b from-white/[0.02] to-transparent">
                            <h4 className="text-lg font-black text-white flex items-center justify-end gap-3 text-right">
                                <span className="text-gray-500 font-normal text-xs">حدد موعد انتهاء استلام الإجابات</span>
                                موعد انتهاء الامتحان
                            </h4>

                            {/* Professional Actions Row */}
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => {
                                        const d = new Date(); d.setHours(23, 59, 0, 0); setDeadline(d.toISOString().slice(0, 16));
                                    }}
                                    className="py-2 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black text-gray-400 hover:bg-brand-red hover:text-white transition-all"
                                >
                                    نهاية اليوم
                                </button>
                                <button
                                    onClick={() => {
                                        const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(23, 59, 0, 0); setDeadline(d.toISOString().slice(0, 16));
                                    }}
                                    className="py-2 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black text-gray-400 hover:bg-brand-red hover:text-white transition-all"
                                >
                                    نهاية الغد
                                </button>
                                <button
                                    onClick={() => {
                                        const d = new Date(); d.setDate(d.getDate() + 7); d.setHours(23, 59, 0, 0); setDeadline(d.toISOString().slice(0, 16));
                                    }}
                                    className="py-2 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black text-gray-400 hover:bg-brand-red hover:text-white transition-all"
                                >
                                    بعد أسبوع
                                </button>
                            </div>

                            {/* Trigger Inputs */}
                            <div className="space-y-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCalendar(true)}
                                    className="w-full h-16 md:h-20 rounded-2xl bg-black/40 border-2 border-white/5 hover:border-brand-red/50 flex flex-row-reverse items-center justify-between px-6 transition-all group overflow-hidden relative"
                                >
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Expiry Date</span>
                                        <span className="text-lg md:text-xl font-black text-white">
                                            {deadline ? new Date(deadline).toLocaleDateString('ar-EG', { day: '2-digit', month: 'long', year: 'numeric' }) : 'اضغط لاختيار التاريخ'}
                                        </span>
                                    </div>
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:bg-brand-red/20 group-hover:text-brand-red transition-all shadow-lg border border-white/5">
                                        <Calendar size={20} />
                                    </div>
                                </button>

                                <div className="relative">
                                    <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none z-10" size={20} />
                                    <Input
                                        type="time"
                                        value={deadline.includes('T') ? deadline.split('T')[1].slice(0, 5) : (deadline.includes(' ') ? deadline.split(' ')[1].slice(0, 5) : '')}
                                        onChange={(e) => {
                                            const currentDate = deadline.includes('T') ? deadline.split('T')[0] : (deadline.includes(' ') ? deadline.split(' ')[0] : new Date().toISOString().split('T')[0]);
                                            setDeadline(`${currentDate}T${e.target.value}`);
                                        }}
                                        className="h-16 md:h-20 rounded-2xl text-center text-3xl bg-black/40 border-2 border-white/5 focus:border-brand-red text-white font-black hover:border-white/20 transition-all duration-300 cursor-pointer pl-16 pr-6"
                                    />
                                </div>
                            </div>

                            {/* Deadline Preview Stats Card */}
                            {deadline && (
                                <div className="mt-2 p-5 rounded-2xl bg-gradient-to-br from-brand-red/20 via-[#1a1c1e] to-transparent border border-brand-red/30 overflow-hidden relative shadow-2xl">
                                    <div className="absolute top-0 right-0 p-6 opacity-5">
                                        <Clock size={80} />
                                    </div>
                                    <div className="relative z-10 space-y-3">
                                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                            <div className="text-right">
                                                <p className="text-white font-black text-sm">
                                                    {new Date(deadline).toLocaleDateString('ar-EG', { weekday: 'long' })}
                                                </p>
                                                <p className="text-brand-red font-bold text-xs mt-1">
                                                    {new Date(deadline).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <div className="bg-brand-red/20 text-brand-red p-2.5 rounded-xl shadow-lg border border-brand-red/20">
                                                <Clock size={20} />
                                            </div>
                                        </div>

                                        <div className="text-center pt-1">
                                            <div className="text-xl md:text-2xl font-black text-white tracking-tight drop-shadow-lg">
                                                {(() => {
                                                    const deadlineDate = new Date(deadline);
                                                    const now = new Date();
                                                    const diff = deadlineDate.getTime() - now.getTime();
                                                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                                    if (diff < 0) return '⚠️ هذا الموعد منتهي';
                                                    if (days > 0) return `⏳ متبقي ${days} يوم و ${hours} ساعة`;
                                                    if (hours > 0) return `⏳ متبقي ${hours} ساعة و ${minutes} د`;
                                                    return `⏳ متبقي ${minutes} دقيقة فقط`;
                                                })()}
                                            </div>
                                            <p className="text-gray-500 font-bold text-[9px] mt-1 uppercase tracking-widest opacity-60">Time remaining until auto-close</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!deadline && (
                                <div className="p-6 rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center space-y-3 bg-white/[0.01]">
                                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-gray-700">
                                        <Search size={24} />
                                    </div>
                                    <p className="text-gray-500 font-bold max-w-[180px] text-xs leading-relaxed">يرجى تحديد الموعد النهائي بدقة</p>
                                </div>
                            )}
                        </div>

                        {/* Summary Action Card */}
                        <div className="p-1.5 rounded-[2.5rem] bg-brand-red/5 border border-brand-red/10 shadow-2xl">
                            <Button
                                onClick={handleCreateExam}
                                isLoading={createExamMutation.isPending || editExamMutation.isPending}
                                className="w-full h-16 md:h-20 rounded-[2rem] text-xl font-black bg-brand-red hover:bg-brand-red/90 text-white shadow-xl shadow-brand-red/30 flex items-center justify-center gap-4 transition-all transform active:scale-[0.97]"
                            >
                                <Save size={24} />
                                {isEditingExam ? "تحديث وحفظ التغييرات" : "اعتماد وإنشاء الامتحان"}
                            </Button>
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsCreatingExam(false);
                                setIsEditingExam(false);
                            }}
                            className="w-full h-12 md:h-14 rounded-xl text-base font-bold border-white/5 hover:bg-white/5 text-gray-500 hover:text-white transition-all transition-colors"
                        >
                            تراجع عن الإجراء
                        </Button>
                    </div>
                </div>

                {/* Modern Date Picker Modal */}
                {showCalendar && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-2xl bg-black/60 animate-in fade-in duration-500" onClick={() => setShowCalendar(false)}>
                        <div className="w-full max-w-sm bg-[#06080a] border border-white/10 rounded-[3.5rem] overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.9)] animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                            <div className="p-10 border-b border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent">
                                <div className="flex items-center justify-between mb-8">
                                    <button onClick={() => setCalendarViewDate(new Date(calendarViewDate.setMonth(calendarViewDate.getMonth() - 1)))} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-white">
                                        <ChevronLeft size={24} />
                                    </button>
                                    <div className="text-center">
                                        <h4 className="text-2xl font-black text-white">
                                            {calendarViewDate.toLocaleDateString('ar-EG', { month: 'long' })}
                                        </h4>
                                        <p className="text-brand-red font-bold text-sm opacity-80">{calendarViewDate.getFullYear()}</p>
                                    </div>
                                    <button onClick={() => setCalendarViewDate(new Date(calendarViewDate.setMonth(calendarViewDate.getMonth() + 1)))} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-white">
                                        <ChevronRight size={24} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-7 mb-4 px-2">
                                    {['أحد', 'اثن', 'ثلا', 'أرب', 'خميس', 'جمع', 'سبت'].map(day => (
                                        <div key={day} className="text-center text-gray-600 font-black text-[9px] uppercase tracking-tighter">{day}</div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="grid grid-cols-7 gap-2">
                                    {(() => {
                                        const days = [];
                                        const y = calendarViewDate.getFullYear(), m = calendarViewDate.getMonth();
                                        const firstDay = new Date(y, m, 1).getDay(), daysInMonth = new Date(y, m + 1, 0).getDate();
                                        for (let i = 0; i < firstDay; i++) days.push(<div key={`e-${i}`} />);
                                        for (let d = 1; d <= daysInMonth; d++) {
                                            const cur = new Date(y, m, d);
                                            const isSelected = deadline && new Date(deadline).toDateString() === cur.toDateString();
                                            const isPast = cur < new Date(new Date().setHours(0, 0, 0, 0));
                                            const isToday = new Date().toDateString() === cur.toDateString();
                                            days.push(
                                                <button key={d} disabled={isPast} onClick={() => {
                                                    const timePart = deadline.includes('T') ? deadline.split('T')[1] : '18:00';
                                                    setDeadline(`${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}T${timePart}`);
                                                    setShowCalendar(false);
                                                }} className={`h-11 rounded-xl text-sm font-black transition-all relative ${isSelected ? 'bg-brand-red text-white shadow-lg shadow-brand-red/30 scale-110 z-10' : isPast ? 'text-gray-800' : 'text-gray-400 hover:bg-white/5 hover:text-white hover:scale-105'}`}>
                                                    {d}
                                                    {isToday && !isSelected && <div className="absolute top-1 right-1 w-1 h-1 bg-brand-red rounded-full" />}
                                                </button>
                                            );
                                        }
                                        return days;
                                    })()}
                                </div>
                            </div>
                            <div className="p-8 pt-0">
                                <button onClick={() => setShowCalendar(false)} className="w-full py-5 rounded-3xl bg-white/5 hover:bg-white/10 text-white font-black border border-white/5 transition-all">إغلاق وتراجع</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- Exam Structure UI ---
    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {notification && (
                <Toast
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
            {/* Header */}
            <div className="glass-card p-5 md:p-6 rounded-3xl border border-white/5">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                    {/* Action Buttons - Left Side */}
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full lg:w-auto order-2 lg:order-1">
                        <Button
                            variant="outline"
                            onClick={() => setIsViewingSubmissions(true)}
                            className="h-10 md:h-12 px-4 rounded-xl border-brand-red/20 text-brand-red hover:bg-brand-red/10 font-bold text-xs md:text-sm gap-2"
                        >
                            <Users size={16} />
                            <span>نتائج الطلاب</span>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                if (exam) {
                                    setExamTitle(exam.title);
                                    setDurationInMinutes(exam.durationInMinutes || 60);
                                    setExamType(exam.type || 1);
                                    setIsVisible(exam.isVisible ?? true);
                                    setIsRandomized(exam.isRandomized ?? false);
                                    if (exam.deadline) {
                                        const date = new Date(exam.deadline);
                                        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                                        setDeadline(localDate);
                                    }
                                    setIsEditingExam(true);
                                }
                            }}
                            className="h-10 md:h-12 px-4 rounded-xl border-white/10 text-white hover:bg-white/5 font-bold text-xs md:text-sm"
                        >
                            تعديل البيانات
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteConfirmOpen(true)}
                            isLoading={deleteExamMutation.isPending}
                            className="h-10 md:h-12 w-10 md:w-12 p-0 rounded-xl border-brand-red/20 text-brand-red hover:bg-brand-red/10 flex items-center justify-center"
                        >
                            <Trash2 size={18} />
                        </Button>

                        <Button
                            onClick={() => {
                                setExpandedQuestion(null);
                                addQuestionRef.current?.scrollIntoView({ behavior: "smooth" });
                            }}
                            className="h-10 md:h-12 px-5 rounded-xl text-xs md:text-sm font-black shadow-lg shadow-brand-red/20 bg-brand-red hover:bg-brand-red/90 whitespace-nowrap flex items-center gap-2"
                        >
                            <Plus size={18} />
                            إضافة سؤال جديد
                        </Button>
                    </div>

                    {/* Title and Info - Right Side */}
                    <div className="text-right w-full lg:flex-1 order-1 lg:order-2">
                        <div className="flex flex-wrap items-center gap-2 md:gap-3 justify-end mb-2">
                            <span className="bg-brand-red/10 text-brand-red text-[10px] md:text-xs font-black px-2 md:px-3 py-1 rounded-full uppercase tracking-wider">Exam Draft</span>
                            <h2 className="text-xl md:text-3xl font-black text-white">{exam?.title}</h2>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-x-2 md:gap-x-4 gap-y-1 text-xs md:text-base text-gray-400 font-bold">
                            <span>{lectureName}</span>
                            <span>•</span>
                            <span>{exam?.questions.length || 0} سؤال</span>
                            {exam?.durationInMinutes ? (
                                <>
                                    <span className="hidden sm:inline">•</span>
                                    <span className="flex items-center gap-1">
                                        المدة: {exam.durationInMinutes} دقيقة
                                    </span>
                                </>
                            ) : null}
                            {exam?.deadline ? (
                                <>
                                    <span className="hidden sm:inline">•</span>
                                    <span className="flex items-center gap-1 text-[11px] md:text-base">
                                        ينتهي في: {new Date(exam.deadline).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            {isViewingSubmissions ? (
                <SubmissionsManager
                    lectureId={lectureId}
                    examId={exam!.id}
                    lectureName={lectureName}
                    onBack={() => setIsViewingSubmissions(false)}
                />
            ) : (
                <div className="space-y-4">
                    {exam?.questions.map((q, index) => (
                        <QuestionCard
                            key={q.id}
                            question={q}
                            index={index}
                            isExpanded={expandedQuestion === q.id}
                            onToggle={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                            onAddOption={(data) => createOptionMutation.mutate(data)}
                            onDeleteQuestion={(id) => deleteQuestionMutation.mutate(id)}
                            onEditQuestion={(data) => editQuestionMutation.mutate(data)}
                            onDeleteOption={(id) => deleteOptionMutation.mutate(id)}
                            onEditOption={(data) => editOptionMutation.mutate(data)}
                            isOptionLoading={createOptionMutation.isPending || editOptionMutation.isPending || deleteOptionMutation.isPending}
                            isQuestionActionLoading={editQuestionMutation.isPending || deleteQuestionMutation.isPending}
                            showToast={showToast}
                            onPreviewImage={(url) => setPreviewImageModal(url)}
                        />

                    ))}

                    {/* Add Question Component */}
                    <div ref={addQuestionRef}>
                        <AddQuestionForm
                            examId={exam!.id}
                            lectureId={lectureId}
                            onAdd={(data) => createQuestionMutation.mutate(data)}
                            isLoading={createQuestionMutation.isPending}
                            showToast={showToast}
                            onPreviewImage={(url) => setPreviewImageModal(url)}
                        />
                    </div>
                </div>
            )}

            {/* Premium Delete Confirmation Modal */}
            {isDeleteConfirmOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md">
                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={() => setIsDeleteConfirmOpen(false)}
                    />
                    <div className="relative z-10 w-full max-w-lg bg-[#0d1117] border border-white/10 rounded-[2.5rem] p-10 text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 fade-in duration-300">
                        {/* Danger Icon with pulse effect */}
                        <div className="relative w-24 h-24 mx-auto mb-8">
                            <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
                            <div className="relative w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 border border-red-500/20">
                                <Trash2 size={48} strokeWidth={1.5} />
                            </div>
                        </div>

                        <div className="space-y-4 mb-10">
                            <h3 className="text-3xl font-black text-white tracking-tight">تنبيه: حذف نهائي للمحتوى</h3>
                            <div className="space-y-4">
                                <p className="text-gray-400 font-bold text-lg leading-relaxed">
                                    أنت على وشك حذف امتحان <span className="text-white">"{exam?.title}"</span> بشكل نهائي.
                                </p>
                                <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 text-sm font-bold text-red-400/80 leading-relaxed">
                                    هذا الإجراء سيؤدي إلى مسح جميع الأسئلة ({exam?.questions.length}), إحصائيات الطلاب، والدرجات المسجلة. لا يمكن التراجع عن هذه الخطوة.
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                onClick={confirmDeleteExam}
                                isLoading={deleteExamMutation.isPending}
                                className="flex-[2] h-16 rounded-2xl text-xl font-black bg-red-600 hover:bg-red-700 text-white border-0 shadow-lg shadow-red-600/20"
                            >
                                نعم، احذف الامتحان
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsDeleteConfirmOpen(false)}
                                className="flex-1 h-16 rounded-2xl text-xl font-black border-white/10 hover:bg-white/5 text-gray-400"
                            >
                                تراجع
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Preview Modal */}
            {previewImageModal && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-lg animate-in fade-in duration-200"
                    onClick={() => setPreviewImageModal(null)}
                >
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                        <button
                            className="absolute top-6 right-6 z-50 text-white/70 hover:text-white transition-all bg-black/50 hover:bg-white/10 border border-white/10 rounded-full p-3 backdrop-blur-md"
                            onClick={() => setPreviewImageModal(null)}
                        >
                            <X size={28} />
                        </button>

                        <img
                            src={previewImageModal}
                            alt="Preview"
                            className="max-w-full max-h-[90vh] w-auto h-auto rounded-xl shadow-2xl border border-white/10 object-contain zoom-in-95 animate-in slide-in-from-bottom-4 duration-300"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Sub-components ---

function QuestionCard({
    question,
    index,
    isExpanded,
    onToggle,
    onAddOption,
    onDeleteQuestion,
    onEditQuestion,
    onDeleteOption,
    onEditOption,
    isOptionLoading,
    isQuestionActionLoading,
    showToast,
    onPreviewImage
}: {
    question: ExamQuestion;
    index: number;
    isExpanded: boolean;
    onToggle: () => void;
    onAddOption: (data: CreateOptionRequest) => void;
    onDeleteQuestion: (questionId: number) => void;
    onEditQuestion: (data: EditQuestionRequest) => void;
    onDeleteOption: (optionId: number) => void;
    onEditOption: (data: EditOptionRequest) => void;
    isOptionLoading: boolean;
    isQuestionActionLoading: boolean;
    showToast: (message: string, type?: 'success' | 'error') => void;
    onPreviewImage: (url: string) => void;
}) {
    const [optionContent, setOptionContent] = useState("");
    const [isCorrect, setIsCorrect] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Edit Question State
    const [editContent, setEditContent] = useState(question.content);
    const [editScore, setEditScore] = useState(question.score);
    const [editAnswerType, setEditAnswerType] = useState(question.answerType);
    const [editCorrectByAssistant, setEditCorrectByAssistant] = useState(question.correctByAssistant);
    const [editFile, setEditFile] = useState<File | null>(null);
    const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);

    // Update preview when file changes
    useEffect(() => {
        if (!editFile) {
            setEditPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(editFile);
        setEditPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [editFile]);

    const [editingOptionId, setEditingOptionId] = useState<number | null>(null);
    const [editOptionContent, setEditOptionContent] = useState("");
    const [editOptionIsCorrect, setEditOptionIsCorrect] = useState(false);


    const handleUpdateQuestion = () => {
        if (!editContent.trim()) return showToast("ادخل محتوى السؤال", "error");
        onEditQuestion({
            id: question.id,
            examId: question.examId,
            content: editContent,
            score: Number(editScore),
            answerType: editAnswerType,
            questionType: question.questionType,
            correctByAssistant: editCorrectByAssistant,
            file: editFile || undefined
        });
        setIsEditing(false);
    };

    return (
        <div className={`glass-card rounded-3xl overflow-hidden border-2 transition-all duration-500 ${isExpanded ? 'border-brand-red/30 ring-4 ring-brand-red/5' : 'border-white/5'}`}>
            <div
                className="p-4 md:p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                onClick={onToggle}
            >
                <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronUp className="text-brand-red" size={18} /> : <ChevronDown className="text-gray-500" size={18} />}
                    <div className="text-xs font-black text-gray-500 bg-white/5 w-7 h-7 rounded-full flex items-center justify-center">
                        {index + 1}
                    </div>
                </div>

                <div className="flex-1 px-4 text-right">
                    <h4 className="text-base md:text-lg font-bold text-white break-words leading-relaxed">{question.content}</h4>
                    <div className="flex items-center justify-end gap-3 mt-1">
                        <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded uppercase">{question.questionType}</span>
                        <span className="text-[10px] font-bold text-brand-red bg-brand-red/10 px-2 py-0.5 rounded">{question.score} درجة</span>
                        {question.answerType !== "Essay" && question.answerType !== "Image" && (
                            <span className="text-[10px] font-bold text-gray-400">• {question.options.length} اختيارات</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="p-2.5 bg-brand-red/10 rounded-xl text-brand-red">
                        <HelpCircle size={20} />
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="p-5 md:p-6 bg-black/40 border-t border-white/5 animate-in slide-in-from-top-4 duration-500">
                    {/* Action Bar */}
                    <div className="flex justify-start gap-2 mb-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsEditing(!isEditing)}
                            className="h-10 rounded-xl border-white/10 hover:bg-white/5 gap-2"
                        >
                            <Save size={16} />
                            {isEditing ? "إلغاء التعديل" : "تعديل السؤال"}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("هل أنت متأكد من حذف هذا السؤال؟")) {
                                    onDeleteQuestion(question.id);
                                }
                            }}
                            isLoading={isQuestionActionLoading}
                            className="h-10 rounded-xl border-red-500/20 text-red-500 hover:bg-red-500/10 gap-2"
                        >
                            <Trash2 size={16} />
                            حذف السؤال
                        </Button>
                    </div>

                    {isEditing ? (
                        /* Edit Question Form */
                        <div className="mb-8 p-8 bg-[#0d1117] rounded-[2rem] border-2 border-brand-red/20 text-right space-y-6 animate-in zoom-in-95">
                            <h5 className="text-xl font-black text-white">تعديل السؤال</h5>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-400 font-bold">محتوى السؤال</Label>
                                    {question.questionType === "Image" ? (
                                        <div className="space-y-3">
                                            <div className="rounded-xl overflow-hidden border border-white/10 bg-[#06080a] p-2 relative group cursor-zoom-in" onClick={() => onPreviewImage(editPreviewUrl || (editContent.startsWith('http') ? editContent : `${env.API.SERVER_URL}/${editContent}`))}>
                                                <img
                                                    src={editPreviewUrl || (editContent.startsWith('http') ? editContent : `${env.API.SERVER_URL}/${editContent}`)}
                                                    alt="Current Question"
                                                    className="w-full h-auto max-h-[300px] object-contain rounded-lg"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <Maximize2 size={24} className="text-white" />
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-gray-500 break-all text-center">{editContent}</p>
                                        </div>
                                    ) : (
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="w-full h-32 bg-[#06080a] border border-white/5 rounded-xl p-4 text-white text-right outline-none focus:border-brand-red transition-all"
                                        />
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-gray-400 font-bold">الدرجة</Label>
                                        <Input
                                            type="number"
                                            value={editScore}
                                            onChange={(e) => setEditScore(Number(e.target.value))}
                                            className="h-12 bg-[#06080a] border-white/5 text-right"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-400 font-bold">نوع الإجابة</Label>
                                        <select
                                            value={editAnswerType}
                                            onChange={(e) => setEditAnswerType(e.target.value)}
                                            className="w-full h-12 bg-[#06080a] border border-white/5 rounded-xl px-4 text-white text-right outline-none"
                                        >
                                            <option value="MCQ">اختيار من متعدد</option>
                                            <option value="TrueFalse">صح أو خطأ</option>
                                            <option value="Essay">سؤال مقالي</option>
                                            <option value="Image">سؤال بصورة</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-3">
                                    <Label className="text-gray-400 font-bold cursor-pointer" htmlFor={`edit-ai-${question.id}`}>تصحيح مساعد المدرس؟</Label>
                                    <input
                                        type="checkbox"
                                        id={`edit-ai-${question.id}`}
                                        checked={editCorrectByAssistant}
                                        onChange={(e) => setEditCorrectByAssistant(e.target.checked)}
                                        className="w-5 h-5 accent-brand-red"
                                    />
                                </div>
                                {question.questionType === "Image" && (
                                    <div className="space-y-2">
                                        <Label className="text-gray-400 font-bold">تغيير الصورة</Label>
                                        <Input
                                            type="file"
                                            onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                                            className="h-12 bg-[#06080a] border-white/5"
                                        />
                                    </div>
                                )}
                                <Button
                                    onClick={handleUpdateQuestion}
                                    className="w-full h-14 rounded-xl text-lg font-black"
                                    isLoading={isQuestionActionLoading}
                                >
                                    حفظ التعديلات
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /* Question Details View */
                        <div className="mb-8 p-6 bg-[#06080a] rounded-2xl border border-white/5 text-right space-y-4">
                            <Label className="text-brand-red text-xs font-black mb-2 block uppercase tracking-widest">محتوى السؤال</Label>
                            {question.questionType === "Image" ? (
                                <div className="rounded-xl overflow-hidden border border-white/10 bg-black/20 max-w-2xl mx-auto">
                                    <img
                                        src={question.content.startsWith('http') ? question.content : `${env.API.SERVER_URL}/${question.content}`}
                                        alt="Question Content"
                                        className="w-full h-auto object-contain"
                                    />
                                </div>
                            ) : (
                                <p className="text-white text-lg font-bold leading-relaxed">{question.content}</p>
                            )}
                            <div className="flex justify-end pt-2">
                                <div className={`px-3 py-1 rounded-lg text-xs font-black ${question.correctByAssistant ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                                    {question.correctByAssistant ? "تصحيح مساعد المدرس مفعّل" : "تصحيح تلقائي"}
                                </div>
                            </div>

                            {/* Correct Answer Image Display - Enhanced Design */}
                            {question.correctAnswerPath && (
                                <div className="mt-6 relative group/card">
                                    <div className="absolute -top-3 right-4 px-3 py-1 bg-[#06080a] border border-green-500/20 rounded-full flex items-center gap-2 z-10 shadow-xl shadow-black/50">
                                        <Lightbulb size={14} className="text-green-500 fill-green-500/10" />
                                        <span className="text-[11px] font-black text-green-500 tracking-wide">توضيح الإجابة</span>
                                    </div>

                                    <div className="rounded-2xl border border-green-500/10 bg-gradient-to-br from-green-500/5 to-transparent p-1">
                                        <div className="bg-[#080a0d]/80 rounded-xl p-4 flex flex-col sm:flex-row gap-5 items-center backdrop-blur-sm">

                                            {/* Image Container */}
                                            <div
                                                className="relative w-full sm:w-40 h-32 shrink-0 rounded-xl overflow-hidden border border-white/10 bg-black/40 cursor-pointer shadow-lg group-hover/card:shadow-green-500/10 transition-all duration-300"
                                                onClick={() => onPreviewImage(question.correctAnswerPath?.includes('http') ? question.correctAnswerPath : `${env.API.SERVER_URL}/${question.correctAnswerPath}`)}
                                            >
                                                <img
                                                    src={question.correctAnswerPath.includes('http') ? question.correctAnswerPath : `${env.API.SERVER_URL}/${question.correctAnswerPath}`}
                                                    alt="Explanation"
                                                    className="w-full h-full object-cover opacity-80 group-hover/card:opacity-100 group-hover/card:scale-110 transition-all duration-500"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                                                    <Maximize2 size={24} className="text-white drop-shadow-md" />
                                                </div>
                                            </div>

                                            {/* Info Text */}
                                            <div className="flex-1 text-center sm:text-right space-y-2">
                                                <h4 className="text-white font-bold text-sm">صورة الإجابة النموذجية</h4>
                                                <p className="text-gray-400 text-xs leading-relaxed font-medium">
                                                    تظهر هذه الصورة للطالب بعد الانتهاء من الامتحان لتوضيح الحل الصحيح بشكل مرئي.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Options Content - Only for non-essay questions */}
                    {question.answerType !== "Essay" && question.answerType !== "Image" ? (
                        <>
                            {/* Options List */}
                            <div className="space-y-4 mb-8">
                                <Label className="text-gray-400 font-black block text-right pr-2">الخيارات المتاحة</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {question.options.map((opt) => (
                                        <div
                                            key={opt.id}
                                            className={`p-4 rounded-xl border flex flex-col gap-3 text-right group transition-all ${opt.isCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/5'}`}
                                        >
                                            {editingOptionId === opt.id ? (
                                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                                    <Input
                                                        value={editOptionContent}
                                                        onChange={(e) => setEditOptionContent(e.target.value)}
                                                        className="h-10 bg-[#06080a] border-white/10 text-right"
                                                    />
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex gap-2">
                                                            <Button
                                                                onClick={() => {
                                                                    onEditOption({
                                                                        id: opt.id,
                                                                        content: editOptionContent,
                                                                        isCorrect: editOptionIsCorrect,
                                                                        questionId: question.id
                                                                    });
                                                                    setEditingOptionId(null);
                                                                }}
                                                                className="h-8 px-3 text-xs"
                                                            >
                                                                حفظ
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                onClick={() => setEditingOptionId(null)}
                                                                className="h-8 px-3 text-xs text-gray-400"
                                                            >
                                                                إلغاء
                                                            </Button>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Label className="text-xs text-gray-400">خيار صحيح؟</Label>
                                                            <input
                                                                type="checkbox"
                                                                checked={editOptionIsCorrect}
                                                                onChange={(e) => setEditOptionIsCorrect(e.target.checked)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingOptionId(opt.id);
                                                                setEditOptionContent(opt.content);
                                                                setEditOptionIsCorrect(opt.isCorrect);
                                                            }}
                                                            className="text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Plus size={16} className="rotate-45" /> {/* Using Plus rotated as Edit for now or Lucide has Save? We have Save. Let's use FileText or something. Actually User has Save imported. */}
                                                            <span className="text-[10px] ml-1">تعديل</span>
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm("حذف هذا الاختيار؟")) {
                                                                    onDeleteOption(opt.id);
                                                                }
                                                            }}
                                                            className="text-gray-600 hover:text-brand-red transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-bold ${opt.isCorrect ? 'text-green-400' : 'text-gray-300'}`}>{opt.content}</span>
                                                        {opt.isCorrect && <CheckCircle2 size={16} className="text-green-500" />}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                </div>
                            </div>

                            {/* Add Option Form */}
                            <div className="p-6 bg-[#0d1117] rounded-3xl border border-white/5 space-y-4">
                                <Label className="text-gray-400 font-black text-sm block text-right">إضافة اختيار جديد</Label>
                                <div className="flex flex-col md:flex-row gap-4 items-end">
                                    <Button
                                        onClick={() => {
                                            if (!optionContent.trim()) return showToast("ادخل محتوى الخيار", "error");
                                            onAddOption({ content: optionContent, isCorrect, questionId: question.id });
                                            setOptionContent("");
                                            setIsCorrect(false);
                                        }}
                                        isLoading={isOptionLoading}
                                        className="h-14 px-8 rounded-xl font-bold gap-2 whitespace-nowrap"
                                    >
                                        <Plus size={18} />
                                        إضافة خيار
                                    </Button>

                                    <div className="flex-1 w-full space-y-2 text-right">
                                        <div className="flex items-center justify-end gap-3 mb-2">
                                            <Label className="text-gray-400 font-bold cursor-pointer" htmlFor={`correct-${question.id}`}>خيار صحيح؟</Label>
                                            <input
                                                type="checkbox"
                                                id={`correct-${question.id}`}
                                                checked={isCorrect}
                                                onChange={(e) => setIsCorrect(e.target.checked)}
                                                className="w-5 h-5 rounded border-white/5 bg-[#06080a] accent-green-500 cursor-pointer"
                                            />
                                        </div>
                                        <Input
                                            value={optionContent}
                                            onChange={(e) => setOptionContent(e.target.value)}
                                            placeholder="اكتب الخيار هنا..."
                                            className="h-14 rounded-xl text-right bg-[#06080a] border-white/5"
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-10 bg-brand-red/5 rounded-3xl border border-dashed border-brand-red/20 text-center">
                            <p className="text-brand-red font-black text-lg">
                                {question.answerType === "Essay" ? "سؤال مقالي: يتطلب إجابة مكتوبة من الطالب" : "سؤال بصورة: يتطلب رفع صورة من الطالب كإجابة"}
                            </p>
                            <p className="text-gray-500 font-bold mt-1 text-sm">لن يتم عرض خيارات لهذا النوع من الأسئلة</p>
                        </div>
                    )}
                </div>
            )
            }

        </div >
    );
}

// Interface for inline options when creating question
interface InlineOption {
    id: string; // local unique id
    content: string;
    isCorrect: boolean;
}

function AddQuestionForm({ examId, lectureId, onAdd, isLoading, showToast, onPreviewImage }: { examId: number, lectureId: number, onAdd: (data: any) => void, isLoading: boolean, showToast: (message: string, type?: 'success' | 'error') => void, onPreviewImage: (url: string) => void }) {
    const queryClient = useQueryClient();
    const [content, setContent] = useState("");
    const [score, setScore] = useState(1);
    const [qType, setQType] = useState("Text");
    const [aType, setAType] = useState("MCQ");
    const [correctByAssistant, setCorrectByAssistant] = useState(true);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [correctAnswerFile, setCorrectAnswerFile] = useState<File | null>(null);
    const [correctAnswerPreviewUrl, setCorrectAnswerPreviewUrl] = useState<string | null>(null);

    // Inline options state for MCQ/TrueFalse
    const [inlineOptions, setInlineOptions] = useState<InlineOption[]>([]);
    const [newOptionContent, setNewOptionContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State for saved question (to allow editing after save)
    const [savedQuestionId, setSavedQuestionId] = useState<number | null>(null);
    const [isSaved, setIsSaved] = useState(false);

    // Track where to paste images
    const [activeDropZone, setActiveDropZone] = useState<'question' | 'answer'>('question');

    // Auto-populate True/False options when answer type changes
    useEffect(() => {
        if (aType === "TrueFalse") {
            setInlineOptions([
                { id: "tf-1", content: "صح", isCorrect: false },
                { id: "tf-2", content: "خطأ", isCorrect: false }
            ]);
        } else if (aType === "MCQ" && inlineOptions.length === 2 && inlineOptions[0]?.id === "tf-1") {
            // Clear true/false options when switching to MCQ
            setInlineOptions([]);
        }
    }, [aType]);

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    useEffect(() => {
        if (!correctAnswerFile) {
            setCorrectAnswerPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(correctAnswerFile);
        setCorrectAnswerPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [correctAnswerFile]);

    // Handle Paste Image (Ctrl+V)
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            // Only handle if not typing in an input (unless it's an image paste which usually overrides)
            // But actually, checking for image data is enough. 
            // If dragging text, it's text. If pasting image file, it is file.

            if (e.clipboardData && e.clipboardData.items) {
                const items = e.clipboardData.items;
                for (let i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf("image") !== -1) {
                        e.preventDefault();
                        const pastedFile = items[i].getAsFile();
                        if (pastedFile) {
                            if (activeDropZone === 'answer') {
                                setCorrectAnswerFile(pastedFile);
                                showToast("تم لصق صورة الإجابة! 📸", "success");
                            } else {
                                setFile(pastedFile);
                                setQType("Image"); // Auto-switch to Image Question
                                showToast("تم لصق صورة السؤال! 📸", "success");
                            }
                        }
                        return; // Stop after finding an image
                    }
                }
            }
        };

        window.addEventListener("paste", handlePaste);
        return () => window.removeEventListener("paste", handlePaste);
    }, [activeDropZone]); // Re-bind when activeDropZone changes

    // Add new option
    const handleAddOption = () => {
        if (!newOptionContent.trim()) {
            showToast("يرجى كتابة محتوى الاختيار", "error");
            return;
        }
        const newOption: InlineOption = {
            id: `opt-${Date.now()}`,
            content: newOptionContent.trim(),
            isCorrect: false
        };
        setInlineOptions([...inlineOptions, newOption]);
        setNewOptionContent("");
    };

    // Remove option
    const handleRemoveOption = (id: string) => {
        setInlineOptions(inlineOptions.filter(opt => opt.id !== id));
    };

    // Toggle correct answer
    const handleToggleCorrect = (id: string) => {
        setInlineOptions(inlineOptions.map(opt => ({
            ...opt,
            isCorrect: opt.id === id ? !opt.isCorrect : opt.isCorrect
        })));
    };

    // Edit option content
    const handleEditOptionContent = (id: string, content: string) => {
        setInlineOptions(inlineOptions.map(opt =>
            opt.id === id ? { ...opt, content } : opt
        ));
    };

    // Reset form to start a new question (Duplicate Logic)
    const handleStartNewQuestion = () => {
        // We keep the data currently in the form to allow easy duplication
        // Just reset the ID and Saved status so the next Save acts as a Create
        setSavedQuestionId(null);
        setIsSaved(false);
        showToast("يمكنك الآن إنشاء سؤال جديد بناءً على البيانات الحالية", "success");
    };

    // Clear form completely
    const handleClearForm = () => {
        setContent("");
        setScore(1);
        setQType("Text");
        setAType("MCQ");
        setCorrectByAssistant(true);
        setFile(null);
        setCorrectAnswerFile(null);
        setInlineOptions([]);
        setNewOptionContent("");
        setSavedQuestionId(null);
        setIsSaved(false);
    };

    const handleSubmit = async () => {
        if (qType === "Text" && !content.trim()) return showToast("يرجى كتابة السؤال", "error");
        if (qType === "Image" && !file && !savedQuestionId) return showToast("يرجى اختيار صورة للسؤال", "error");

        // Validate options for MCQ/TrueFalse
        if (aType === "MCQ" || aType === "TrueFalse") {
            if (inlineOptions.length < 2) {
                return showToast("يجب إضافة اختيارين على الأقل", "error");
            }
            const hasCorrectAnswer = inlineOptions.some(opt => opt.isCorrect);
            if (!hasCorrectAnswer) {
                return showToast("يرجى تحديد الإجابة الصحيحة", "error");
            }
        }

        setIsSubmitting(true);

        try {
            // IF UPDATE MODE
            if (savedQuestionId && isSaved) {
                const updateData: EditQuestionRequest = {
                    id: savedQuestionId,
                    examId,
                    questionType: qType,
                    content: qType === "Text" ? content : "Image Question",
                    answerType: aType === "Image" ? "ImageAnswer" : aType,
                    score,
                    correctByAssistant: correctByAssistant,
                    file: qType === "Image" && file ? file : undefined,
                    correctAnswerFile: correctAnswerFile || undefined
                };

                await TeacherService.editQuestion(updateData);
                showToast("تم تحديث بيانات السؤال بنجاح ✓");

                // Note: Updating options is complex, so we simply notify for now
                // Ideally we would sync options here too, but let's keep it safe.
                queryClient.invalidateQueries({ queryKey: ["lectureExam"] });
                setIsSubmitting(false);
                return;
            }

            // IF CREATE MODE
            const questionData: CreateQuestionRequest = {
                examId,
                questionType: qType,
                content: qType === "Text" ? content : "Image Question",
                answerType: aType,
                score,
                correctByAssistant: correctByAssistant,
                file: qType === "Image" && file ? file : undefined,
                correctAnswerFile: correctAnswerFile || undefined
            };

            const questionResponse = await TeacherService.createQuestion(questionData);
            let createdQuestionId = questionResponse.data?.id;

            console.log("Question Response:", questionResponse);
            console.log("Created Question ID from response:", createdQuestionId);

            // If we couldn't get the question ID from the response, try to get it by refreshing the exam
            if (!createdQuestionId && (aType === "MCQ" || aType === "TrueFalse") && inlineOptions.length > 0) {
                console.log("Question ID not in response, fetching exam to find question by content...");

                // Wait 1 second to ensure DB consistency
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Fetch the exam to get the latest questions
                const examResponse = await TeacherService.getExam(lectureId);
                const examData = examResponse.data;

                if (examData?.questions && examData.questions.length > 0) {
                    // Try to find the question by content match (most reliable)
                    // We look at the last 5 questions just in case
                    const recentQuestions = examData.questions.slice(-5);
                    const matchingQuestion = recentQuestions.find(q => q.content === content || (content.length > 5 && q.content.includes(content.substring(0, 20))));

                    if (matchingQuestion) {
                        createdQuestionId = matchingQuestion.id;
                        console.log("Found question ID by content match:", createdQuestionId);
                    } else {
                        // Fallback to absolute last question
                        const lastQuestion = examData.questions[examData.questions.length - 1];
                        createdQuestionId = lastQuestion.id;
                        console.log("Fallback to last question ID:", createdQuestionId);
                    }
                }
            }

            // If still no ID and we need to add options, show message but don't fail hard
            if (!createdQuestionId && (aType === "MCQ" || aType === "TrueFalse") && inlineOptions.length > 0) {
                showToast("تم إنشاء السؤال لكن لم يتم العثور عليه لإضافة الاختيارات. يرجى إضافتها يدوياً.", "error");
                queryClient.invalidateQueries({ queryKey: ["lectureExam"] });
                setIsSubmitting(false);
                setIsSaved(true);
                return;
            }

            // Create options if we have a valid question ID
            if (createdQuestionId && (aType === "MCQ" || aType === "TrueFalse") && inlineOptions.length > 0) {
                console.log("Creating options for question:", createdQuestionId);

                try {
                    // Create options sequentially to avoid backend race conditions
                    for (const opt of inlineOptions) {
                        try {
                            await TeacherService.createOption({
                                content: opt.content,
                                isCorrect: opt.isCorrect,
                                questionId: createdQuestionId
                            });
                        } catch (innerError) {
                            console.error(`Failed to create option ${opt.content}:`, innerError);
                        }
                    }
                    console.log("All options creation attempts finished");
                } catch (optionError) {
                    console.error("Error creating options:", optionError);
                    showToast("حدث خطأ أثناء إضافة بعض الاختيارات", "error");
                }
            }

            // Success - refresh and mark as saved
            queryClient.invalidateQueries({ queryKey: ["lectureExam"] });
            showToast("تم إضافة السؤال والاختيارات بنجاح ✓");

            // Mark as saved and store the question ID
            setSavedQuestionId(createdQuestionId || null);
            setIsSaved(true);

            // Do NOT reset the form here anymore. 
            // The user must click "Add New Question" to reset.

        } catch (error: any) {
            console.error("Error creating question with options:", error);
            showToast("حدث خطأ أثناء إنشاء السؤال", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const needsOptions = aType === "MCQ" || aType === "TrueFalse";

    return (
        <div className={`glass-card p-5 md:p-6 rounded-3xl border-2 transition-all group ${isSaved
            ? 'border-green-500/30 bg-green-500/5'
            : 'border-dashed border-white/5 hover:border-brand-red/20'
            }`}>
            <div className="flex items-center gap-3 justify-between mb-4 md:mb-6">
                {/* Right Side: Title */}
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center ${isSaved ? 'bg-green-500/10 text-green-500' : 'bg-brand-red/10 text-brand-red'
                        }`}>
                        {isSaved ? <CheckCircle size={22} /> : <Plus size={22} />}
                    </div>
                    <div className="text-right">
                        <h4 className="text-lg font-black text-white">
                            {isSaved ? "تم حفظ السؤال ✓" : "إضافة سؤال جديد"}
                        </h4>
                        <p className="text-gray-500 font-bold text-xs">
                            {isSaved
                                ? "تم إضافة السؤال بنجاح للمجموعة"
                                : "أضف السؤال والاختيارات في خطوة واحدة"
                            }
                        </p>
                    </div>
                </div>

                {/* Left Side: New Question Button (only when saved) */}
                {isSaved && (
                    <Button
                        onClick={handleStartNewQuestion}
                        className="h-10 md:h-12 px-5 rounded-xl text-xs md:text-sm font-black gap-2 bg-brand-red hover:bg-brand-red/90 whitespace-nowrap shrink-0"
                    >
                        <Plus size={18} />
                        <span>إضافة سؤال جديد</span>
                    </Button>
                )}
            </div>

            {/* Show success message if saved */}
            {isSaved && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                    <div className="flex items-center justify-between">
                        <Button
                            onClick={handleStartNewQuestion}
                            variant="outline"
                            className="h-10 px-4 rounded-xl font-bold text-sm border-green-500/30 text-green-500 hover:bg-green-500/10"
                        >
                            <Plus size={18} className="ml-1" />
                            سؤال جديد
                        </Button>
                        <div className="flex items-center gap-3 text-green-500">
                            <div className="text-right">
                                <p className="font-black text-lg">تم حفظ السؤال بنجاح!</p>
                                <p className="text-green-400/70 text-sm font-bold">
                                    السؤال والاختيارات تم إضافتها - راجعها في القائمة أعلاه
                                </p>
                            </div>
                            <CheckCircle size={32} />
                        </div>
                    </div>
                </div>
            )}

            {/* Form - Always Visible */}
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 transition-opacity duration-300 ${isSaved ? 'opacity-80 hover:opacity-100' : 'opacity-100'}`}>
                {/* Right Side: Question Content */}
                <div className="space-y-4 text-right order-1">
                    {qType === "Text" ? (
                        <>
                            <Label className="text-gray-400 font-bold text-lg">نص السؤال</Label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="اكتب نص السؤال هنا..."
                                className="w-full h-[160px] md:h-[180px] bg-[#0d1117] border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-6 text-white text-base md:text-lg font-bold text-right outline-none focus:border-brand-red transition-all resize-none shadow-inner leading-relaxed"
                            />
                        </>
                    ) : (
                        <div
                            onMouseEnter={() => setActiveDropZone('question')}
                            className={`flex flex-col items-center justify-center min-h-[250px] bg-[#0d1117] rounded-2xl md:rounded-3xl border p-6 relative overflow-hidden group transition-all ${activeDropZone === 'question' ? 'border-brand-red/50 shadow-[0_0_15px_-5px_var(--brand-red)]' : 'border-white/5 hover:border-white/10'
                                }`}>
                            {previewUrl ? (
                                <div className="w-full relative z-10 flex flex-col gap-3">
                                    <div className="flex justify-between items-center px-1">
                                        <Label className="text-gray-400 font-bold">معاينة الصورة</Label>
                                        <button
                                            onClick={() => { setFile(null); setQType("Text"); }}
                                            className="text-red-400 hover:text-red-300 text-xs font-bold bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                                        >
                                            <Trash2 size={12} />
                                            حذف
                                        </button>
                                    </div>
                                    <div
                                        className="relative w-full rounded-2xl overflow-hidden border-2 border-dashed border-white/10 bg-black/20 group-hover:border-brand-red/30 transition-all cursor-zoom-in"
                                        onClick={() => onPreviewImage(previewUrl)}
                                    >
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-full h-auto max-h-[400px] object-contain mx-auto transition-transform duration-500 group-hover:scale-[1.02]"
                                        />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                                            <Maximize2 className="text-white drop-shadow-xl" size={40} />
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 pointer-events-none">
                                        <p className="text-white font-bold bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                            اضغط Ctrl+V للصق صورة جديدة 📸
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center space-y-5 py-8 opacity-70 group-hover:opacity-100 transition-opacity">
                                    <div className="w-20 h-20 md:w-24 md:h-24 bg-brand-red/5 rounded-full flex items-center justify-center mx-auto text-brand-red border border-brand-red/10 animate-pulse group-hover:bg-brand-red/10 group-hover:border-brand-red/30 transition-all">
                                        <ImageIcon size={40} />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-white font-black text-xl">اسحب وأفلت الصورة هنا</p>
                                        <p className="text-gray-500 font-bold text-sm">أو اضغط بالأسفل لرفع ملف</p>
                                        <div className="pt-2">
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full border dir-ltr font-mono ${activeDropZone === 'question' ? 'text-brand-red bg-brand-red/10 border-brand-red/20' : 'text-brand-red/60 bg-brand-red/5 border-brand-red/10'
                                                }`}>
                                                {activeDropZone === 'question' ? 'Ready to Paste (Ctrl + V)' : 'Ctrl + V to Paste'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Options Section for MCQ/TrueFalse */}
                    {needsOptions && (
                        <div className="mt-6 p-4 md:p-6 bg-[#0a0d12] rounded-2xl border border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full">
                                    {inlineOptions.length} اختيارات
                                </span>
                                <Label className="text-brand-red font-black text-lg flex items-center gap-2">
                                    <CheckCircle size={20} />
                                    الاختيارات
                                </Label>
                            </div>

                            {/* Existing Options */}
                            <div className="space-y-3 mb-4">
                                {inlineOptions.map((opt, index) => (
                                    <div
                                        key={opt.id}
                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${opt.isCorrect
                                            ? 'bg-green-500/10 border-green-500/30'
                                            : 'bg-white/5 border-white/5 hover:border-white/10'
                                            }`}
                                    >
                                        {/* Delete Button */}
                                        {aType !== "TrueFalse" && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveOption(opt.id)}
                                                className="text-red-400 hover:text-red-500 transition-colors"
                                            >
                                                <X size={18} />
                                            </button>
                                        )}

                                        {/* Correct Toggle */}
                                        <button
                                            type="button"
                                            onClick={() => handleToggleCorrect(opt.id)}
                                            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${opt.isCorrect
                                                ? 'bg-green-500 border-green-500 text-white'
                                                : 'border-gray-600 hover:border-green-500/50'
                                                }`}
                                        >
                                            {opt.isCorrect && <CheckCircle size={16} />}
                                        </button>

                                        {/* Option Content */}
                                        <div className="flex-1">
                                            {aType === "TrueFalse" ? (
                                                <span className={`font-bold text-base md:text-lg ${opt.isCorrect ? 'text-green-400' : 'text-white'}`}>
                                                    {opt.content}
                                                </span>
                                            ) : (
                                                <Input
                                                    value={opt.content}
                                                    onChange={(e) => handleEditOptionContent(opt.id, e.target.value)}
                                                    className="h-10 bg-white/5 border-white/10 text-right text-white font-bold focus:ring-brand-red/50 rounded-lg text-sm"
                                                    placeholder="محتوى الاختيار"
                                                />
                                            )}
                                        </div>

                                        {/* Option Number */}
                                        <span className="text-gray-500 font-bold text-sm w-6 text-center shrink-0">
                                            {index + 1}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Add New Option (MCQ only) */}
                            {aType === "MCQ" && (
                                <div className="flex gap-2 items-center">
                                    <Button
                                        type="button"
                                        onClick={handleAddOption}
                                        className="h-12 px-4 rounded-xl font-bold text-sm shrink-0"
                                    >
                                        <Plus size={18} className="ml-1" />
                                        إضافة
                                    </Button>
                                    <Input
                                        value={newOptionContent}
                                        onChange={(e) => setNewOptionContent(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddOption();
                                            }
                                        }}
                                        placeholder="اكتب الاختيار واضغط Enter أو زر إضافة..."
                                        className="h-12 bg-[#0d1117] border-white/10 rounded-xl text-right flex-1"
                                    />
                                </div>
                            )}

                            {/* Help Text */}
                            <p className="text-gray-500 text-xs mt-3 text-right">
                                {aType === "TrueFalse"
                                    ? "اضغط على الدائرة لتحديد الإجابة الصحيحة"
                                    : "اضغط على الدائرة لتحديد الإجابة/الإجابات الصحيحة"
                                }
                            </p>
                        </div>
                    )}
                </div>

                {/* Left Side: Settings */}
                <div className="space-y-5 order-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 text-right">
                            <Label className="text-gray-400 font-bold">نوع السؤال</Label>
                            <select
                                value={qType}
                                onChange={(e) => setQType(e.target.value)}
                                className="w-full h-12 md:h-14 bg-[#0d1117] border border-white/5 rounded-xl px-4 text-white text-right outline-none focus:border-brand-red transition-all"
                            >
                                <option value="Text">سؤال نصي</option>
                                <option value="Image">سؤال بصورة</option>
                            </select>
                        </div>
                        <div className="space-y-2 text-right">
                            <Label className="text-gray-400 font-bold">نوع الإجابة</Label>
                            <select
                                value={aType}
                                onChange={(e) => setAType(e.target.value)}
                                className="w-full h-12 md:h-14 bg-[#0d1117] border border-white/5 rounded-xl px-4 text-white text-right outline-none focus:border-brand-red transition-all"
                            >
                                <option value="MCQ">اختيار من متعدد</option>
                                <option value="TrueFalse">صح أو خطأ</option>
                                <option value="Essay">سؤال مقالي (نص)</option>
                                <option value="Image">سؤال بصورة (رفع ملف)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 text-right">
                            <Label className="text-gray-400 font-bold">الدرجة</Label>
                            <Input
                                type="number"
                                value={score}
                                onChange={(e) => setScore(Number(e.target.value))}
                                className="h-12 md:h-14 rounded-xl bg-[#0d1117] border-white/5 text-center font-black text-lg"
                            />
                        </div>
                        <div className="space-y-2 text-right">
                            <Label className="text-gray-400 font-bold">تصحيح المساعد</Label>
                            <div
                                onClick={() => setCorrectByAssistant(!correctByAssistant)}
                                className={`h-12 md:h-14 border rounded-xl px-3 md:px-4 flex items-center justify-between cursor-pointer transition-all ${correctByAssistant ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/5'}`}
                            >
                                <div className={`w-10 h-6 rounded-full relative transition-colors ${correctByAssistant ? 'bg-green-500' : 'bg-gray-700'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${correctByAssistant ? 'right-1' : 'right-5'}`} />
                                </div>
                                <span className={`font-bold text-xs md:text-sm ${correctByAssistant ? 'text-green-500' : 'text-gray-500'}`}>
                                    {correctByAssistant ? "مفعّل" : "تلقائي"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {qType === "Image" && (
                        <div className="space-y-2 text-right">
                            <Label className="text-gray-400 font-bold">ارفع صورة السؤال</Label>
                            <label className="flex items-center justify-center w-full h-28 rounded-2xl border-2 border-dashed border-brand-red/20 bg-brand-red/5 hover:bg-brand-red/10 cursor-pointer transition-all">
                                {file ? (
                                    <div className="flex items-center gap-3 text-brand-red font-bold">
                                        <ImageIcon size={20} />
                                        <span className="truncate max-w-[200px]">{file.name}</span>
                                        <X className="hover:text-white" onClick={(e) => { e.preventDefault(); setFile(null); }} />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-brand-red gap-2">
                                        <Upload size={24} />
                                        <span className="text-xs font-bold">اضغط لرفع صورة</span>
                                    </div>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                            </label>
                        </div>
                    )}

                    {/* Correct Answer Image (Optional) */}
                    <div className="space-y-2 text-right">
                        <Label className="text-gray-400 font-bold flex items-center justify-end gap-2">
                            صورة الإجابة الصحيحة
                            <span className="text-xs text-gray-500 font-normal">(اختياري)</span>
                        </Label>
                        <label
                            onMouseEnter={() => setActiveDropZone('answer')}
                            className={`flex flex-col items-center justify-center w-full h-24 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${activeDropZone === 'answer' ? 'border-green-500/60 bg-green-500/10 shadow-[0_0_15px_-5px_#22c55e]' : 'border-green-500/20 bg-green-500/5 hover:bg-green-500/10'
                                }`}>
                            {correctAnswerFile ? (
                                <div className="flex items-center gap-3 text-green-500 font-bold">
                                    <ImageIcon size={18} />
                                    <span className="truncate max-w-[200px]">{correctAnswerFile.name}</span>
                                    <X className="hover:text-white" size={16} onClick={(e) => { e.preventDefault(); setCorrectAnswerFile(null); }} />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-1.5 text-green-500/60">
                                    <div className="flex items-center gap-2">
                                        <Upload size={18} />
                                        <span className="text-xs font-bold">صورة توضح الإجابة</span>
                                    </div>
                                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${activeDropZone === 'answer' ? 'bg-green-500/20 border-green-500/30 text-green-500' : 'bg-green-500/5 border-green-500/10'
                                        }`}>
                                        {activeDropZone === 'answer' ? 'Ready to Paste' : 'Ctrl + V'}
                                    </span>
                                </div>
                            )}
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => setCorrectAnswerFile(e.target.files?.[0] || null)} />
                        </label>
                        {correctAnswerPreviewUrl && (
                            <div
                                className="mt-2 rounded-xl overflow-hidden border border-green-500/20 max-h-24 relative group cursor-zoom-in"
                                onClick={() => onPreviewImage(correctAnswerPreviewUrl)}
                            >
                                <img src={correctAnswerPreviewUrl} alt="Correct Answer Preview" className="w-full h-full object-contain max-h-24 transition-transform group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Maximize2 size={16} className="text-white" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 mt-4">
                        {isSaved ? (
                            <div className="flex gap-2 flex-[1.5]">
                                <Button
                                    onClick={handleStartNewQuestion}
                                    className="flex-1 h-12 md:h-14 rounded-xl text-xs md:text-sm font-black gap-1.5 bg-brand-red/10 text-brand-red border border-brand-red/20 hover:bg-brand-red hover:text-white transition-all whitespace-nowrap"
                                >
                                    <Plus size={16} />
                                    سؤال جديد (نسخ)
                                </Button>
                                <Button
                                    onClick={handleClearForm}
                                    className="h-12 md:h-14 w-12 md:w-14 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5 transition-all shrink-0"
                                    title="سؤال جديد (فارغ)"
                                >
                                    <FilePlus size={20} />
                                </Button>
                            </div>
                        ) : (
                            (content || inlineOptions.length > 0) && (
                                <Button
                                    onClick={handleClearForm}
                                    variant="ghost"
                                    className="h-12 md:h-14 w-12 md:w-14 rounded-xl text-gray-500 hover:text-brand-red hover:bg-brand-red/10 border-0"
                                    title="مسح النموذج"
                                >
                                    <Trash2 size={20} />
                                </Button>
                            ) || null
                        )}

                        <Button
                            onClick={handleSubmit}
                            isLoading={isSubmitting || isLoading}
                            disabled={isSubmitting || isLoading}
                            className={`h-12 md:h-14 rounded-xl text-sm md:text-base font-black gap-2 shadow-lg flex-1 transition-all ${isSaved
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-brand-red hover:bg-brand-red/90'
                                }`}
                        >
                            <Save size={18} />
                            <span>{isSaved ? "حفظ التعديلات" : `حفظ السؤال${needsOptions ? " والاختيارات" : ""}`}</span>
                        </Button>
                    </div>
                </div>
            </div>

        </div >
    );
}
