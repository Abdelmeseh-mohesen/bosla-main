"use client";

import React, { useState, useEffect } from "react";
import { Lecture, Material } from "../types/teacher.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TeacherService } from "../services/teacher.service";
import { ChevronDown, Video, FileText, Plus, Eye, EyeOff, Trash2, Upload, Edit, ClipboardList, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/utils/cn";
import { useTeacherAuth } from "../hooks/use-teacher-auth";

interface LectureListProps {
    courseId: number;
    onAddMaterial: (lectureId: number) => void;
    onEditMaterial: (material: Material) => void;
    onViewMaterial: (material: Material) => void;
    onManageExam: (lectureId: number, lectureName: string) => void;
    onEditLecture?: (lecture: Lecture) => void;
}

// Toast notification state
interface ToastState {
    show: boolean;
    message: string;
    type: 'success' | 'error';
}

export function LectureList({ courseId, onAddMaterial, onViewMaterial, onEditMaterial, onManageExam, onEditLecture }: LectureListProps) {
    const { isAssistant } = useTeacherAuth();
    const queryClient = useQueryClient();
    const { data: lecturesResponse, isLoading } = useQuery({
        queryKey: ["lectures", courseId],
        queryFn: () => TeacherService.getLectures(courseId),
    });

    // Local state for visibility (since API doesn't return it)
    const [localVisibility, setLocalVisibility] = useState<Record<number, boolean>>({});
    const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

    // Load saved visibility from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(`lecture_visibility_${courseId}`);
        if (saved) {
            try {
                setLocalVisibility(JSON.parse(saved));
            } catch (e) {
                console.error("Error parsing saved visibility:", e);
            }
        }
    }, [courseId]);

    // Save visibility to localStorage when it changes
    useEffect(() => {
        if (Object.keys(localVisibility).length > 0) {
            localStorage.setItem(`lecture_visibility_${courseId}`, JSON.stringify(localVisibility));
        }
    }, [localVisibility, courseId]);

    // Show toast notification
    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const deleteMutation = useMutation({
        mutationFn: TeacherService.deleteLecture,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lectures", courseId] });
        }
    });

    const visibilityMutation = useMutation({
        mutationFn: TeacherService.updateLectureVisibility,
        onMutate: async (variables) => {
            // Optimistic update: update local state immediately
            setLocalVisibility(prev => ({
                ...prev,
                [variables.lectureId]: variables.isVisible
            }));
        },
        onSuccess: (_, variables) => {
            showToast(
                variables.isVisible ? "✅ تم إظهار المحاضرة للطلاب" : "✅ تم إخفاء المحاضرة عن الطلاب",
                'success'
            );
        },
        onError: (error: any, variables) => {
            // Revert optimistic update on error
            setLocalVisibility(prev => ({
                ...prev,
                [variables.lectureId]: !variables.isVisible
            }));

            const errorMessage = error?.response?.data?.message || error?.message || "حدث خطأ غير متوقع";
            const statusCode = error?.response?.status;

            if (statusCode === 401) {
                showToast("غير مصرح لك بهذا الإجراء. يرجى تسجيل الدخول مرة أخرى.", 'error');
            } else {
                showToast(`فشل في تحديث حالة ظهور المحاضرة: ${errorMessage}`, 'error');
            }
        }
    });

    const lectures = Array.isArray(lecturesResponse?.data) ? lecturesResponse.data : [];
    const [openLectures, setOpenLectures] = useState<number[]>([]);

    const toggleLecture = (id: number) => {
        setOpenLectures(prev =>
            prev.includes(id) ? prev.filter(lId => lId !== id) : [...prev, id]
        );
    };

    // Get the actual visibility state (from local state or default to true)
    const getLectureVisibility = (lectureId: number): boolean => {
        if (localVisibility[lectureId] !== undefined) {
            return localVisibility[lectureId];
        }
        return true; // Default to visible
    };

    const handleDelete = (id: number) => {
        if (confirm("هل أنت متأكد من حذف هذه المحاضرة وجميع محتوياتها؟")) {
            deleteMutation.mutate(id);
        }
    };

    const handleToggleVisibility = (lecture: Lecture) => {
        // Check token first
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        if (!token) {
            showToast("جلستك انتهت، يرجى تسجيل الدخول مرة أخرى", 'error');
            window.location.href = "/auth";
            return;
        }

        const currentVisibility = getLectureVisibility(lecture.id);
        const newVisibility = !currentVisibility;

        // No confirmation needed - just toggle immediately
        visibilityMutation.mutate({
            lectureId: lecture.id,
            isVisible: newVisibility
        });
    };

    if (isLoading) return <div className="space-y-4 animate-pulse">
        {[1, 2].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl" />)}
    </div>;

    return (
        <div className="space-y-6">
            {/* Toast Notification */}
            {toast.show && (
                <div className={cn(
                    "fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300",
                    toast.type === 'success'
                        ? "bg-green-500/90 text-white"
                        : "bg-red-500/90 text-white"
                )}>
                    {toast.type === 'success' ? <CheckCircle size={24} /> : <XCircle size={24} />}
                    <span className="font-bold">{toast.message}</span>
                </div>
            )}

            {lectures.map((lecture) => {
                const isVisible = getLectureVisibility(lecture.id);

                return (
                    <div key={lecture.id} className="glass-card rounded-[2rem] overflow-hidden border-[#22272e] transition-all duration-300">
                        {/* Lecture Header */}
                        <div
                            onClick={() => toggleLecture(lecture.id)}
                            className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "p-2 rounded-full transition-transform duration-300",
                                    openLectures.includes(lecture.id) ? "rotate-180 text-brand-red bg-brand-red/10" : "text-gray-500 bg-white/5"
                                )}>
                                    <ChevronDown size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white text-right">{lecture.title}</h3>
                                {/* Visibility Badge */}
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold transition-all duration-300",
                                    isVisible
                                        ? "bg-green-500/10 text-green-500"
                                        : "bg-yellow-500/10 text-yellow-500"
                                )}>
                                    {isVisible ? "ظاهرة للطلاب" : "مخفية"}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Visibility Toggle Button - Hidden for Assistants */}
                                {!isAssistant && (
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            "h-10 w-10 p-0 rounded-xl transition-all duration-300",
                                            isVisible
                                                ? "text-green-500 hover:text-yellow-500 hover:bg-yellow-500/10"
                                                : "text-yellow-500 hover:text-green-500 hover:bg-green-500/10"
                                        )}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleVisibility(lecture);
                                        }}
                                        disabled={visibilityMutation.isPending}
                                        title={isVisible ? "إخفاء المحاضرة" : "إظهار المحاضرة"}
                                    >
                                        {isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                                    </Button>
                                )}
                                {/* Edit Lecture Button - Hidden for Assistants */}
                                {!isAssistant && onEditLecture && (
                                    <Button
                                        variant="ghost"
                                        className="h-10 w-10 p-0 rounded-xl text-blue-400 hover:text-blue-500 hover:bg-blue-500/10"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEditLecture(lecture);
                                        }}
                                        title="تعديل المحاضرة"
                                    >
                                        <Edit size={20} />
                                    </Button>
                                )}
                                {/* Delete Lecture Button - Hidden for Assistants */}
                                {!isAssistant && (
                                    <Button
                                        variant="ghost"
                                        className="h-10 w-10 p-0 rounded-xl text-gray-400 hover:text-brand-red hover:bg-brand-red/10"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(lecture.id);
                                        }}
                                    >
                                        <Trash2 size={20} />
                                    </Button>
                                )}
                                {/* Exam Button - Shown for both Teachers and Assistants */}
                                <Button
                                    variant="outline"
                                    className="rounded-xl border-white/10 h-10 px-4 font-bold gap-2 hover:bg-brand-red/10 border-brand-red/20 text-brand-red"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onManageExam(lecture.id, lecture.title);
                                    }}
                                >
                                    <ClipboardList size={18} />
                                    الامتحان
                                </Button>
                                {/* Add Material Button - Hidden for Assistants */}
                                {!isAssistant && (
                                    <Button
                                        variant="outline"
                                        className="rounded-xl border-white/10 h-10 px-4 font-bold gap-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAddMaterial(lecture.id);
                                        }}
                                    >
                                        <Plus size={18} />
                                        إضافة مادة
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Materials List */}
                        {openLectures.includes(lecture.id) && (
                            <div className="px-6 pb-6 pt-2 border-t border-white/5 bg-[#0d1117]/30 animate-in slide-in-from-top-2 duration-300">
                                <MaterialList
                                    lectureId={lecture.id}
                                    onViewMaterial={onViewMaterial}
                                    onEditMaterial={onEditMaterial}
                                    isAssistant={isAssistant}
                                />
                            </div>
                        )}
                    </div>
                )
            })}

            {lectures.length === 0 && (
                <div className="text-center py-12 text-gray-500 font-bold border-2 border-dashed border-white/5 rounded-[2rem]">
                    لا يوجد محاضرات مضافة لهذا الكورس بعد
                </div>
            )}
        </div>
    );
}

