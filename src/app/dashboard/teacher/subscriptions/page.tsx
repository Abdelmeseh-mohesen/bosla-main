"use client";

import React, { useState } from "react";
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
    RefreshCw
} from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Modal } from "@/shared/ui/modal";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function SubscriptionsPage() {
    const { teacherId, isAssistant } = useTeacherAuth();
    const queryClient = useQueryClient();
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [filter, setFilter] = useState<SubscriptionStatus | "All">("All");
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
                refetch(); // Refresh list to assume it might appear
            } else {
                setToast({ message: response.message || "حدث خطأ", type: 'error' });
            }
        } catch (error: any) {
            setToast({ message: error.response?.data?.message || "فشل تفعيل الاشتراك", type: 'error' });
        } finally {
            setIsManualLoading(false);
        }
    };

    const subscriptions = subscriptionsResponse?.data || [];

    const handleStatusChange = async (subscription: CourseSubscription, newStatus: SubscriptionStatus) => {
        setUpdatingId(subscription.courseSubscriptionId);
        try {
            let response;

            response = await TeacherService.updateSubscriptionStatus({
                id: subscription.courseSubscriptionId,
                status: newStatus,
            });

            if (response.succeeded) {
                setToast({
                    message: newStatus === "Approved" ? "تم قبول الاشتراك ✓" : "تم رفض الاشتراك",
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

    const filteredSubscriptions = subscriptions.filter(sub =>
        filter === "All" ? true : sub.status === filter
    );

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

                {/* Filter */}
                <div className="flex items-center gap-3 flex-wrap mb-8 bg-[#0d1117] p-4 rounded-2xl border border-white/5">
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

                {/* Subscriptions List */}
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredSubscriptions.length === 0 ? (
                    <div className="text-center py-20 bg-[#0d1117] rounded-[2rem] border border-white/5">
                        <AlertCircle size={56} className="mx-auto text-gray-600 mb-4" />
                        <p className="text-xl font-bold text-gray-500">لا توجد طلبات اشتراك</p>
                        <p className="text-sm text-gray-600 mt-2">ستظهر هنا طلبات الاشتراك الجديدة من الطلاب</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredSubscriptions.map((subscription) => (
                            <div
                                key={subscription.courseSubscriptionId}
                                className="bg-[#0d1117] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    {/* Student & Course Info */}
                                    <div className="flex items-start gap-5 flex-1">
                                        <div className="w-16 h-16 rounded-2xl bg-brand-red/10 flex items-center justify-center text-brand-red shrink-0">
                                            <User size={32} />
                                        </div>
                                        <div className="text-right flex-1">
                                            <h4 className="text-xl font-black text-white mb-1">{subscription.studentName}</h4>
                                            <p className="text-gray-400 font-bold flex items-center gap-2 justify-end mb-2">
                                                <BookOpen size={16} />
                                                {subscription.courseName}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-3 justify-end text-xs text-gray-500 font-medium">
                                                <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg">
                                                    <GraduationCap size={14} />
                                                    {subscription.educationStageName}
                                                </span>
                                                <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg">
                                                    <Clock size={14} />
                                                    {new Date(subscription.createdAt).toLocaleDateString('ar-EG', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status & Actions */}
                                    <div className="flex items-center gap-4 flex-wrap justify-end">
                                        {getStatusBadge(subscription.status)}

                                        {subscription.status === "Pending" && (
                                            <div className="flex gap-3">
                                                <Button
                                                    onClick={() => handleStatusChange(subscription, "Approved")}
                                                    disabled={updatingId === subscription.courseSubscriptionId}
                                                    className="h-11 px-6 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold"
                                                >
                                                    {updatingId === subscription.courseSubscriptionId ? (
                                                        <Loader2 size={18} className="animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Check size={18} className="ml-1.5" />
                                                            قبول
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    onClick={() => handleStatusChange(subscription, "Rejected")}
                                                    disabled={updatingId === subscription.courseSubscriptionId}
                                                    variant="outline"
                                                    className="h-11 px-6 rounded-xl border-red-500/30 text-red-500 hover:bg-red-500/10 font-bold"
                                                >
                                                    <X size={18} className="ml-1.5" />
                                                    رفض
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
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
        </div >
    );
}
