"use client";

import React, { useState } from "react";
import { ExamScoreResponse, GradedAnswer, StudentAnswerDetail } from "../types/teacher.types";
import { TeacherService } from "../services/teacher.service";
import { ImageEditorModal } from "./ImageEditorModal";
import { Button } from "@/shared/ui/button";
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, Save, ClipboardList, MessageSquare, Award, Image as ImageIcon, FileText, HelpCircle, Edit, Loader2, Upload } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { env } from "@/config/env";

interface GradingInterfaceProps {
    result: ExamScoreResponse;
    onClose: () => void;
    onSave: (gradedAnswers: GradedAnswer[]) => void;
    isLoading?: boolean;
}

export function GradingInterface({ result, onClose, onSave, isLoading }: GradingInterfaceProps) {
    const rawAnswersList = result.studentAnswers || (result as any).StudentAnswers || [];

    // Deduplicate answers for the grading interface similar to the student view
    const answersList = React.useMemo(() => {
        const unique = new Map();
        rawAnswersList.forEach((a: any) => {
            const qId = a.questionId || a.QuestionId;
            // Prefer answer with content if duplicate exists
            if (unique.has(qId)) {
                const existing = unique.get(qId);
                const newDataHasContent = (a.imageAnswerUrl || a.ImageAnswerUrl || a.textAnswer || a.TextAnswer);
                const existingHasContent = (existing.imageAnswerUrl || existing.ImageAnswerUrl || existing.textAnswer || existing.TextAnswer);

                if (newDataHasContent && !existingHasContent) {
                    unique.set(qId, a);
                }
            } else {
                unique.set(qId, a);
            }
        });
        return Array.from(unique.values()).sort((a: any, b: any) => {
            const idA = a.questionId || a.QuestionId;
            const idB = b.questionId || b.QuestionId;
            return idA - idB;
        });
    }, [rawAnswersList]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [grades, setGrades] = useState<Record<number, { points: number, feedback: string, isCorrect: boolean }>>(() => {
        const initial: Record<number, { points: number, feedback: string, isCorrect: boolean }> = {};
        answersList.forEach((a: any) => {
            const answerId = a.studentAnswerId ?? a.StudentAnswerId;
            if (answerId !== undefined) {
                initial[answerId] = {
                    points: a.pointsEarned ?? a.PointsEarned ?? 0,
                    feedback: a.feedback ?? a.Feedback ?? "",
                    isCorrect: (a.isCorrect ?? a.IsCorrect) || ((a.pointsEarned ?? a.PointsEarned) !== null && (a.pointsEarned ?? a.PointsEarned) > 0)
                };
            }
        });
        return initial;
    });

    const handlePointsChange = (answerId: number, points: number, max: number) => {
        const safePoints = Math.min(Math.max(0, points), max);
        setGrades(prev => ({
            ...prev,
            [answerId]: {
                ...prev[answerId],
                points: safePoints,
                isCorrect: safePoints > 0
            }
        }));
    };

    const [updatedImages, setUpdatedImages] = useState<Record<number, string>>({});
    const [uploadingImages, setUploadingImages] = useState<Record<number, boolean>>({});
    const [editingImage, setEditingImage] = useState<{ id: number, url: string } | null>(null);

    const handleImageUpload = async (answerId: number, file: File) => {
        if (!file) return;

        setUploadingImages(prev => ({ ...prev, [answerId]: true }));
        try {
            const response = await TeacherService.updateStudentAnswerImage(answerId, file);
            if (response.succeeded) {
                // Assuming the response might contain the new image URL, 
                // but if not, we can assume it was uploaded successfully and try to construct it or just use an object URL for preview until refresh
                // Ideally backend returns the new URL. If not, we might need to reload.
                // Let's assume we can use URL.createObjectURL temporarily or validation succeeded.

                // If the API returns the updated answer object or URL, use it.
                // For now, let's try to reload or use a local preview if the API doesn't return the URL directly in a usable format immediately without refetch.
                // Actually, let's check one thing: does the user want me to just implement the call? content-wise yes.

                // Let's create a local object URL to show immediate feedback if API doesn't return it
                const newImageUrl = URL.createObjectURL(file);
                setUpdatedImages(prev => ({ ...prev, [answerId]: newImageUrl }));
            } else {
                alert("فشل تحديث الصورة: " + (response.message || "خطأ غير معروف"));
            }
        } catch (error) {
            console.error("Failed to upload image:", error);
            alert("حدث خطأ أثناء رفع الصورة");
        } finally {
            setUploadingImages(prev => ({ ...prev, [answerId]: false }));
        }
    };

    const handleFeedbackChange = (answerId: number, feedback: string) => {
        setGrades(prev => ({
            ...prev,
            [answerId]: {
                ...prev[answerId],
                feedback
            }
        }));
    };

    const handleSave = () => {
        // 1. Get the grades from the visible inputs
        const gradedAnswers: GradedAnswer[] = Object.entries(grades).map(([id, data]) => ({
            studentAnswerId: Number(id),
            pointsEarned: data.points,
            isCorrect: data.isCorrect,
            feedback: data.feedback
        }));

        // 2. Add the hidden duplicates with 0 points to correct any scoring issues
        const hiddenDuplicates = rawAnswersList.filter((a: any) =>
            !gradedAnswers.some(g => g.studentAnswerId === (a.studentAnswerId || a.StudentAnswerId))
        );

        hiddenDuplicates.forEach((dup: any) => {
            const dupId = dup.studentAnswerId || dup.StudentAnswerId;
            if (dupId) {
                gradedAnswers.push({
                    studentAnswerId: dupId,
                    pointsEarned: 0,
                    isCorrect: false,
                    feedback: "Duplicate answer - Auto zeroed"
                });
            }
        });

        onSave(gradedAnswers);
    };

    const totalQuestions = answersList.length;
    const gradedCount = Object.keys(grades).length;
    const totalEarnedPoints = Object.values(grades).reduce((sum, g) => sum + g.points, 0);
    const totalMaxPoints = answersList.reduce((sum: number, a: any) => sum + (a.maxScore || a.MaxScore || 0), 0);

    const currentAnswer = answersList[currentIndex] as any;
    if (!currentAnswer) return null;

    const answerId = currentAnswer.studentAnswerId ?? currentAnswer.StudentAnswerId;
    const grade = answerId !== undefined ? grades[answerId] : null;
    const qType = currentAnswer.questionType ?? currentAnswer.QuestionType;
    const aType = currentAnswer.answerType ?? currentAnswer.AnswerType;
    const maxScore = currentAnswer.maxScore || currentAnswer.MaxScore || 0;
    const questionContent = currentAnswer.questionContent || currentAnswer.QuestionContent || "";
    const options = currentAnswer.questionOptions || currentAnswer.QuestionOptions || [];
    const textAnswer = currentAnswer.textAnswer || currentAnswer.TextAnswer;
    const imageUrl = currentAnswer.imageAnswerUrl || currentAnswer.ImageAnswerUrl;

    // Check if student selected correct option
    const isStudentCorrect = () => {
        const selectedOptions = currentAnswer.selectedOptions || currentAnswer.SelectedOptions || [];
        if (selectedOptions.length === 0) return false;
        return selectedOptions.every((opt: any) => opt.isCorrect === true || opt.IsCorrect === true);
    };

    const getAnswerTypeName = (type: string) => {
        switch (type) {
            case 'MCQ': return 'اختيار من متعدد';
            case 'TrueFalse': return 'صح أو خطأ';
            case 'Essay':
            case 'TextAnswer': return 'إجابة مقالية';
            case 'Image':
            case 'ImageAnswer': return 'إجابة صورة';
            default: return type;
        }
    };

    const getImageUrl = (path: string | null | undefined) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const url = `${env.API.SERVER_URL}${path.startsWith('/') ? '' : '/'}${path}`;
        // console.log("Generated Image URL:", url); // Uncomment for debugging
        return url;
    };

    return (
        <div className="fixed inset-0 z-[160] bg-gradient-to-br from-[#06080a] via-[#0a0d10] to-[#06080a] flex flex-col font-arabic overflow-hidden">
            {/* Header */}
            <div className="h-20 border-b border-white/5 bg-[#0d1117]/80 backdrop-blur-xl flex items-center justify-between px-6 md:px-10 shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={onClose} className="rounded-xl border border-white/10 text-gray-400 gap-2 h-11">
                        <ArrowRight size={18} />
                        إغلاق
                    </Button>
                    <div className="hidden md:block h-8 w-[1px] bg-white/10" />
                    <h2 className="text-lg font-black text-white hidden md:block">تصحيح إجابات الطالب</h2>
                </div>

                <div className="flex items-center gap-3">
                    {/* Progress indicator */}
                    <div className="hidden md:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                        <span className="text-gray-400 text-sm font-bold">المجموع الحالي:</span>
                        <span className="text-white font-black text-lg">{totalEarnedPoints}</span>
                        <span className="text-gray-500 font-bold">/ {totalMaxPoints}</span>
                    </div>

                    <Button
                        onClick={handleSave}
                        disabled={isLoading}
                        isLoading={isLoading}
                        className="h-11 px-6 rounded-xl font-black shadow-lg gap-2 bg-gradient-to-r from-brand-red to-red-600 hover:from-brand-red/90 hover:to-red-600/90 text-white shadow-brand-red/20"
                    >
                        <Save size={18} />
                        حفظ التصحيح
                    </Button>
                </div>
            </div>

            {/* Question Navigation Dots */}
            <div className="flex items-center justify-center gap-2 py-4 bg-[#0d1117]/50 border-b border-white/5">
                {answersList.map((_: any, idx: number) => {
                    const answer = answersList[idx] as any;
                    const aid = answer.studentAnswerId ?? answer.StudentAnswerId;
                    const g = aid !== undefined ? grades[aid] : null;
                    const hasPoints = g && g.points > 0;

                    return (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`relative w-10 h-10 rounded-xl font-black text-sm transition-all duration-300 ${idx === currentIndex
                                ? 'bg-brand-red text-white scale-110 shadow-lg shadow-brand-red/30'
                                : hasPoints
                                    ? 'bg-green-500/20 text-green-500 border border-green-500/30 hover:bg-green-500/30'
                                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                                }`}
                        >
                            {idx + 1}
                            {hasPoints && idx !== currentIndex && (
                                <CheckCircle2 size={12} className="absolute -top-1 -right-1 text-green-500" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">

                    {/* Question Card */}
                    <div className="bg-gradient-to-br from-white/[0.03] to-transparent rounded-[2rem] border border-white/10 overflow-hidden">
                        {/* Question Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className={`px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2 ${aType === 'MCQ' || aType === 'TrueFalse'
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    : (aType === 'Essay' || aType === 'TextAnswer')
                                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                        : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                    }`}>
                                    {aType === 'MCQ' || aType === 'TrueFalse' ? <HelpCircle size={16} /> :
                                        (aType === 'Essay' || aType === 'TextAnswer') ? <FileText size={16} /> : <ImageIcon size={16} />}
                                    {getAnswerTypeName(aType)}
                                </div>
                                <div className="px-4 py-2 rounded-xl text-sm font-black bg-brand-red/10 text-brand-red border border-brand-red/20">
                                    {maxScore} درجة
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-gray-500 font-bold text-sm">السؤال</span>
                                <div className="h-10 w-10 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red font-black">
                                    {currentIndex + 1}
                                </div>
                            </div>
                        </div>

                        {/* Question Content */}
                        <div className="p-8">
                            {qType === "Image" ? (
                                <div className="flex justify-center mb-8">
                                    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl max-w-2xl">
                                        <img
                                            src={getImageUrl(questionContent)}
                                            alt="صورة السؤال"
                                            className="w-full h-auto max-h-[400px] object-contain"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center mb-8">
                                    <p className="text-3xl md:text-4xl font-black text-white leading-relaxed">
                                        {questionContent}
                                    </p>
                                </div>
                            )}

                            {/* Student Answer Section */}
                            <div className="bg-[#0d1117] rounded-2xl border border-white/10 p-6 space-y-6">
                                <div className="flex items-center justify-end gap-2 text-brand-red">
                                    <span className="font-black">إجابة الطالب</span>
                                    <ClipboardList size={20} />
                                </div>

                                {/* MCQ / TrueFalse Options */}
                                {(aType === "MCQ" || aType === "TrueFalse") && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {options.map((opt: any, optIdx: number) => {
                                            const isSelected = opt.isSelected || opt.IsSelected;
                                            const isCorrectOpt = opt.isCorrect || opt.IsCorrect;
                                            const optContent = opt.optionContent || opt.OptionContent;

                                            return (
                                                <div
                                                    key={optIdx}
                                                    className={`relative p-5 rounded-2xl border-2 flex items-center justify-between transition-all ${isSelected
                                                        ? isCorrectOpt
                                                            ? 'border-green-500 bg-green-500/10'
                                                            : 'border-red-500 bg-red-500/10'
                                                        : isCorrectOpt
                                                            ? 'border-green-500/30 bg-green-500/5'
                                                            : 'border-white/10 bg-white/5'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {isCorrectOpt && (
                                                            <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                                                <CheckCircle2 size={18} className="text-green-500" />
                                                            </div>
                                                        )}
                                                        {isSelected && !isCorrectOpt && (
                                                            <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center">
                                                                <XCircle size={18} className="text-red-500" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className={`text-lg font-bold text-right flex-1 ${isSelected
                                                        ? isCorrectOpt ? 'text-green-400' : 'text-red-400'
                                                        : isCorrectOpt ? 'text-green-400/70' : 'text-gray-400'
                                                        }`}>
                                                        {optContent}
                                                    </span>
                                                    {isSelected && (
                                                        <div className={`absolute -top-2 -right-2 px-3 py-1 rounded-lg text-xs font-black ${isCorrectOpt ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                                            }`}>
                                                            إجابة الطالب
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Essay Answer */}
                                {(aType === "Essay" || aType === "TextAnswer") && (
                                    <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                                        <p className="text-white font-bold text-lg leading-relaxed whitespace-pre-wrap text-right">
                                            {textAnswer || <span className="text-gray-500 italic">لم يكتب الطالب إجابة</span>}
                                        </p>
                                    </div>
                                )}

                                {/* Image Answer */}
                                {(aType === "Image" || aType === "ImageAnswer") && (
                                    <div className="flex flex-col items-center gap-4">
                                        {(updatedImages[answerId!] || imageUrl) ? (
                                            <div className="relative group">
                                                <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-xl max-w-lg transition-all">
                                                    <img
                                                        src={updatedImages[answerId!] || getImageUrl(imageUrl)}
                                                        alt="إجابة الطالب"
                                                        className="w-full h-auto"
                                                    />
                                                </div>

                                                {/* Edit Button Overlay */}
                                                <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => {
                                                            if (answerId !== undefined) {
                                                                const img = updatedImages[answerId] || getImageUrl(imageUrl);
                                                                setEditingImage({ id: answerId, url: img });
                                                            }
                                                        }}
                                                        disabled={uploadingImages[answerId!]}
                                                        className="cursor-pointer bg-black/60 hover:bg-brand-red text-white p-3 rounded-xl backdrop-blur-md border border-white/20 flex items-center gap-2 shadow-xl transform hover:scale-105 active:scale-95 transition-all"
                                                    >
                                                        {uploadingImages[answerId!] ? <Loader2 size={18} className="animate-spin" /> : <Edit size={18} />}
                                                        <span className="text-sm font-bold">رسم / تعديل</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 text-gray-500 w-full border-2 border-dashed border-white/10 rounded-3xl bg-white/5 hover:bg-white/[0.07] transition-colors">
                                                <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                                                <p className="font-bold mb-6">لم يرفع الطالب صورة</p>

                                                <label className="cursor-pointer bg-brand-red/10 hover:bg-brand-red text-brand-red hover:text-white border border-brand-red/20 px-6 py-3 rounded-xl flex items-center gap-2 mx-auto w-fit transition-all group">
                                                    {uploadingImages[answerId!] ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} className="group-hover:-translate-y-1 transition-transform" />}
                                                    <span className="font-bold">رفع صورة للإجابة</span>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        disabled={uploadingImages[answerId!]}
                                                        onChange={(e) => {
                                                            if (e.target.files?.[0] && answerId !== undefined) {
                                                                handleImageUpload(answerId, e.target.files[0]);
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Model Answer Section */}
                            {(currentAnswer.correctAnswerPath || currentAnswer.CorrectAnswerPath) && (
                                <div className="mt-8 bg-green-500/5 rounded-2xl border border-green-500/20 p-6 space-y-6">
                                    <div className="flex items-center justify-end gap-2 text-green-500">
                                        <span className="font-black">الإجابة النموذجية</span>
                                        <CheckCircle2 size={20} />
                                    </div>

                                    <div className="flex justify-center">
                                        <div className="rounded-2xl overflow-hidden border border-green-500/20 bg-black/40 shadow-xl max-w-lg">
                                            <img
                                                src={(() => {
                                                    const path: string = currentAnswer.correctAnswerPath || currentAnswer.CorrectAnswerPath;
                                                    if (!path) return '';
                                                    if (path.startsWith('http')) return path;
                                                    return `${env.API.SERVER_URL}${path.startsWith('/') ? '' : '/'}${path}`;
                                                })()}
                                                alt="الإجابة النموذجية"
                                                className="w-full h-auto"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Grading Card */}
                    <div className="bg-gradient-to-br from-brand-red/5 to-transparent rounded-[2rem] border border-brand-red/20 p-8 space-y-6">
                        <div className="flex items-center justify-end gap-3">
                            <h3 className="text-xl font-black text-white">التصحيح والتقييم</h3>
                            <Award size={24} className="text-brand-red" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Points Input */}
                            <div className="bg-black/40 rounded-2xl border border-white/10 p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {grade && grade.points > 0 ? (
                                            <CheckCircle2 size={20} className="text-green-500" />
                                        ) : (
                                            <XCircle size={20} className="text-red-500" />
                                        )}
                                        <span className={`font-black ${grade && grade.points > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {grade && grade.points > 0 ? 'إجابة صحيحة' : 'إجابة خاطئة'}
                                        </span>
                                    </div>
                                    <span className="text-gray-400 font-bold text-sm">الدرجة المستحقة</span>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className="text-2xl font-black text-gray-500">/ {maxScore}</span>
                                    <input
                                        type="number"
                                        min={0}
                                        max={maxScore}
                                        value={grade?.points ?? 0}
                                        onChange={(e) => answerId !== undefined && handlePointsChange(answerId, Number(e.target.value), maxScore)}
                                        className="flex-1 h-16 bg-white/5 border-2 border-brand-red/30 rounded-2xl text-center font-black text-3xl text-brand-red outline-none focus:border-brand-red transition-all"
                                    />
                                </div>

                                {/* Quick Points Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => answerId !== undefined && handlePointsChange(answerId, 0, maxScore)}
                                        className="flex-1 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-black text-sm hover:bg-red-500/20 transition-all"
                                    >
                                        صفر
                                    </button>
                                    <button
                                        onClick={() => answerId !== undefined && handlePointsChange(answerId, Math.floor(maxScore / 2), maxScore)}
                                        className="flex-1 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-black text-sm hover:bg-yellow-500/20 transition-all"
                                    >
                                        نصف
                                    </button>
                                    <button
                                        onClick={() => answerId !== undefined && handlePointsChange(answerId, maxScore, maxScore)}
                                        className="flex-1 h-10 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 font-black text-sm hover:bg-green-500/20 transition-all"
                                    >
                                        كاملة
                                    </button>
                                </div>
                            </div>

                            {/* Feedback Input */}
                            <div className="bg-black/40 rounded-2xl border border-white/10 p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <MessageSquare size={20} className="text-gray-500" />
                                    <span className="text-gray-400 font-bold text-sm">ملاحظات للطالب</span>
                                </div>
                                <textarea
                                    placeholder="أضف ملاحظاتك هنا... (اختياري)"
                                    value={grade?.feedback ?? ""}
                                    onChange={(e) => answerId !== undefined && handleFeedbackChange(answerId, e.target.value)}
                                    className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-right outline-none focus:border-brand-red/50 transition-all font-bold resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                        <Button
                            variant="outline"
                            disabled={currentIndex === 0}
                            onClick={() => setCurrentIndex(prev => prev - 1)}
                            className="h-14 px-8 rounded-2xl border-white/10 text-gray-400 hover:bg-white/5 font-black gap-2"
                        >
                            السؤال السابق
                            <ArrowRight size={20} />
                        </Button>

                        <div className="text-center">
                            <p className="text-gray-500 font-bold text-sm">{currentIndex + 1} من {totalQuestions}</p>
                        </div>

                        {currentIndex < totalQuestions - 1 ? (
                            <Button
                                onClick={() => setCurrentIndex(prev => prev + 1)}
                                className="h-14 px-8 rounded-2xl font-black gap-2 bg-gradient-to-r from-brand-red to-red-600"
                            >
                                <ArrowRight size={20} className="rotate-180" />
                                السؤال التالي
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSave}
                                disabled={isLoading}
                                isLoading={isLoading}
                                className="h-14 px-8 rounded-2xl font-black gap-2 bg-gradient-to-r from-green-600 to-green-500"
                            >
                                <Save size={20} />
                                حفظ التصحيح النهائي
                            </Button>
                        )}
                    </div>
                </div>

                {/* Image Editor Modal */}
                {editingImage && (
                    <ImageEditorModal
                        isOpen={!!editingImage}
                        imageUrl={editingImage.url}
                        onClose={() => setEditingImage(null)}
                        onSave={async (file) => {
                            if (editingImage) {
                                await handleImageUpload(editingImage.id, file);
                            }
                            setEditingImage(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
}