function MaterialList({ lectureId, onViewMaterial, onEditMaterial, isAssistant }: {
    lectureId: number,
    onViewMaterial: (m: Material) => void,
    onEditMaterial: (m: Material) => void,
    isAssistant?: boolean
}) {
    const queryClient = useQueryClient();
    const { data: materialsResponse, isLoading } = useQuery({
        queryKey: ["materials", lectureId],
        queryFn: () => TeacherService.getMaterials(lectureId),
    });

    const deleteMutation = useMutation({
        mutationFn: TeacherService.deleteMaterial,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["materials", lectureId] });
        }
    });

    const materials = Array.isArray(materialsResponse?.data) ? materialsResponse.data : [];

    const handleDelete = (id: number) => {
        if (confirm("هل أنت متأكد من حذف هذا المحتوى؟")) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) return <div className="space-y-3 pt-4">
        {[1, 2].map(i => <div key={i} className="h-12 bg-white/5 rounded-xl" />)}
    </div>;

    return (
        <div className="space-y-4 pt-4">
            {materials.map((material) => (
                <div
                    key={material.id}
                    className="flex flex-col md:flex-row items-center justify-between p-5 bg-[#0d1117]/50 rounded-[1.5rem] border border-white/5 hover:border-brand-red/30 transition-all group gap-4"
                >
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Button
                            variant="ghost"
                            onClick={() => onViewMaterial(material)}
                            className="p-3 bg-white/5 hover:bg-brand-red/10 hover:text-brand-red text-gray-400 rounded-xl"
                        >
                            <Eye size={20} />
                        </Button>
                        {/* Edit Material - Hidden for Assistants */}
                        {!isAssistant && (
                            <Button
                                variant="ghost"
                                onClick={() => onEditMaterial(material)}
                                className="p-3 bg-white/5 hover:bg-blue-500/10 hover:text-blue-500 text-gray-400 rounded-xl"
                            >
                                <Edit size={20} />
                            </Button>
                        )}
                        {/* Delete Material - Hidden for Assistants */}
                        {!isAssistant && (
                            <Button
                                variant="ghost"
                                onClick={() => handleDelete(material.id)}
                                className="p-3 bg-white/5 hover:bg-red-500/10 hover:text-red-500 text-gray-400 rounded-xl"
                            >
                                <Trash2 size={20} />
                            </Button>
                        )}

                        <div className={cn(
                            "px-4 py-2 rounded-xl text-xs font-black mr-2",
                            (material.isFree === true || String(material.isFree).toLowerCase() === "true")
                                ? "bg-green-500/10 text-green-500"
                                : "bg-brand-red/10 text-brand-red"
                        )}>
                            {(material.isFree === true || String(material.isFree).toLowerCase() === "true") ? "مجاني" : "مدفوع"}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-right w-full md:w-auto justify-end">
                        <div className="text-right">
                            <p className="text-white font-bold text-lg">{material.title}</p>
                            <p className="text-xs text-gray-500 font-medium">
                                {material.type === "video" ? "فيديو تعليمي" : material.type === "pdf" ? "ملف PDF" : "واجب منزلي"}
                            </p>
                        </div>
                        <div className={cn(
                            "p-4 rounded-2xl",
                            material.type === "video" ? "bg-brand-red/10 text-brand-red" : material.type === "pdf" ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"
                        )}>
                            {material.type === "video" ? <Video size={28} /> : material.type === "pdf" ? <FileText size={28} /> : <Upload size={28} />}
                        </div>
                    </div>
                </div>
            ))}

            {materials.length === 0 && (
                <p className="text-center text-gray-600 font-medium text-sm py-4">لا توجد مواد تعليمية لهذه المحاضرة</p>
            )}
        </div>
    );
}
