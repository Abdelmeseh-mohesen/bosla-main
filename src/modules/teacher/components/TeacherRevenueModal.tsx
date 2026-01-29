"use client";

import React from "react";
import {
    X,
    DollarSign,
    TrendingUp,
    Users,
    BookOpen,
    Calendar,
    AlertCircle,
    Wallet,
    CreditCard,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { TeacherRevenue, RevenueCourse } from "../types/teacher.types";

interface TeacherRevenueModalProps {
    isOpen: boolean;
    onClose: () => void;
    revenue: TeacherRevenue | null;
    isLoading: boolean;
    error?: string | null;
}

export function TeacherRevenueModal({
    isOpen,
    onClose,
    revenue,
    isLoading,
    error
}: TeacherRevenueModalProps) {
    const [expandedCourses, setExpandedCourses] = React.useState<number[]>([]);

    // Group courses by courseId and sum revenues - MUST be before any return
    const groupedCourses = React.useMemo(() => {
        if (!revenue?.courses) return [];

        const grouped = new Map<number, RevenueCourse & { allStudents: RevenueCourse['students'] }>();

        revenue.courses.forEach(course => {
            if (grouped.has(course.courseId)) {
                const existing = grouped.get(course.courseId)!;
                existing.courseRevenue += course.courseRevenue;
                existing.approvedSubscriptions += course.approvedSubscriptions;
                existing.allStudents = [...existing.allStudents, ...course.students];
            } else {
                grouped.set(course.courseId, {
                    ...course,
                    allStudents: [...course.students]
                });
            }
        });

        return Array.from(grouped.values());
    }, [revenue?.courses]);

    const toggleCourse = (courseId: number) => {
        setExpandedCourses(prev =>
            prev.includes(courseId)
                ? prev.filter(id => id !== courseId)
                : [...prev, courseId]
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-EG', {
            style: 'decimal',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Early return AFTER all hooks
    if (!isOpen) return null;

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
                <div className="bg-[#0d1117] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-300">
                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-emerald-600/20 via-emerald-500/10 to-transparent p-6 border-b border-white/5">
                        <button
                            onClick={onClose}
                            className="absolute top-4 left-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <X size={20} className="text-gray-400" />
                        </button>

                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-3">
                                <Wallet className="text-emerald-400" size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-white">إحصائيات الإيرادات</h2>
                            {revenue && (
                                <p className="text-gray-400 text-sm mt-1">{revenue.teacherName}</p>
                            )}
                        </div>
                    </div>

                    {/* Stats Row */}
                    {!isLoading && !error && revenue && (
                        <div className="grid grid-cols-3 gap-4 p-6 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
                            {/* Total Revenue */}
                            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-2xl p-5 border border-emerald-500/20 text-center">
                                <DollarSign className="text-emerald-400 mx-auto mb-2" size={28} />
                                <div className="text-3xl font-black text-emerald-400">
                                    {formatCurrency(revenue.totalRevenue)}
                                </div>
                                <div className="text-sm text-gray-400 font-bold mt-1">ج.م إجمالي الأرباح</div>
                            </div>

                            {/* Total Subscriptions */}
                            <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-2xl p-5 border border-blue-500/20 text-center">
                                <Users className="text-blue-400 mx-auto mb-2" size={28} />
                                <div className="text-3xl font-black text-blue-400">
                                    {revenue.totalApprovedSubscriptions}
                                </div>
                                <div className="text-sm text-gray-400 font-bold mt-1">اشتراك مؤكد</div>
                            </div>

                            {/* Total Courses */}
                            <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-2xl p-5 border border-purple-500/20 text-center">
                                <BookOpen className="text-purple-400 mx-auto mb-2" size={28} />
                                <div className="text-3xl font-black text-purple-400">
                                    {groupedCourses.length}
                                </div>
                                <div className="text-sm text-gray-400 font-bold mt-1">كورسات نشطة</div>
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[50vh]">
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="animate-spin rounded-full h-14 w-14 border-4 border-emerald-500 border-t-transparent mb-4"></div>
                                <p className="text-gray-400 font-bold">جاري تحميل الإحصائيات...</p>
                            </div>
                        )}

                        {error && (
                            <div className="flex flex-col items-center justify-center py-16">
                                <AlertCircle className="text-red-400 mb-4" size={56} />
                                <p className="text-red-400 font-bold mb-2 text-lg">حدث خطأ</p>
                                <p className="text-gray-500 text-sm">{error}</p>
                            </div>
                        )}

                        {!isLoading && !error && (!revenue || groupedCourses.length === 0) && (
                            <div className="flex flex-col items-center justify-center py-16">
                                <Wallet className="text-gray-600 mb-4" size={56} />
                                <p className="text-gray-400 font-bold text-lg">لا توجد إيرادات بعد</p>
                                <p className="text-gray-600 text-sm mt-1">لم يتم تسجيل أي اشتراكات حتى الآن</p>
                            </div>
                        )}

                        {!isLoading && !error && revenue && groupedCourses.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4">
                                    <TrendingUp size={20} className="text-emerald-400" />
                                    تفاصيل الكورسات
                                </h3>

                                {groupedCourses.map((course, index) => (
                                    <div
                                        key={course.courseId}
                                        className="bg-white/[0.02] rounded-2xl border border-white/10 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-300"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        {/* Course Header */}
                                        <button
                                            onClick={() => toggleCourse(course.courseId)}
                                            className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                                    <BookOpen className="text-emerald-400" size={24} />
                                                </div>
                                                <div className="text-right">
                                                    <h4 className="font-bold text-white text-lg">{course.courseTitle}</h4>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <span className="text-sm text-gray-500">
                                                            <span className="text-emerald-400 font-bold">{formatCurrency(course.courseRevenue)}</span> ج.م
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            <span className="text-blue-400 font-bold">{course.approvedSubscriptions}</span> اشتراك
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            السعر: <span className="text-white font-bold">{formatCurrency(course.coursePrice)}</span> ج.م
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="text-left">
                                                    <div className="text-xl font-black text-emerald-400">
                                                        {formatCurrency(course.courseRevenue)} ج.م
                                                    </div>
                                                </div>
                                                {expandedCourses.includes(course.courseId) ? (
                                                    <ChevronUp className="text-gray-500" size={20} />
                                                ) : (
                                                    <ChevronDown className="text-gray-500" size={20} />
                                                )}
                                            </div>
                                        </button>

                                        {/* Students List */}
                                        {expandedCourses.includes(course.courseId) && (
                                            <div className="border-t border-white/5 bg-black/20 p-4">
                                                <div className="space-y-2">
                                                    {(course as any).allStudents.map((student: any, sIdx: number) => (
                                                        <div
                                                            key={`${student.studentId}-${sIdx}`}
                                                            className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-red/20 to-transparent flex items-center justify-center text-brand-red font-bold">
                                                                    {student.studentName?.charAt(0)?.toUpperCase() || "S"}
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="font-bold text-white">{student.studentName}</p>
                                                                    <p className="text-xs text-gray-500">{student.studentEmail}</p>
                                                                </div>
                                                            </div>

                                                            <div className="text-left">
                                                                <div className="flex items-center gap-2 text-emerald-400">
                                                                    <CreditCard size={16} />
                                                                    <span className="font-black">{formatCurrency(student.paidAmount)} ج.م</span>
                                                                </div>
                                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                                    <Calendar size={12} />
                                                                    {formatDate(student.subscriptionDate)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                        <button
                            onClick={onClose}
                            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors"
                        >
                            إغلاق
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
