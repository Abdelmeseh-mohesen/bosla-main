"use client";

import React from "react";
import Link from "next/link";
import { useAdminAuth } from "@/modules/admin/hooks/use-admin-auth";
import { AppInfoSettings } from "@/modules/admin/components/AppInfoSettings";
import { Button } from "@/shared/ui/button";
import {
    ArrowRight,
    Shield,
    Sparkles,
    Settings,
    Palette,
    Bell,
    Lock,
    Database,
    Globe,
    Smartphone
} from "lucide-react";

export default function AdminSettingsPage() {
    const { user, isLoading: isAuthLoading } = useAdminAuth();

    if (isAuthLoading) {
        return (
            <div className="min-h-screen bg-[#06080a] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto" />
                    <p className="text-gray-400 font-bold">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#06080a] text-white p-4 md:p-8 lg:p-10 font-arabic relative overflow-hidden" dir="rtl">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Main gradient orbs */}
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-violet-600/15 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px]" />
                <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-pink-600/5 rounded-full blur-[120px]" />

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

                {/* Floating particles */}
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-violet-500/40 rounded-full animate-float"
                        style={{
                            left: `${10 + i * 12}%`,
                            top: `${20 + (i % 3) * 25}%`,
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: `${6 + i}s`
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 max-w-[1200px] mx-auto">
                {/* Header Section */}
                <header className="mb-10">
                    {/* Back Button */}
                    <Link href="/dashboard/admin">
                        <Button
                            variant="ghost"
                            className="mb-6 h-12 px-5 rounded-2xl text-gray-400 hover:text-white hover:bg-white/5 font-bold transition-all duration-300 flex items-center gap-2 group"
                        >
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            <span>العودة للوحة التحكم</span>
                        </Button>
                    </Link>

                    {/* Page Title */}
                    <div className="flex items-center gap-5">
                        {/* Settings Badge */}
                        <div className="relative group">
                            <div className="absolute -inset-2 bg-violet-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/30 to-purple-500/10 border border-violet-500/20 flex items-center justify-center shadow-2xl shadow-violet-500/20 group-hover:scale-105 transition-transform duration-500">
                                <Settings size={36} className="text-violet-400 animate-spin-slow" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-[#06080a] rounded-full flex items-center justify-center">
                                <Sparkles size={12} className="text-white" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight">
                                    إعدادات التطبيق
                                </h1>
                                <span className="px-3 py-1.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full text-sm font-black">
                                    Settings
                                </span>
                            </div>
                            <p className="text-gray-400 font-medium text-base md:text-lg flex items-center gap-2">
                                <Shield size={16} className="text-violet-400" />
                                تحكم كامل في إعدادات المنصة ومعلومات التطبيق
                            </p>
                        </div>
                    </div>
                </header>

                {/* Quick Settings Cards */}
                <section className="mb-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: Palette, label: "المظهر", desc: "قريباً", color: "from-pink-500 to-rose-500" },
                            { icon: Bell, label: "الإشعارات", desc: "قريباً", color: "from-amber-500 to-orange-500" },
                            { icon: Lock, label: "الأمان", desc: "قريباً", color: "from-emerald-500 to-green-500" },
                            { icon: Database, label: "النسخ الاحتياطي", desc: "قريباً", color: "from-blue-500 to-cyan-500" },
                        ].map((item, index) => (
                            <div
                                key={item.label}
                                className="group relative p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300 cursor-not-allowed opacity-60"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} bg-opacity-10 flex items-center justify-center mb-3`}>
                                    <item.icon size={24} className="text-white/80" />
                                </div>
                                <h4 className="text-white font-bold">{item.label}</h4>
                                <p className="text-gray-500 text-sm font-medium">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Main Settings Section */}
                <section className="space-y-8">
                    {/* Section Header */}
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-gradient-to-b from-violet-500 to-purple-600 rounded-full" />
                        <h2 className="text-2xl font-black text-white flex items-center gap-3">
                            <Globe className="text-violet-400" size={24} />
                            معلومات التطبيق الأساسية
                        </h2>
                    </div>

                    {/* App Info Settings Component */}
                    <AppInfoSettings />

                    {/* Additional Info Card */}
                    <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-500/5 to-purple-500/5 border border-violet-500/10">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                                <Smartphone size={24} className="text-violet-400" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-lg mb-1">ملاحظة مهمة</h4>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    التغييرات التي تقوم بها هنا ستنعكس على التطبيق فوراً. تأكد من مراجعة البيانات قبل الحفظ.
                                    رقم الدعم الفني سيظهر في قسم المساعدة، وفيديو الشرح سيظهر للمستخدمين الجدد.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="mt-16 pt-8 border-t border-white/5 text-center">
                    <p className="text-gray-600 text-sm font-medium flex items-center justify-center gap-2">
                        <Sparkles size={14} className="text-violet-400" />
                        منصة بوصلة التعليمية - لوحة تحكم المسؤول
                        <Sparkles size={14} className="text-violet-400" />
                    </p>
                </footer>
            </div>

            {/* Custom Animation Styles */}
            <style jsx global>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0) translateX(0);
                    }
                    50% {
                        transform: translateY(-20px) translateX(10px);
                    }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-spin-slow {
                    animation: spin 8s linear infinite;
                }
            `}</style>
        </div>
    );
}
