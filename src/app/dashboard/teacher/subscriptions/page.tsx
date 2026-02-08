"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TeacherService } from "@/modules/teacher/services/teacher.service";
import { useTeacherAuth } from "@/modules/teacher/hooks/use-teacher-auth";
import { CourseSubscription, SubscriptionStatus } from "@/modules/teacher/types/teacher.types";
import { Button } from "@/shared/ui/button";
import {
    ArrowRight,
    User,
    BookOpen,
    Clock,
    Check,
    X,
    Loader2,
    GraduationCap,
    AlertCircle,
    Filter,
    Bell,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    Users
} from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Modal } from "@/shared/ui/modal";
import { Plus } from "lucide-react";
import Link from "next/link";

// تجميع الاشتراكات حسب الكورس
interface CourseGroup {
    courseId: number;
    courseName: string;
    educationStageName: string;
    subscriptions: CourseSubscription[];
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
}

export default function SubscriptionsPage() {
    const { teacherId, isAssistant } = useTeacherAuth();
    const queryClient = useQueryClient();
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [filter, setFilter] = useState<SubscriptionStatus | "All">("All");
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set());

    const { data: subscriptionsResponse, isLoading, isRefetching, refetch } = useQuery({
        queryKey: ["teacherSubscriptions", teacherId],
        queryFn: () => TeacherService.getSubscriptions(teacherId!),
        enabled: !!teacherId,
    });

    // Fetch courses for manual activation
    const { data: coursesResponse } = useQuery({
        queryKey: ["teacherCourses", teacherId],
        queryFn: () => TeacherService.getCourses(teacherId!),
        enabled: !!teacherId,
    });
    const courses = coursesResponse?.data || [];

    // Manual Activation State
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [manualCourseId, setManualCourseId] = useState<string>("");
    const [manualEmail, setManualEmail] = useState("");
    const [isManualLoading, setIsManualLoading] = useState(false);

    const subscriptions = subscriptionsResponse?.data || [];

    // تجميع الاشتراكات حسب الكورس
    const courseGroups = useMemo(() => {
        const groups: Map<number, CourseGroup> = new Map();

        subscriptions.forEach(sub => {
            if (!groups.has(sub.courseId)) {
                groups.set(sub.courseId, {
                    courseId: sub.courseId,
                    courseName: sub.courseName,
                    educationStageName: sub.educationStageName,
                    subscriptions: [],
                    pendingCount: 0,
                    approvedCount: 0,
                    rejectedCount: 0
                });
            }

            const group = groups.get(sub.courseId)!;
            group.subscriptions.push(sub);

            if (sub.status === "Pending") group.pendingCount++;
            else if (sub.status === "Approved") group.approvedCount++;
            else if (sub.status === "Rejected") group.rejectedCount++;
        });

        return Array.from(groups.values());
    }, [subscriptions]);

    // تبديل حالة التوسيع للكورس
    const toggleCourse = (courseId: number) => {
        setExpandedCourses(prev => {
            const newSet = new Set(prev);
            if (newSet.has(courseId)) {
                newSet.delete(courseId);
            } else {
                newSet.add(courseId);
            }
            return newSet;
        });
    };

    // توسيع/طي الكل
    const toggleAll = () => {
        if (expandedCourses.size === courseGroups.length) {
            setExpandedCourses(new Set());
        } else {
            setExpandedCourses(new Set(courseGroups.map(g => g.courseId)));
        }
    };

    // فلترة الاشتراكات داخل كل كورس
    const getFilteredSubscriptions = (subs: CourseSubscription[]) => {
        return subs.filter(sub => filter === "All" ? true : sub.status === filter);
    };

    // فلترة الكورسات التي تحتوي على اشتراكات مطابقة للفلتر
    const filteredCourseGroups = courseGroups.filter(group => {
        const filtered = getFilteredSubscriptions(group.subscriptions);
        return filtered.length > 0;
    });

    const handleManualActivation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualCourseId || !manualEmail || !teacherId) return;

        setIsManualLoading(true);
        try {
            const response = await TeacherService.approveSubscription(
                teacherId,
                Number(manualCourseId),
                manualEmail
            );

            if (response.succeeded) {
                setToast({ message: "تم تفعيل اشتراك الطالب بنجاح ✓", type: 'success' });
                setIsManualModalOpen(false);
                setManualEmail("");
                setManualCourseId("");
                refetch();
            } else {
                setToast({ message: response.message || "حدث خطأ", type: 'error' });
            }
        } catch (error: any) {
            setToast({ message: error.response?.data?.message || "فشل تفعيل الاشتراك", type: 'error' });
        } finally {
            setIsManualLoading(false);
        }
    };

    const handleStatusChange = async (subscription: CourseSubscription, newStatus: SubscriptionStatus) => {
        setUpdatingId(subscription.courseSubscriptionId);
        try {
            const response = await TeacherService.updateSubscriptionStatus({
                id: subscription.courseSubscriptionId,
                status: newStatus,
            });

            if (response.succeeded) {
                const statusMessages: Record<SubscriptionStatus, string> = {
                    "Approved": "تم قبول الاشتراك ✓",
                    "Rejected": "تم رفض الاشتراك",
                    "Pending": "تم إعادة الاشتراك لقيد الانتظار"
                };
                setToast({
                    message: statusMessages[newStatus],
                    type: 'success'
                });
                refetch();
            } else {
                setToast({ message: response.message || "حدث خطأ", type: 'error' });
            }
        } catch (error: any) {
            setToast({ message: error.response?.data?.message || "فشل تحديث الحالة", type: 'error' });
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusBadge = (status: SubscriptionStatus) => {
        switch (status) {
            case "Pending":
                return (
                    <span className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-full text-sm font-bold">
                        <Clock size={14} />
                        قيد الانتظار
                    </span>
                );
            case "Approved":
                return (
                    <span className="flex items-center gap-1.5 bg-green-500/10 text-green-500 px-3 py-1.5 rounded-full text-sm font-bold">
                        <Check size={14} />
                        مقبول
                    </span>
                );
            case "Rejected":
                return (
                    <span className="flex items-center gap-1.5 bg-red-500/10 text-red-500 px-3 py-1.5 rounded-full text-sm font-bold">
                        <X size={14} />
                        مرفوض
                    </span>
                );
        }
    };

    const pendingCount = subscriptions.filter(s => s.status === "Pending").length;
    const approvedCount = subscriptions.filter(s => s.status === "Approved").length;
    const rejectedCount = subscriptions.filter(s => s.status === "Rejected").length;

    if (!teacherId) {
        return <div className="min-h-screen flex items-center justify-center text-white">جاري التحميل...</div>;
    }

    return (
        <div className="min-h-screen bg-[#06080a] text-white p-4 md:p-10 font-arabic relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-brand-red/5 rounded-full blur-[120px]" />
            </div>

            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl font-bold shadow-2xl animate-in slide-in-from-top-4 duration-300 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {toast.message}
                    <button onClick={() => setToast(null)} className="mr-4 opacity-70 hover:opacity-100">✕</button>
                </div>
            )}

            <div className="relative z-10 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/teacher">
                            <Button
                                variant="outline"
                                className="h-14 w-14 p-0 rounded-2xl border-white/10 hover:bg-white/5"
                            >
                                <ArrowRight size={24} />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
                                <Bell className="text-yellow-500" size={32} />
                                إدارة طلبات الاشتراك
                            </h1>
                            <p className="text-gray-500 font-bold mt-1">
                                قبول أو رفض طلبات اشتراك الطلاب في الكورسات
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => refetch()}
                            variant="outline"
                            disabled={isRefetching}
                            className="h-12 px-5 rounded-xl border-white/10 hover:bg-white/5 font-bold gap-2"
                        >
                            <RefreshCw size={18} className={isRefetching ? "animate-spin" : ""} />
                            {isRefetching ? "جاري التحديث..." : "تحديث"}
                        </Button>

                        <Button
                            onClick={() => setIsManualModalOpen(true)}
                            className="h-12 px-5 rounded-xl bg-brand-red hover:bg-red-700 text-white font-bold gap-2 shadow-lg shadow-brand-red/20"
                        >
                            <Plus size={18} />
                            تفعيل اشتراك يدوي
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                    <div className="bg-[#0d1117] border border-yellow-500/10 rounded-2xl p-6 text-center hover:border-yellow-500/30 transition-all">
                        <p className="text-4xl font-black text-yellow-500">{pendingCount}</p>
                        <p className="text-sm font-bold text-gray-500 mt-2">قيد الانتظار</p>
                    </div>
                    <div className="bg-[#0d1117] border border-green-500/10 rounded-2xl p-6 text-center hover:border-green-500/30 transition-all">
                        <p className="text-4xl font-black text-green-500">{approvedCount}</p>
                        <p className="text-sm font-bold text-gray-500 mt-2">مقبول</p>
                    </div>
                    <div className="bg-[#0d1117] border border-red-500/10 rounded-2xl p-6 text-center hover:border-red-500/30 transition-all">
                        <p className="text-4xl font-black text-red-500">{rejectedCount}</p>
                        <p className="text-sm font-bold text-gray-500 mt-2">مرفوض</p>
                    </div>
                </div>

                {/* Filter & Toggle All */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 bg-[#0d1117] p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 flex-wrap">
                        <Filter size={18} className="text-gray-500" />
                        <span className="text-gray-500 font-bold text-sm">فلترة:</span>
                        {(["All", "Pending", "Approved", "Rejected"] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === status
                                    ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                {status === "All" && `الكل (${subscriptions.length})`}
                                {status === "Pending" && `قيد الانتظار (${pendingCount})`}
                                {status === "Approved" && `مقبول (${approvedCount})`}
                                {status === "Rejected" && `مرفوض (${rejectedCount})`}
                            </button>
                        ))}
                    </div>

                    {/* Toggle All Button */}
                    <button
                        onClick={toggleAll}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-white/5 text-gray-400 hover:bg-white/10 transition-all"
                    >
                        {expandedCourses.size === courseGroups.length && courseGroups.length > 0 ? (
                            <>
                                <ChevronUp size={18} />
                                طي الكل
                            </>
                        ) : (
                            <>
                                <ChevronDown size={18} />
                                توسيع الكل
                            </>
                        )}
                    </button>
                </div>

                {/* Courses Groups */}
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredCourseGroups.length === 0 ? (
                    <div className="text-center py-20 bg-[#0d1117] rounded-[2rem] border border-white/5">
                        <AlertCircle size={56} className="mx-auto text-gray-600 mb-4" />
                        <p className="text-xl font-bold text-gray-500">لا توجد طلبات اشتراك</p>
                        <p className="text-sm text-gray-600 mt-2">ستظهر هنا طلبات الاشتراك الجديدة من الطلاب</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredCourseGroups.map((group) => {
                            const isExpanded = expandedCourses.has(group.courseId);
                            const filteredSubs = getFilteredSubscriptions(group.subscriptions);

                            return (
                                <div
                                    key={group.courseId}
                                    className="bg-[#0d1117] border border-white/5 rounded-2xl overflow-hidden transition-all hover:border-white/10"
                                >
                                    {/* Course Header */}
                                    <button
                                        onClick={() => toggleCourse(group.courseId)}
                                        className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-all"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-red to-brand-red/60 flex items-center justify-center text-white shadow-lg shadow-brand-red/20">
                                                <BookOpen size={32} />
                                            </div>
                                            <div className="text-right">
                                                <h3 className="font-black text-white text-xl mb-1">{group.courseName}</h3>
                                                <div className="flex items-center gap-4">
                                                    <span className="flex items-center gap-1.5 text-sm text-gray-500">
                                                        <GraduationCap size={16} />
                                                        {group.educationStageName}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-sm text-gray-500">
                                                        <Users size={16} />
                                                        {group.subscriptions.length} طالب
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-5">
                                            {/* Mini Stats */}
                                            <div className="hidden md:flex items-center gap-3">
                                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-500/10 text-yellow-500 text-sm font-bold">
                                                    <Clock size={14} />
                                                    {group.pendingCount}
                                                </span>
                                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500/10 text-green-500 text-sm font-bold">
                                                    <Check size={14} />
                                                    {group.approvedCount}
                                                </span>
                                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-500 text-sm font-bold">
                                                    <X size={14} />
                                                    {group.rejectedCount}
                                                </span>
                                            </div>

                                            {/* Expand/Collapse Icon */}
                                            <div className={`p-3 rounded-xl bg-white/5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                                <ChevronDown size={24} className="text-gray-400" />
                                            </div>
                                        </div>
                                    </button>

                                    {/* Subscriptions List (Collapsible) */}
                                    {isExpanded && (
                                        <div className="border-t border-white/5 p-5 space-y-4 bg-black/20">
                                            {filteredSubs.map((subscription) => (
                                                <div
                                                    key={subscription.courseSubscriptionId}
                                                    className="bg-[#161b22] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all"
                                                >
                                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                                                        {/* Student Info */}
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-14 h-14 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red">
                                                                <User size={28} />
                                                            </div>
                                                            <div className="text-right">
                                                                <h4 className="font-black text-white text-lg">{subscription.studentName}</h4>
                                                                {subscription.studentEmail && subscription.studentEmail !== "No Email" && (
                                                                    <p className="text-sm font-bold text-brand-red/80">
                                                                        {subscription.studentEmail}
                                                                    </p>
                                                                )}
                                                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5 justify-end">
                                                                    <Clock size={12} />
                                                                    {new Date(subscription.createdAt).toLocaleDateString('ar-EG', {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Status & Actions */}
                                                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
                                                            {getStatusBadge(subscription.status)}

                                                            {/* Action buttons */}
                                                            <div className="flex gap-3">
                                                                <Button
                                                                    onClick={() => handleStatusChange(subscription, "Approved")}
                                                                    disabled={updatingId === subscription.courseSubscriptionId || subscription.status === "Approved"}
                                                                    className={`h-10 px-5 rounded-xl font-bold text-sm transition-all ${subscription.status === "Approved"
                                                                        ? "bg-green-500/20 text-green-500/50 cursor-not-allowed"
                                                                        : "bg-green-500 hover:bg-green-600 text-white"
                                                                        }`}
                                                                >
                                                                    {updatingId === subscription.courseSubscriptionId ? (
                                                                        <Loader2 size={16} className="animate-spin" />
                                                                    ) : (
                                                                        <>
                                                                            <Check size={16} className="ml-1" />
                                                                            قبول
                                                                        </>
                                                                    )}
                                                                </Button>
                                                                <Button
                                                                    onClick={() => handleStatusChange(subscription, "Rejected")}
                                                                    disabled={updatingId === subscription.courseSubscriptionId || subscription.status === "Rejected"}
                                                                    className={`h-10 px-5 rounded-xl font-bold text-sm transition-all ${subscription.status === "Rejected"
                                                                        ? "bg-red-500/20 text-red-500/50 cursor-not-allowed"
                                                                        : "bg-red-500 hover:bg-red-600 text-white"
                                                                        }`}
                                                                >
                                                                    {updatingId === subscription.courseSubscriptionId ? (
                                                                        <Loader2 size={16} className="animate-spin" />
                                                                    ) : (
                                                                        <>
                                                                            <X size={16} className="ml-1" />
                                                                            رفض
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Manual Activation Modal */}
            <Modal
                isOpen={isManualModalOpen}
                onClose={() => setIsManualModalOpen(false)}
                title="تفعيل اشتراك طالب يدوياً"
                className="max-w-md"
            >
                <form onSubmit={handleManualActivation} className="space-y-6 text-right">
                    <div className="space-y-2">
                        <Label>الطالب</Label>
                        <Input
                            type="email"
                            placeholder="أدخل البريد الإلكتروني للطالب"
                            value={manualEmail}
                            onChange={(e) => setManualEmail(e.target.value)}
                            required
                            className="bg-[#0d1117] border-white/10 h-12 text-right"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>الكورس</Label>
                        <select
                            value={manualCourseId}
                            onChange={(e) => setManualCourseId(e.target.value)}
                            required
                            className="w-full h-12 bg-[#0d1117] border border-white/10 rounded-xl px-4 text-white text-right focus:border-brand-red outline-none appearance-none"
                        >
                            <option value="">اختر الكورس...</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id} className="bg-[#0d1117]">
                                    {course.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Button
                        type="submit"
                        isLoading={isManualLoading}
                        className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl"
                    >
                        <Check size={18} className="ml-2" />
                        تفعيل الاشتراك
                    </Button>
                </form>
            </Modal>
        </div>
    );
}
