"use client";

import React, { useState, useEffect } from "react";
import { Exam, ExamAnswer } from "../types/student.types";
import { Button } from "@/shared/ui/button";
import { Timer, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Send, HelpCircle, FileText, Upload, Image as ImageIcon, X, CheckSquare } from "lucide-react";

interface ExamViewerProps {
    exam: Exam;
    onClose: () => void;
    onSubmit: (answers: ExamAnswer[]) => void;
    readOnly?: boolean;
}

export function ExamViewer({ exam, onClose, onSubmit, readOnly = false }: ExamViewerProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, ExamAnswer>>({});
    const [timeLeft, setTimeLeft] = useState(exam.durationInMinutes * 60);

    // Initialize answers with all questions from the exam
    useEffect(() => {
        const initialAnswers: Record<number, ExamAnswer> = {};
        (exam.questions || []).forEach(q => {
            initialAnswers[q.id] = {
                questionId: q.id,
                selectedOptionIds: [],
                textAnswer: "",
                imageAnswerUrl: ""
            };
        });
        setAnswers(initialAnswers);
    }, [exam.id]);

    useEffect(() => {
        if (timeLeft <= 0) {
            handleAutoSubmit();
            return;
        }
        const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };



    const handleAnswerSelect = (questionId: number, optionId: number) => {
        if (readOnly) return;
        setAnswers(prev => {
            const existing = prev[questionId];
            return {
                ...prev,
                [questionId]: {
                    ...existing,
                    questionId,
                    selectedOptionIds: [optionId],
                    textAnswer: "",
                    imageAnswerUrl: existing?.imageAnswerUrl || ""
                }
            };
        });
    };

    const handleTextChange = (questionId: number, text: string) => {
        if (readOnly) return;
        setAnswers(prev => {
            const existing = prev[questionId];
            return {
                ...prev,
                [questionId]: {
                    ...existing,
                    questionId,
                    selectedOptionIds: [],
                    textAnswer: text,
                    imageAnswerUrl: existing?.imageAnswerUrl || ""
                }
            };
        });
    };

    const handleImageChange = (questionId: number, file: File | null) => {
        if (readOnly) return;
        setAnswers(prev => {
            const existing = prev[questionId];
            return {
                ...prev,
                [questionId]: {
                    ...existing,
                    questionId,
                    selectedOptionIds: [],
                    textAnswer: "",
                    imageAnswerUrl: "",
                    file: file || undefined
                }
            };
        });
    };

    // Handle Paste Event for Image Questions
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            if (readOnly) return;

            const q = (exam.questions || [])[currentQuestionIndex];
            if (!q) return;

            // Check for both "Image" and "ImageAnswer"
            const isImageQuestion = q.answerType === "Image" || (q.answerType as string) === "ImageAnswer";

            if (isImageQuestion && e.clipboardData && e.clipboardData.items) {
                const items = e.clipboardData.items;
                for (let i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf("image") !== -1) {
                        const blob = items[i].getAsFile();
                        if (blob) {
                            e.preventDefault();
                            const file = new File([blob], "pasted-image.png", { type: blob.type });
                            handleImageChange(q.id, file);
                        }
                        break;
                    }
                }
            }
        };

        window.addEventListener("paste", handlePaste);
        return () => window.removeEventListener("paste", handlePaste);
    }, [currentQuestionIndex, exam, readOnly]);

    const isQuestionAnswered = (qId: number) => {
        const ans = answers[qId];
        if (!ans) return false;
        return (ans.selectedOptionIds.length > 0 || ans.textAnswer.trim() !== "" || !!ans.file);
    };

    const answeredCount = (exam.questions || []).filter(q => isQuestionAnswered(q.id)).length;
    const isComplete = answeredCount === (exam.questions || []).length;

    const handleAutoSubmit = () => {
        // Deterministically collect answers for ALL questions in the exam
        const finalAnswers = (exam.questions || []).map(q => {
            const existing = answers[q.id];
            return {
                questionId: q.id,
                selectedOptionIds: existing?.selectedOptionIds || [],
                textAnswer: existing?.textAnswer || "",
                imageAnswerUrl: existing?.imageAnswerUrl || "",
                file: existing?.file
            };
        });
        console.log("ExamViewer - Final Answers to Submit:", finalAnswers);
        onSubmit(finalAnswers);
    };

    const currentQuestion = (exam.questions || [])[currentQuestionIndex];
    const currentAnswer = answers[currentQuestion.id];

    return (
        <div className="fixed inset-0 z-[100] bg-[#06080a] flex flex-col font-arabic">
            {/* Header */}
            <div className="h-24 border-b border-white/5 bg-[#0d1117] flex items-center justify-between px-10">
                <div className="flex items-center gap-6">
                    <Button variant="ghost" onClick={onClose} className="rounded-xl border border-white/10 text-gray-400">
                        خروج
                    </Button>
                    <div className="text-right">
                        <h2 className="text-xl font-black text-white">{exam.title}</h2>
                        <div className="flex items-center justify-end gap-3 mt-1">
                            {exam.deadline && (
                                <span className="text-[10px] font-bold bg-brand-red/10 text-brand-red px-2 py-0.5 rounded-lg border border-brand-red/20">
                                    الموعد النهائي: {new Date(exam.deadline).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}
                            <p className="text-sm font-bold text-gray-500">{exam.lectureName}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10">
                        <CheckCircle2 size={20} className="text-green-500" />
                        <span className="text-white font-black">{answeredCount} / {(exam.questions || []).length} تمت الإجابة</span>
                    </div>

                    {!readOnly && (
                        <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border ${timeLeft < 300 ? 'border-red-500/50 bg-red-500/10 text-red-500' : 'border-brand-red/50 bg-brand-red/10 text-brand-red'}`}>
                            <Timer size={24} className={timeLeft < 300 ? 'animate-pulse' : ''} />
                            <span className="text-2xl font-black">{formatTime(timeLeft)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-white/5">
                <div
                    className="h-full bg-brand-red transition-all duration-500"
                    style={{ width: `${(answeredCount / (exam.questions || []).length) * 100}%` }}
                />
            </div>

            {/* Main Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12 lg:px-48">
                <div className="space-y-10">
                    {/* Question Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="h-12 w-12 rounded-2xl bg-brand-red/10 flex items-center justify-center text-brand-red font-black text-xl">
                                {currentQuestionIndex + 1}
                            </span>
                            <h3 className="text-2xl font-black text-white">من {(exam.questions || []).length}</h3>
                        </div>
                        <div className="flex gap-2">
                            {(exam.questions || []).map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentQuestionIndex(i)}
                                    className={`w-3 h-3 rounded-full transition-all ${i === currentQuestionIndex ? 'bg-brand-red w-8' : (isQuestionAnswered(q.id) ? 'bg-green-500' : 'bg-white/10')}`}>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Question Content */}
                    <div className="glass-card p-10 rounded-[3rem] border border-white/10 space-y-8 min-h-[400px]">
                        {currentQuestion.questionType === "Image" && (
                            <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-white/5 p-4 flex justify-center">
                                <img src={currentQuestion.content} alt="Question" className="max-h-[300px] object-contain" />
                            </div>
                        )}

                        {currentQuestion.questionType === "Text" && (
                            <div className="text-3xl font-black text-white text-right leading-relaxed mb-8">
                                {currentQuestion.content}
                            </div>
                        )}

                        {/* Answer Area */}
                        {currentQuestion.answerType === "MCQ" || currentQuestion.answerType === "TrueFalse" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {currentQuestion.options.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleAnswerSelect(currentQuestion.id, option.id)}
                                        className={`relative p-8 rounded-[2rem] border-2 text-right transition-all group ${currentAnswer?.selectedOptionIds.includes(option.id)
                                            ? 'border-brand-red bg-brand-red/5'
                                            : 'border-white/5 bg-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all ${currentAnswer?.selectedOptionIds.includes(option.id)
                                                ? 'border-brand-red bg-brand-red'
                                                : 'border-white/20'
                                                }`}>
                                                {currentAnswer?.selectedOptionIds.includes(option.id) && <div className="h-3 w-3 rounded-full bg-white" />}
                                            </div>
                                            <span className={`text-2xl font-bold ${currentAnswer?.selectedOptionIds.includes(option.id) ? 'text-white' : 'text-gray-400'}`}>
                                                {option.content}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : currentQuestion.answerType === "Image" || (currentQuestion.answerType as string) === "ImageAnswer" ? (
                            <div className="space-y-6">
                                <p className="text-right text-gray-500 font-bold">ارفع صورة الإجابة أو قم بلصقها (Ctrl+V):</p>
                                <div className="max-w-xl mx-auto">
                                    <label className={`flex flex-col items-center justify-center w-full h-64 rounded-[2rem] border-2 border-dashed transition-all cursor-pointer ${currentAnswer?.file ? 'border-brand-red bg-brand-red/5' : 'border-white/10 bg-white/5 hover:border-brand-red/20'}`}>
                                        {currentAnswer?.file ? (
                                            <div className="relative w-full h-full p-4">
                                                <img
                                                    src={URL.createObjectURL(currentAnswer.file)}
                                                    alt="Preview"
                                                    className="w-full h-full object-contain rounded-xl"
                                                />
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleImageChange(currentQuestion.id, null);
                                                    }}
                                                    className="absolute top-6 left-6 p-2 bg-brand-red text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                                                >
                                                    <X size={20} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-4 text-gray-500 group-hover:text-brand-red transition-colors">
                                                <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center">
                                                    <Upload size={32} />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xl font-black text-white mb-1">اضغط لرفع الصورة</p>
                                                    <p className="text-sm font-bold">أو اضغط Ctrl + V للصق الصورة مباشرة</p>
                                                </div>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleImageChange(currentQuestion.id, file);
                                            }}
                                            disabled={readOnly}
                                        />
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-right text-gray-500 font-bold">اكتب إجابتك هنا:</p>
                                <textarea
                                    value={currentAnswer?.textAnswer || ""}
                                    onChange={(e) => handleTextChange(currentQuestion.id, e.target.value)}
                                    readOnly={readOnly}
                                    className="w-full h-48 bg-white/5 border-2 border-white/10 rounded-[2rem] p-8 text-white text-right text-xl font-bold focus:border-brand-red outline-none transition-all resize-none"
                                    placeholder={readOnly ? "لا يمكن تعديل الإجابة" : "ابدأ الكتابة..."}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Navigation */}
            <div className="h-28 border-top border-white/5 bg-[#0d1117] px-10 flex items-center justify-between">
                <div className="flex gap-4">
                    {currentQuestionIndex === (exam.questions || []).length - 1 ? (
                        <div className="flex flex-col items-center">
                            {!isComplete && (
                                <p className="text-brand-red text-xs font-black mb-2 animate-bounce">يجب الإجابة على جميع الأسئلة أولاً</p>
                            )}
                            <Button
                                onClick={handleAutoSubmit}
                                disabled={readOnly || !isComplete}
                                className={`h-16 px-10 rounded-2xl text-xl font-black flex gap-3 transition-all ${isComplete ? 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20' : 'bg-gray-700 opacity-50 cursor-not-allowed'} ${readOnly ? 'hidden' : ''}`}
                            >
                                <Send size={24} />
                                تسجيل الإجابات
                            </Button>
                        </div>
                    ) : (
                        <Button
                            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                            className="h-16 px-10 rounded-2xl bg-brand-red text-xl font-black flex gap-3 shadow-lg shadow-brand-red/20"
                        >
                            السؤال التالي
                            <ChevronLeft size={24} />
                        </Button>
                    )}
                </div>

                <Button
                    variant="ghost"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    className="h-16 px-10 rounded-2xl border border-white/5 text-xl font-black gap-3 text-gray-400 hover:text-white"
                >
                    <ChevronRight size={24} />
                    السابق
                </Button>
            </div>
        </div>
    );
}
