"use client";

import React, { useState, useEffect } from "react";
import { ExamScoreResponse, Exam } from "../types/student.types";
import { Button } from "@/shared/ui/button";
import { CheckCircle2, XCircle, Trophy, HelpCircle, AlertCircle, ArrowRight, Clock, Loader2 } from "lucide-react";
import { env } from "@/config/env";
import { StudentService } from "../services/student.service";

interface ExamResultReviewProps {
    result: ExamScoreResponse;
    onClose: () => void;
    lectureId?: number; // إضافة lectureId لجلب بيانات الامتحان
}

export function ExamResultReview({ result, onClose, lectureId }: ExamResultReviewProps) {
    // جلب بيانات الامتحان الأصلية للحصول على correctAnswerImageUrl
    const [originalExam, setOriginalExam] = useState<Exam | null>(null);

    useEffect(() => {
        const fetchExamData = async () => {
            if (lectureId) {
                try {
                    console.log("🔍 Fetching exam data for lectureId:", lectureId);
                    const exam = await StudentService.getExamByLecture(lectureId);
                    if (exam) {
                        console.log("✅ Original Exam Data:", exam);
                        console.log("📋 Questions with correctAnswerImageUrl:");
                        exam.questions.forEach((q: any) => {
                            if (q.correctAnswerImageUrl) {
                                console.log(`  Q${q.id}: ${q.correctAnswerImageUrl}`);
                            }
                        });
                        setOriginalExam(exam);
                    }
                } catch (error) {
                    console.error("❌ Failed to load original exam data:", error);
                }
            }
        };
        fetchExamData();
    }, [lectureId]);

    // Helper function to get correctAnswerImageUrl from original exam
    const getCorrectAnswerImageUrl = (questionId: number): string | null => {
        if (!originalExam) {
            console.log(`⚠️ No original exam data for Q${questionId}`);
            return null;
        }
        const question = originalExam.questions.find(q => q.id === questionId);
        const url = (question as any)?.correctAnswerImageUrl || null;
        console.log(`🔎 Q${questionId} correctAnswerImageUrl:`, url || "NOT FOUND");
        return url;
    };

    // Handle both PascalCase and camelCase from API
    // Handle both PascalCase and camelCase from API
    const rawAnswers = (result as any).studentAnswers || (result as any).StudentAnswers || [];

    // Deduplicate answers based on QuestionId (handling potential backend duplication)
    const studentAnswers = React.useMemo(() => {
        const unique = new Map();
        rawAnswers.forEach((ans: any) => {
            const qId = ans.questionId || ans.QuestionId;
            // If duplicate exists, prefer the one with data (image/text)
            if (unique.has(qId)) {
                const existing = unique.get(qId);
                const newDataHasContent = (ans.imageAnswerUrl || ans.ImageAnswerUrl || ans.textAnswer || ans.TextAnswer);
                const existingHasContent = (existing.imageAnswerUrl || existing.ImageAnswerUrl || existing.textAnswer || existing.TextAnswer);

                if (newDataHasContent && !existingHasContent) {
                    unique.set(qId, ans);
                }
            } else {
                unique.set(qId, ans);
            }
        });
        return Array.from(unique.values()).sort((a: any, b: any) => {
            // Optional: Ensure they stay sorted by original appearance or Question ID
            const idA = a.questionId || a.QuestionId;
            const idB = b.questionId || b.QuestionId;
            return idA - idB;
        });
    }, [rawAnswers]);

    const examTitle = (result as any).examTitle || (result as any).ExamTitle || "الامتحان";

    // نتيجة الطالب من totalScore
    const studentPoints = (result as any).totalScore ?? (result as any).TotalScore ?? 0;

    // حساب مجموع درجات الامتحان من maxScore لكل سؤال
    const maxPossiblePoints = studentAnswers.reduce((acc: number, curr: any) =>
        acc + (curr.maxScore || curr.MaxScore || 0), 0
    );

    // حساب الأسئلة اللي في انتظار التصحيح (correctByAssistant = true)
    // إذا تم تصحيح الامتحان بالكامل (isGraded)، فلا يوجد أسئلة معلقة
    const pendingGradingQuestions = result.isGraded ? [] : studentAnswers.filter((a: any) =>
        a.correctByAssistant === true || a.CorrectByAssistant === true
    );
    const pendingCount = pendingGradingQuestions.length;

    // حساب الدرجات اللي في انتظار التصحيح
    const pendingPoints = pendingGradingQuestions.reduce((acc: number, curr: any) =>
        acc + (curr.maxScore || curr.MaxScore || 0), 0
    );

    // حساب الأسئلة المصححة فعلياً
    // إذا تم التصحيح الكامل، كل الأسئلة تعتبر مصححة
    const gradedAnswers = result.isGraded
        ? studentAnswers
        : studentAnswers.filter((a: any) => !(a.correctByAssistant === true || a.CorrectByAssistant === true));

    /**
     * دالة لحساب إذا كانت الإجابة صحيحة
     * المنطق: نشوف selectedOptions - لو كل الخيارات المختارة isCorrect: true يبقى صحيح
     * للأسئلة المقالية أو الصور: نعتمد على isCorrect أو pointsEarned من الـ API
     */
    const isAnswerCorrect = (answer: any): boolean => {
        const selectedOptions = answer.selectedOptions || answer.SelectedOptions || [];
        const answerType = answer.answerType || answer.AnswerType || "";

        // إذا تم التصحيح، نستخدم isCorrect من الـ API مباشرة لكل الأنواع
        if (result.isGraded) {
            // أحياناً يكون pointsEarned موجود و isCorrect خطأ في الباك إند للأسئلة المقالية
            // لكن للمقالي نعتمد على pointsEarned > 0 أو isCorrect
            const points = answer.pointsEarned ?? answer.PointsEarned;
            if (points !== null) return points > 0;
            return answer.isCorrect === true || answer.IsCorrect === true;
        }

        // للأسئلة MCQ و TrueFalse: نحسب من selectedOptions إذا لم يكن مصححاً بعد
        if (answerType === "MCQ" || answerType === "TrueFalse") {
            if (selectedOptions.length === 0) return false;

            // نشوف لو كل الخيارات المختارة صحيحة
            return selectedOptions.every((opt: any) =>
                opt.isCorrect === true || opt.IsCorrect === true
            );
        }

        // للأسئلة المقالية والصور: نعتمد على الـ API
        const pointsEarned = answer.pointsEarned ?? answer.PointsEarned;
        if (pointsEarned !== null && pointsEarned > 0) return true;

        return answer.isCorrect === true || answer.IsCorrect === true;
    };

    // حساب عدد الإجابات الصحيحة
    const correctCount = gradedAnswers.filter((a: any) => isAnswerCorrect(a)).length;

    const wrongCount = gradedAnswers.length - correctCount;
    const totalCount = studentAnswers.length;

    // حساب النسبة المئوية
    const gradedMaxPoints = maxPossiblePoints - pendingPoints;
    const scorePercentage = gradedMaxPoints > 0 ? (studentPoints / gradedMaxPoints) * 100 : 0;

    // تحديد لون النتيجة
    const getScoreColor = () => {
        if (pendingCount > 0) return 'text-yellow-500';
        if (scorePercentage >= 80) return 'text-green-500';
        if (scorePercentage >= 50) return 'text-brand-red';
        return 'text-red-500';
    };

    const getResultMessage = () => {
        if (pendingCount > 0) {
            return `${pendingCount} سؤال في انتظار التصحيح من المدرس`;
        }
        if (scorePercentage >= 80) return "ممتاز! أداء رائع";
        if (scorePercentage >= 50) return "جيد! استمر في التحسن";
        return "حاول مرة أخرى لتحسين مستواك";
    };

    return (
        <div className="fixed inset-0 z-[150] bg-[#06080a] flex flex-col font-arabic overflow-hidden animate-in fade-in duration-500">
            {/* Header */}
            <div className="h-24 border-b border-white/5 bg-[#0d1117] flex items-center justify-between px-10 shrink-0">
                <div className="flex items-center gap-6">
                    <Button variant="ghost" onClick={onClose} className="rounded-xl border border-white/10 text-gray-400 gap-2">
                        <ArrowRight size={20} />
                        العودة للرئيسية
                    </Button>
                    <div className="text-right">
                        <h2 className="text-xl font-black text-white">{examTitle}</h2>
                        <p className="text-sm font-bold text-gray-500">مراجعة نتيجة الامتحان</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <div className="text-sm font-bold text-gray-500">تاريخ التسليم</div>
                        <div className="text-white font-black">{new Date(result.submittedAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                </div>
            </div>

            {/* Results Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12 lg:px-48 space-y-12">
                {/* Summary Card */}
                <div className="relative overflow-hidden glass-card rounded-[3.5rem] border border-white/10 p-12 text-center space-y-8">
                    <div className="absolute top-0 right-0 h-64 w-64 bg-brand-red/10 blur-[100px] -mr-32 -mt-32" />

                    <div className="relative flex flex-col items-center gap-4">
                        {pendingCount > 0 ? (
                            <div className="h-24 w-24 rounded-full flex items-center justify-center bg-yellow-500/20 text-yellow-500">
                                <Clock size={48} className="animate-pulse" />
                            </div>
                        ) : scorePercentage >= 50 ? (
                            <div className="h-24 w-24 rounded-full flex items-center justify-center bg-green-500/20 text-green-500">
                                <Trophy size={48} />
                            </div>
                        ) : (
                            <div className="h-24 w-24 rounded-full flex items-center justify-center bg-red-500/20 text-red-500">
                                <AlertCircle size={48} />
                            </div>
                        )}
                        <h3 className={`text-3xl font-black ${getScoreColor()}`}>
                            {getResultMessage()}
                        </h3>
                    </div>

                    {/* Main Score Display */}
                    <div className="flex items-center justify-center gap-4">
                        <div className="text-center">
                            <p className="text-lg font-bold text-gray-500 mb-2">درجتك</p>
                            <p className={`text-7xl font-black ${getScoreColor()}`}>
                                {studentPoints}
                                <span className="text-3xl text-gray-500 font-bold"> / {maxPossiblePoints}</span>
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className={`grid ${pendingCount > 0 ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-2 md:grid-cols-4'} gap-4 relative`}>
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                            <p className="text-sm font-bold text-gray-500 mb-1">نتيجتك الحالية</p>
                            <p className={`text-3xl font-black ${getScoreColor()}`}>{studentPoints}</p>
                        </div>
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                            <p className="text-sm font-bold text-gray-500 mb-1">درجة الامتحان</p>
                            <p className="text-3xl font-black text-white">{maxPossiblePoints}</p>
                        </div>
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                            <p className="text-sm font-bold text-gray-500 mb-1">الإجابات الصحيحة</p>
                            <p className="text-3xl font-black text-green-500">{correctCount}</p>
                        </div>
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                            <p className="text-sm font-bold text-gray-500 mb-1">الإجابات الخاطئة</p>
                            <p className="text-3xl font-black text-red-500">{wrongCount}</p>
                        </div>
                        {pendingCount > 0 && (
                            <div className="bg-yellow-500/10 p-6 rounded-3xl border border-yellow-500/30">
                                <p className="text-sm font-bold text-yellow-500 mb-1">في انتظار التصحيح</p>
                                <p className="text-3xl font-black text-yellow-500">{pendingCount}</p>
                                <p className="text-xs font-bold text-yellow-500/70 mt-1">({pendingPoints} درجة)</p>
                            </div>
                        )}
                    </div>

                    {/* Pending Notice */}
                    {pendingCount > 0 && (
                        <div className={`${result.isGraded ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'} border rounded-2xl p-6 flex items-center gap-4`}>
                            {result.isGraded ? (
                                <CheckCircle2 className="text-green-500" size={32} />
                            ) : (
                                <Loader2 className="text-yellow-500 animate-spin" size={32} />
                            )}
                            <div className="text-right flex-1">
                                <p className={`${result.isGraded ? 'text-green-500' : 'text-yellow-500'} font-black text-lg`}>
                                    {result.isGraded ? 'تم التصحيح الكامل' : 'بعض الأسئلة لم تُصحح بعد'}
                                </p>
                                <p className={`${result.isGraded ? 'text-green-500/70' : 'text-yellow-500/70'} font-bold text-sm`}>
                                    {result.isGraded
                                        ? `تم تصحيح جميع الأسئلة (${pendingCount} سؤال مقالي - ${pendingPoints} درجة). راجع التفاصيل أدناه.`
                                        : `هناك ${pendingCount} سؤال (${pendingPoints} درجة) في انتظار التصحيح اليدوي من المدرس. سيتم تحديث درجتك بعد التصحيح.`}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Questions Review */}
                <div className="space-y-8 pb-20">
                    <h4 className="text-2xl font-black text-white text-right">تفاصيل الإجابات ({totalCount} سؤال)</h4>

                    <div className="space-y-6">
                        {studentAnswers.map((answer: any, idx: number) => {
                            const isPendingGrading = !result.isGraded && (answer.correctByAssistant === true || answer.CorrectByAssistant === true);
                            const isCorrect = !isPendingGrading && isAnswerCorrect(answer);
                            const questionContent = answer.questionContent || answer.QuestionContent || "";
                            const options = answer.questionOptions || answer.QuestionOptions || [];
                            const questionType = answer.questionType || answer.QuestionType || "";
                            const answerType = answer.answerType || answer.AnswerType || "";
                            const textAnswer = answer.textAnswer || answer.TextAnswer;
                            const maxScore = answer.maxScore || answer.MaxScore || 0;
                            const pointsEarned = answer.pointsEarned ?? answer.PointsEarned ?? null;

                            // تحديد لون البطاقة
                            const getBorderColor = () => {
                                if (isPendingGrading) return 'border-yellow-500/30 bg-yellow-500/5';
                                if (isCorrect) return 'border-green-500/20';
                                return 'border-red-500/20';
                            };

                            // تحديد لون الأيقونة
                            const getIconColor = () => {
                                if (isPendingGrading) return 'bg-yellow-500/20 text-yellow-500';
                                if (isCorrect) return 'bg-green-500/20 text-green-500';
                                return 'bg-red-500/20 text-red-500';
                            };

                            return (
                                <div key={`answer-view-${idx}-${answer.questionId || ''}`} className={`glass-card p-8 rounded-[2.5rem] border ${getBorderColor()} space-y-6`}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className={`h-12 w-12 shrink-0 rounded-xl flex items-center justify-center font-black ${getIconColor()}`}>
                                            {isPendingGrading ? (
                                                <Clock size={24} />
                                            ) : isCorrect ? (
                                                <CheckCircle2 size={24} />
                                            ) : (
                                                <XCircle size={24} />
                                            )}
                                        </div>

                                        {/* Question Score Badge */}
                                        <div className="flex items-center gap-2">
                                            {isPendingGrading ? (
                                                <div className="bg-yellow-500/20 text-yellow-500 px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2">
                                                    <Loader2 size={16} className="animate-spin" />
                                                    {result.isGraded ? 'تم التصحيح' : 'في انتظار التصحيح'}
                                                </div>
                                            ) : (
                                                <div className={`px-4 py-2 rounded-xl text-sm font-black ${isCorrect ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                                    {pointsEarned !== null ? pointsEarned : 0} / {maxScore}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 text-right">
                                        {/* Question Number */}
                                        <div className="flex items-center justify-end gap-3 mb-4">
                                            <span className="text-gray-500 font-bold text-sm">السؤال {idx + 1}</span>
                                            <span className="text-gray-600 font-bold text-xs bg-white/5 px-3 py-1 rounded-lg">
                                                {answerType === 'MCQ' ? 'اختيار من متعدد' :
                                                    answerType === 'TrueFalse' ? 'صح أو خطأ' :
                                                        answerType === 'Essay' ? 'مقالي' :
                                                            answerType === 'Image' ? 'إجابة صورة' : answerType}
                                            </span>
                                        </div>

                                        {/* Question Content - Text or Image */}
                                        {questionType === "Image" ? (
                                            <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-white/5 p-4 flex justify-center mb-6">
                                                <img src={questionContent} alt="صورة السؤال" className="max-h-[250px] object-contain rounded-xl" />
                                            </div>
                                        ) : (
                                            <p className="text-xl font-black text-white mb-6">{questionContent}</p>
                                        )}

                                        {/* Options Review */}
                                        {options.length > 0 && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {options.map((opt: any, optIdx: number) => {
                                                    const optIsCorrect = opt.isCorrect === true || opt.IsCorrect === true;
                                                    const optIsSelected = opt.isSelected === true || opt.IsSelected === true;
                                                    const optContent = opt.optionContent || opt.OptionContent || "";

                                                    return (
                                                        <div
                                                            key={`opt-view-${optIdx}-${opt.optionId || ''}`}
                                                            className={`p-5 rounded-2xl border-2 flex items-center justify-between text-right transition-all ${isPendingGrading
                                                                ? optIsSelected
                                                                    ? 'border-yellow-500 bg-yellow-500/10'
                                                                    : 'border-white/5 bg-white/5'
                                                                : optIsCorrect
                                                                    ? 'border-green-500 bg-green-500/10'
                                                                    : optIsSelected
                                                                        ? 'border-red-500 bg-red-500/10'
                                                                        : 'border-white/5 bg-white/5'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {!isPendingGrading && optIsCorrect && <CheckCircle2 size={20} className="text-green-500" />}
                                                                {!isPendingGrading && optIsSelected && !optIsCorrect && <XCircle size={20} className="text-red-500" />}
                                                                {isPendingGrading && optIsSelected && <HelpCircle size={20} className="text-yellow-500" />}
                                                            </div>
                                                            <span className={`font-bold ${isPendingGrading
                                                                ? optIsSelected ? 'text-yellow-500' : 'text-gray-400'
                                                                : optIsCorrect
                                                                    ? 'text-green-500'
                                                                    : optIsSelected
                                                                        ? 'text-red-500'
                                                                        : 'text-gray-400'
                                                                }`}>
                                                                {optContent}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Text Answer Review */}
                                        {(answerType === "Essay" || textAnswer) && (
                                            <div className={`mt-4 p-5 rounded-2xl border text-right ${isPendingGrading ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-white/5 border-white/10'}`}>
                                                <p className="text-sm font-bold text-gray-500 mb-2">إجابتك المكتوبة:</p>
                                                <p className="text-white font-bold">{textAnswer || "لم يتم كتابة إجابة"}</p>
                                            </div>
                                        )}

                                        {/* Image Answer Review */}
                                        {(answerType === "Image" || answerType === "ImageAnswer" || answer.imageAnswerUrl || answer.ImageAnswerUrl) && (
                                            <div className={`mt-4 p-5 rounded-2xl border text-right space-y-3 ${isPendingGrading ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-white/5 border-white/10'}`}>
                                                <p className="text-sm font-bold text-gray-500 mb-2">إجابتك المصورة:</p>
                                                {(() => {
                                                    const url = answer.imageAnswerUrl || answer.ImageAnswerUrl;
                                                    if (url) {
                                                        const fullUrl = url.startsWith('http') ? url : `${env.API.SERVER_URL}${url.startsWith('/') ? '' : '/'}${url}`;
                                                        return (
                                                            <div className="max-w-md mr-0 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                                                                <img src={fullUrl} alt="إجابة الطالب المصورة" className="w-full h-auto" />
                                                            </div>
                                                        );
                                                    }
                                                    return <p className="text-gray-500 font-bold">لم يتم رفع صورة</p>;
                                                })()}
                                            </div>
                                        )}

                                        {/* Teacher Feedback - عرض الملاحظات من المدرس */}
                                        {(answer.feedback || answer.Feedback) && (
                                            <div className="mt-4 p-5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-right">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <p className="text-sm font-bold text-blue-400">تعليق المدرس:</p>
                                                    {(answer.gradedByName || answer.GradedByName) && (
                                                        <span className="text-xs font-bold text-blue-400/70">
                                                            ({answer.gradedByName || answer.GradedByName})
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-white font-bold">{answer.feedback || answer.Feedback}</p>
                                            </div>
                                        )}

                                        {/* Model Answer - الإجابة النموذجية (إذا كان مصحح) */}
                                        {result.isGraded && (
                                            <>
                                                {/* للأسئلة MCQ و TrueFalse - إظهار الإجابة الصحيحة (فقط إذا خاطئة) */}
                                                {(answerType === 'MCQ' || answerType === 'TrueFalse') && !isCorrect && !isPendingGrading && options.length > 0 && (
                                                    <div className="mt-4 p-5 rounded-2xl bg-green-500/10 border border-green-500/30 text-right">
                                                        <p className="text-sm font-bold text-green-400 mb-3">✓ الإجابة الصحيحة:</p>
                                                        <div className="space-y-2">
                                                            {options.filter((opt: any) => opt.isCorrect === true || opt.IsCorrect === true).map((correctOpt: any, ci: number) => (
                                                                <div key={ci} className="flex items-center justify-end gap-2">
                                                                    <span className="text-white font-bold">{correctOpt.optionContent || correctOpt.OptionContent}</span>
                                                                    <CheckCircle2 size={18} className="text-green-400" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* الإجابة النموذجية - عرضها دائماً إذا موجودة */}
                                                {(() => {
                                                    // البحث عن correctAnswerImageUrl من answer أو من الامتحان الأصلي
                                                    const questionId = answer.questionId || answer.QuestionId;
                                                    const answerUrl = answer.correctAnswerImageUrl || answer.CorrectAnswerImageUrl;
                                                    const examUrl = getCorrectAnswerImageUrl(questionId);
                                                    const url = answerUrl || examUrl;

                                                    console.log(`📸 Q${questionId} Model Answer:`, { answerUrl, examUrl, finalUrl: url });

                                                    return url;
                                                })() && (
                                                        <div className="mt-4 p-5 rounded-2xl bg-green-500/10 border border-green-500/30 text-right space-y-3">
                                                            <p className="text-sm font-bold text-green-400 mb-2">✓ الإجابة النموذجية:</p>
                                                            {(() => {
                                                                const questionId = answer.questionId || answer.QuestionId;
                                                                const answerUrl = answer.correctAnswerImageUrl || answer.CorrectAnswerImageUrl;
                                                                const examUrl = getCorrectAnswerImageUrl(questionId);
                                                                const url = answerUrl || examUrl;

                                                                if (!url) return null;

                                                                const fullUrl = url.startsWith('http') ? url : `${env.API.SERVER_URL}${url.startsWith('/') ? '' : '/'}${url}`;
                                                                console.log(`🖼️ Displaying model answer:`, fullUrl);
                                                                return (
                                                                    <div className="max-w-md mr-0 rounded-xl overflow-hidden border border-green-500/30 shadow-lg">
                                                                        <img src={fullUrl} alt="الإجابة النموذجية" className="w-full h-auto" />
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    )}
                                            </>
                                        )}

                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
