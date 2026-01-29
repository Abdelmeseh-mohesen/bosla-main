"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminService } from "@/modules/admin/services/admin.service";
import { useAdminAuth } from "@/modules/admin/hooks/use-admin-auth";
import { StatCard } from "@/modules/admin/components/StatCard";
import { UsersTable } from "@/modules/admin/components/UsersTable";
import { Button } from "@/shared/ui/button";
import {
    LogOut,
    LayoutDashboard,
    RefreshCw,
    Sparkles,
    Shield,
    Activity,
    Cog
} from "lucide-react";
import { Modal } from "@/shared/ui/modal";

export default function AdminDashboardPage() {
    const { user, logout, isLoading: isAuthLoading } = useAdminAuth();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"students" | "teachers" | "parents">("students");
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch all users
    const {
        data: usersResponse,
        isLoading: isLoadingUsers,
        refetch: refetchUsers,
        isFetching: isFetchingUsers
    } = useQuery({
        queryKey: ["adminUsers"],
        queryFn: () => AdminService.getAllUsers(),
        enabled: !!user,
        staleTime: 0, // Data is immediately stale, will refetch on focus/mount
    });

    // Fetch statistics
    const {
        data: statsResponse,
        isLoading: isLoadingStats,
        refetch: refetchStats,
        isFetching: isFetchingStats
    } = useQuery({
        queryKey: ["adminStatistics"],
        queryFn: () => AdminService.getStatistics(),
        enabled: !!user,
        staleTime: 0,
    });

    const isLoading = isAuthLoading || isLoadingUsers || isLoadingStats;
    const isFetching = isFetchingUsers || isFetchingStats || isRefreshing;

    const users = usersResponse?.data || { students: [], teachers: [], parents: [] };
    const stats = statsResponse?.data;

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await Promise.all([
                refetchUsers(),
                refetchStats()
            ]);
        } finally {
            setIsRefreshing(false);
        }
    };

    if (isAuthLoading) {
        return (
            <div className="min-h-screen bg-[#06080a] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-brand-red/30 border-t-brand-red rounded-full animate-spin mx-auto" />
                    <p className="text-gray-400 font-bold">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    // Build stats array for display
    const statsCards = stats ? [
        {
            label: "إجمالي المستخدمين",
            value: stats.totalRegisteredUsers,
            changeMessage: stats.registeredUsersChangeMessage,
            icon: "users" as const,
            color: "red" as const,
        },
        {
            label: "الطلاب",
            value: stats.totalStudents,
            changeMessage: stats.studentsChangeMessage,
            icon: "students" as const,
            color: "blue" as const,
        },
        {
            label: "المعلمين",
            value: stats.totalTeachers,
            changeMessage: stats.teachersChangeMessage,
            icon: "teachers" as const,
            color: "green" as const,
        },
        {
            label: "أولياء الأمور",
            value: stats.totalParents,
            changeMessage: stats.parentsChangeMessage,
            icon: "parents" as const,
            color: "purple" as const,
        },
        {
            label: "الكورسات",
            value: stats.totalCourses,
            changeMessage: stats.coursesChangeMessage,
            icon: "courses" as const,
            color: "orange" as const,
        },
        {
            label: "الامتحانات",
            value: stats.totalExams,
            changeMessage: stats.examsChangeMessage,
            icon: "exams" as const,
            color: "cyan" as const,
        },
    ] : [];

    return (
        <div className="min-h-screen bg-[#06080a] text-white p-4 md:p-8 lg:p-10 font-arabic relative overflow-hidden" dir="rtl">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Main gradient orbs */}
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-brand-red/10 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/8 rounded-full blur-[150px]" />
                <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[120px]" />

                {/* Grid pattern overlay */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '50px 50px'
                    }}
                />
            </div>

            <div className="relative z-10 max-w-[1600px] mx-auto">
                {/* Header Section */}
                <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
                    {/* Left Side - Logo & Welcome */}
                    <div className="flex items-center gap-5">
                        {/* Admin Badge */}
                        <div className="relative group">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-red/30 to-brand-red/5 border border-brand-red/20 flex items-center justify-center shadow-2xl shadow-brand-red/20 group-hover:scale-105 transition-transform duration-500">
                                <Shield size={36} className="text-brand-red" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-[#06080a] rounded-full flex items-center justify-center">
                                <Sparkles size={12} className="text-white" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight">
                                    لوحة تحكم الأدمن
                                </h1>
                                <span className="px-3 py-1.5 bg-brand-red/10 text-brand-red border border-brand-red/20 rounded-full text-sm font-black">
                                    Admin
                                </span>
                            </div>
                            <p className="text-gray-400 font-medium text-base md:text-lg flex items-center gap-2">
                                <Activity size={16} className="text-emerald-400" />
                                مرحباً، {user?.firstName} - إليك نظرة شاملة على المنصة
                            </p>
                        </div>
                    </div>

                    {/* Right Side - Actions */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <Button
                            variant="outline"
                            onClick={handleRefresh}
                            disabled={isFetching}
                            className="h-12 px-5 rounded-2xl border-white/10 hover:bg-white/5 hover:border-white/20 font-bold text-gray-300 transition-all duration-300 flex items-center gap-2"
                        >
                            <RefreshCw size={18} className={isFetching ? "animate-spin" : ""} />
                            <span>{isFetching ? "جاري التحديث..." : "تحديث"}</span>
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => setIsLogoutModalOpen(true)}
                            className="h-12 px-5 rounded-2xl border-white/10 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 font-bold text-gray-400 transition-all duration-300 flex items-center gap-2 group"
                        >
                            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                            <span>تسجيل الخروج</span>
                        </Button>
                    </div>
                </header>

                {/* Statistics Section */}
                <section className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1.5 h-8 bg-gradient-to-b from-brand-red to-rose-600 rounded-full" />
                        <h2 className="text-2xl font-black text-white">الإحصائيات العامة</h2>
                    </div>

                    {isLoadingStats ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div
                                    key={i}
                                    className="h-44 rounded-3xl bg-white/[0.02] border border-white/5 animate-pulse"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {statsCards.map((stat, index) => (
                                <StatCard
                                    key={stat.label}
                                    label={stat.label}
                                    value={stat.value}
                                    changeMessage={stat.changeMessage}
                                    icon={stat.icon}
                                    color={stat.color}
                                    delay={index * 100}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* Users Management Section */}
                <section>
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
                            <h2 className="text-2xl font-black text-white">إدارة المستخدمين</h2>
                        </div>

                        <div className="text-gray-500 text-sm font-bold">
                            إجمالي: {users.students.length + users.teachers.length + users.parents.length} مستخدم
                        </div>
                    </div>

                    {isLoadingUsers ? (
                        <div className="rounded-3xl bg-white/[0.02] border border-white/5 h-96 animate-pulse" />
                    ) : (
                        <UsersTable
                            students={users.students}
                            teachers={users.teachers}
                            parents={users.parents}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            onUserStatusChange={() => refetchUsers()}
                        />
                    )}
                </section>

                {/* Settings Link Section */}
                <section className="mt-12">
                    <a
                        href="/dashboard/admin/settings"
                        className="group relative block p-8 rounded-3xl bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20 hover:border-violet-500/40 transition-all duration-500 overflow-hidden"
                    >
                        {/* Background Glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/30 to-purple-500/20 border border-violet-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                    <Cog size={32} className="text-violet-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white flex items-center gap-3 mb-1">
                                        إعدادات التطبيق
                                        <Sparkles size={18} className="text-violet-400" />
                                    </h3>
                                    <p className="text-gray-400 font-medium">
                                        تحكم في معلومات التطبيق، رقم الدعم، فيديو الشرح، وإعدادات Google
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-violet-400 font-bold">
                                <span className="hidden md:block">الانتقال للإعدادات</span>
                                <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center group-hover:bg-violet-500 group-hover:text-white transition-all duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-180 group-hover:-translate-x-1 transition-transform">
                                        <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </a>
                </section>

                {/* Logout Modal */}
                <Modal
                    isOpen={isLogoutModalOpen}
                    onClose={() => setIsLogoutModalOpen(false)}
                    title="تسجيل الخروج"
                    className="max-w-md"
                >
                    <div className="text-center space-y-6">
                        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto text-rose-500 animate-in zoom-in duration-300">
                            <LogOut size={40} className="mr-1" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-white">هل تود المغادرة؟</h3>
                            <p className="text-gray-400 font-bold">
                                سيتم إنهاء جلستك الحالية وستحتاج لتسجيل الدخول مرة أخرى.
                            </p>
                        </div>
                        <div className="flex gap-4 pt-2">
                            <Button
                                onClick={logout}
                                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white h-12 rounded-xl text-lg font-bold shadow-lg shadow-rose-500/20"
                            >
                                نعم، تسجيل الخروج
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsLogoutModalOpen(false)}
                                className="flex-1 border-white/10 hover:bg-white/5 h-12 rounded-xl text-lg font-bold"
                            >
                                البقاء
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>

            {/* Custom Animation Styles */}
            <style jsx global>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
