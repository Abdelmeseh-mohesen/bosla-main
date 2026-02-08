"use client";

import React, { useState, useMemo } from "react";
import { CourseSubscription, SubscriptionStatus } from "../types/teacher.types";
import { TeacherService } from "../services/teacher.service";
import {
    User,
    BookOpen,
    Clock,
    Check,
    X,
    Loader2,
    GraduationCap,
    AlertCircle,
    Filter,
    ChevronDown,
    ChevronUp,
    Users
} from "lucide-react";
import { Button } from "@/shared/ui/button";

interface SubscriptionsManagerProps {
    subscriptions: CourseSubscription[];
    onStatusChange: () => void;
}

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

export function SubscriptionsManager({ subscriptions, onStatusChange }: SubscriptionsManagerProps) {
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [filter, setFilter] = useState<SubscriptionStatus | "All">("All");
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set());

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

    const handleStatusChange = async (subscriptionId: number, newStatus: SubscriptionStatus) => {
        setUpdatingId(subscriptionId);
        try {
            const response = await TeacherService.updateSubscriptionStatus({
                id: subscriptionId,
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
                onStatusChange();
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
                    <span className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold">
                        <Clock size={12} />
                        قيد الانتظار
                    </span>
                );
            case "Approved":
                return (
                    <span className="flex items-center gap-1.5 bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-bold">
                        <Check size={12} />
                        مقبول
                    </span>
                );
            case "Rejected":
                return (
                    <span className="flex items-center gap-1.5 bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs font-bold">
                        <X size={12} />
                        مرفوض
                    </span>
                );
        }
    };

    const pendingCount = subscriptions.filter(s => s.status === "Pending").length;
    const approvedCount = subscriptions.filter(s => s.status === "Approved").length;
    const rejectedCount = subscriptions.filter(s => s.status === "Rejected").length;

    // فلترة الاشتراكات داخل كل كورس
    const getFilteredSubscriptions = (subs: CourseSubscription[]) => {
        return subs.filter(sub => filter === "All" ? true : sub.status === filter);
    };

    // فلترة الكورسات التي تحتوي على اشتراكات مطابقة للفلتر
    const filteredCourseGroups = courseGroups.filter(group => {
        const filtered = getFilteredSubscriptions(group.subscriptions);
        return filtered.length > 0;
    });

    return (
        <div className="space-y-6">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl font-bold shadow-2xl animate-in slide-in-from-top-4 duration-300 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {toast.message}
                    <button onClick={() => setToast(null)} className="mr-4 opacity-70 hover:opacity-100">✕</button>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-2xl p-4 text-center">
                    <p className="text-3xl font-black text-yellow-500">{pendingCount}</p>
                    <p className="text-xs font-bold text-gray-500 mt-1">قيد الانتظار</p>
                </div>
                <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-4 text-center">
                    <p className="text-3xl font-black text-green-500">{approvedCount}</p>
                    <p className="text-xs font-bold text-gray-500 mt-1">مقبول</p>
                </div>
                <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 text-center">
                    <p className="text-3xl font-black text-red-500">{rejectedCount}</p>
                    <p className="text-xs font-bold text-gray-500 mt-1">مرفوض</p>
                </div>
            </div>

            {/* Filter & Toggle All */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <Filter size={16} className="text-gray-500" />
                    {(["All", "Pending", "Approved", "Rejected"] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === status
                                ? 'bg-brand-red text-white'
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
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white/5 text-gray-400 hover:bg-white/10 transition-all"
                >
                    {expandedCourses.size === courseGroups.length ? (
                        <>
                            <ChevronUp size={16} />
                            طي الكل
                        </>
                    ) : (
                        <>
                            <ChevronDown size={16} />
                            توسيع الكل
                        </>
                    )}
                </button>
            </div>

            {/* Courses Groups */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {filteredCourseGroups.length === 0 ? (
                    <div className="text-center py-12 bg-white/5 rounded-2xl">
                        <AlertCircle size={40} className="mx-auto text-gray-600 mb-3" />
                        <p className="text-gray-500 font-bold">لا توجد طلبات اشتراك</p>
                    </div>
                ) : (
                    filteredCourseGroups.map((group) => {
                        const isExpanded = expandedCourses.has(group.courseId);
                        const filteredSubs = getFilteredSubscriptions(group.subscriptions);

                        return (
                            <div
                                key={group.courseId}
                                className="bg-[#0d1117] border border-white/5 rounded-2xl overflow-hidden transition-all"
                            >
                                {/* Course Header */}
                                <button
                                    onClick={() => toggleCourse(group.courseId)}
                                    className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-red to-brand-red/60 flex items-center justify-center text-white shadow-lg">
                                            <BookOpen size={28} />
                                        </div>
                                        <div className="text-right">
                                            <h3 className="font-black text-white text-lg">{group.courseName}</h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                                                    <GraduationCap size={14} />
                                                    {group.educationStageName}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                                                    <Users size={14} />
                                                    {group.subscriptions.length} طالب
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {/* Mini Stats */}
                                        <div className="hidden sm:flex items-center gap-3">
                                            <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/10 text-yellow-500 text-xs font-bold">
                                                <Clock size={12} />
                                                {group.pendingCount}
                                            </span>
                                            <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/10 text-green-500 text-xs font-bold">
                                                <Check size={12} />
                                                {group.approvedCount}
                                            </span>
                                            <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/10 text-red-500 text-xs font-bold">
                                                <X size={12} />
                                                {group.rejectedCount}
                                            </span>
                                        </div>

                                        {/* Expand/Collapse Icon */}
                                        <div className={`p-2 rounded-lg bg-white/5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                            <ChevronDown size={20} className="text-gray-400" />
                                        </div>
                                    </div>
                                </button>

                                {/* Subscriptions List (Collapsible) */}
                                {isExpanded && (
                                    <div className="border-t border-white/5 p-4 space-y-3 bg-black/20">
                                        {filteredSubs.map((subscription) => (
                                            <div
                                                key={subscription.courseSubscriptionId}
                                                className="bg-[#161b22] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all"
                                            >
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    {/* Student Info */}
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-brand-red/10 flex items-center justify-center text-brand-red">
                                                            <User size={20} />
                                                        </div>
                                                        <div className="text-right">
                                                            <h4 className="font-bold text-white">{subscription.studentName}</h4>
                                                            {subscription.studentEmail && subscription.studentEmail !== "No Email" && (
                                                                <p className="text-xs font-medium text-brand-red/80">
                                                                    {subscription.studentEmail}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Status & Actions */}
                                                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                                                        {getStatusBadge(subscription.status)}

                                                        {/* Action buttons */}
                                                        <div className="flex gap-2">
                                                            <Button
                                                                onClick={() => handleStatusChange(subscription.courseSubscriptionId, "Approved")}
                                                                disabled={updatingId === subscription.courseSubscriptionId || subscription.status === "Approved"}
                                                                className={`h-8 px-3 rounded-lg font-bold text-xs transition-all ${subscription.status === "Approved"
                                                                    ? "bg-green-500/20 text-green-500/50 cursor-not-allowed"
                                                                    : "bg-green-500 hover:bg-green-600 text-white"
                                                                    }`}
                                                            >
                                                                {updatingId === subscription.courseSubscriptionId ? (
                                                                    <Loader2 size={12} className="animate-spin" />
                                                                ) : (
                                                                    <>
                                                                        <Check size={12} className="ml-1" />
                                                                        قبول
                                                                    </>
                                                                )}
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleStatusChange(subscription.courseSubscriptionId, "Rejected")}
                                                                disabled={updatingId === subscription.courseSubscriptionId || subscription.status === "Rejected"}
                                                                className={`h-8 px-3 rounded-lg font-bold text-xs transition-all ${subscription.status === "Rejected"
                                                                    ? "bg-red-500/20 text-red-500/50 cursor-not-allowed"
                                                                    : "bg-red-500 hover:bg-red-600 text-white"
                                                                    }`}
                                                            >
                                                                {updatingId === subscription.courseSubscriptionId ? (
                                                                    <Loader2 size={12} className="animate-spin" />
                                                                ) : (
                                                                    <>
                                                                        <X size={12} className="ml-1" />
                                                                        رفض
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Meta */}
                                                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-end text-xs text-gray-500 font-medium">
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock size={12} />
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
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
