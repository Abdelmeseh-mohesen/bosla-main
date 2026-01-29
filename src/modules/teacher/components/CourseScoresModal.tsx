"use client";

import React from "react";
import {
    X,
    Trophy,
    TrendingUp,
    Users,
    CheckCircle2,
    AlertCircle,
    Medal,
    Target,
    BookOpen
} from "lucide-react";
import { CourseStudentScore } from "../types/teacher.types";

interface CourseScoresModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseTitle: string;
    scores: CourseStudentScore[];
    isLoading: boolean;
    error?: string | null;
}

export function CourseScoresModal({
    isOpen,
    onClose,
    courseTitle,
    scores,
    isLoading,
    error
}: CourseScoresModalProps) {
    if (!isOpen) return null;

    const getScoreColor = (percentage: number) => {
        if (percentage >= 90) return "text-emerald-400";
        if (percentage >= 75) return "text-green-400";
        if (percentage >= 60) return "text-yellow-400";
        if (percentage >= 40) return "text-orange-400";
        return "text-red-400";
    };

    const getScoreBg = (percentage: number) => {
        if (percentage >= 90) return "bg-emerald-500/20 border-emerald-500/30";
        if (percentage >= 75) return "bg-green-500/20 border-green-500/30";
        if (percentage >= 60) return "bg-yellow-500/20 border-yellow-500/30";
        if (percentage >= 40) return "bg-orange-500/20 border-orange-500/30";
        return "bg-red-500/20 border-red-500/30";
    };

    const getProgressBarColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-emerald-500';
        if (percentage >= 75) return 'bg-green-500';
        if (percentage >= 60) return 'bg-yellow-500';
        if (percentage >= 40) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getRankIcon = (index: number) => {
        if (index === 0) return <Medal className="text-yellow-400" size={20} />;
        if (index === 1) return <Medal className="text-gray-300" size={18} />;
        if (index === 2) return <Medal className="text-amber-600" size={16} />;
        return <span className="text-gray-500 font-bold text-sm">{index + 1}</span>;
    };

    // Sort by percentage descending
    const sortedScores = [...scores].sort((a, b) => b.percentage - a.percentage);

    // Calculate averages
    const avgPercentage = scores.length > 0
        ? (scores.reduce((sum, s) => sum + s.percentage, 0) / scores.length).toFixed(1)
        : 0;

    const totalStudents = scores.length;
    const passedStudents = scores.filter(s => s.percentage >= 50).length;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-[#0d1117] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-300">
                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-brand-red/20 via-brand-red/10 to-transparent p-6 border-b border-white/5">
                        <button
                            onClick={onClose}
                            className="absolute top-4 left-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <X size={20} className="text-gray-400" />
                        </button>

                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-red/20 mb-3">
                                <Trophy className="text-brand-red" size={28} />
                            </div>
                            <h2 className="text-xl font-black text-white">درجات الطلاب</h2>
                            <p className="text-gray-400 text-sm mt-1">{courseTitle}</p>
                        </div>
                    </div>

                    {/* Stats Row */}
                    {!isLoading && !error && scores.length > 0 && (
                        <div className="grid grid-cols-3 gap-3 p-4 border-b border-white/5">
                            <div className="bg-white/5 rounded-xl p-3 text-center">
                                <Users className="text-blue-400 mx-auto mb-1" size={20} />
                                <div className="text-lg font-bold text-white">{totalStudents}</div>
                                <div className="text-xs text-gray-500">إجمالي الطلاب</div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3 text-center">
                                <TrendingUp className="text-green-400 mx-auto mb-1" size={20} />
                                <div className="text-lg font-bold text-white">{avgPercentage}%</div>
                                <div className="text-xs text-gray-500">متوسط النسبة</div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3 text-center">
                                <CheckCircle2 className="text-emerald-400 mx-auto mb-1" size={20} />
                                <div className="text-lg font-bold text-white">{passedStudents}</div>
                                <div className="text-xs text-gray-500">ناجحون</div>
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-4 overflow-y-auto max-h-[50vh]">
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-red border-t-transparent mb-4"></div>
                                <p className="text-gray-400">جاري تحميل الدرجات...</p>
                            </div>
                        )}

                        {error && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <AlertCircle className="text-red-400 mb-4" size={48} />
                                <p className="text-red-400 font-bold mb-2">حدث خطأ</p>
                                <p className="text-gray-500 text-sm">{error}</p>
                            </div>
                        )}

                        {!isLoading && !error && scores.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <BookOpen className="text-gray-600 mb-4" size={48} />
                                <p className="text-gray-400 font-bold">لا توجد درجات بعد</p>
                                <p className="text-gray-600 text-sm mt-1">لم يقم أي طالب بحل الامتحانات</p>
                            </div>
                        )}

                        {!isLoading && !error && sortedScores.length > 0 && (
                            <div className="space-y-2">
                                {sortedScores.map((score, index) => (
                                    <div
                                        key={score.studentId}
                                        className={`flex items-center gap-4 p-4 rounded-xl border ${getScoreBg(score.percentage)} hover:bg-white/5 transition-all animate-in slide-in-from-right-2 fade-in duration-300`}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        {/* Rank */}
                                        <div className="flex items-center justify-center w-8 h-8">
                                            {getRankIcon(index)}
                                        </div>

                                        {/* Student Info */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-white truncate">{score.studentName}</h4>
                                            <p className="text-xs text-gray-500 truncate">{score.studentEmail}</p>
                                        </div>

                                        {/* Exams Info */}
                                        <div className="text-center px-3">
                                            <div className="flex items-center gap-1 text-gray-400">
                                                <Target size={12} />
                                                <span className="text-xs">{score.examsCompleted}/{score.examsTaken}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-600">امتحانات</div>
                                        </div>

                                        {/* Score */}
                                        <div className="text-left min-w-[80px]">
                                            <div className={`text-lg font-black ${getScoreColor(score.percentage)}`}>
                                                {score.percentage.toFixed(1)}%
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {score.totalScore}/{score.maxScore}
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-24 hidden sm:block">
                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-700 ${getProgressBarColor(score.percentage)}`}
                                                    style={{
                                                        width: `${Math.min(score.percentage, 100)}%`,
                                                        transitionDelay: `${index * 50 + 200}ms`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-white/5 bg-white/5">
                        <button
                            onClick={onClose}
                            className="w-full py-3 rounded-xl bg-brand-red hover:bg-brand-red/80 text-white font-bold transition-colors"
                        >
                            إغلاق
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
