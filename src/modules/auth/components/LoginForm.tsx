"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, LoginFormValues } from "../types/auth.schemas";
import { AuthService } from "../services/auth.service";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import Link from "next/link";
import { Mail, Lock, LogIn, Loader2, MessageCircle, PlayCircle } from "lucide-react";
import Image from "next/image";
import { env } from "@/config/env";

// Google Icon Component
const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" className="mr-2">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

export function LoginForm() {
    const router = useRouter();
    const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
    const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
    const [mounted, setMounted] = React.useState(false);
    const [supportPhone, setSupportPhone] = React.useState<string | null>(null);
    const [explanationVideo, setExplanationVideo] = React.useState<string | null>(null);
    const [showVideoModal, setShowVideoModal] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        const message = sessionStorage.getItem("loginMessage");
        if (message) {
            setSuccessMessage(message);
            sessionStorage.removeItem("loginMessage");
        }

        // Fetch support phone
        fetch(`${env.API.FULL_URL}/settings/support-phone`)
            .then(res => res.json())
            .then(data => {
                if (data.succeeded && data.data?.supportPhoneNumber) {
                    setSupportPhone(data.data.supportPhoneNumber);
                }
            })
            .catch(console.error);

        // Fetch explanation video
        fetch(`${env.API.FULL_URL}/settings/explanation-video`)
            .then(res => res.json())
            .then(data => {
                if (data.succeeded && data.data?.explanationVideoUrl) {
                    setExplanationVideo(data.data.explanationVideoUrl);
                }
            })
            .catch(console.error);
    }, []);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(LoginSchema),
        defaultValues: { email: "", password: "" },
    });

    const [apiError, setApiError] = React.useState<string | null>(null);

    const handleRedirect = (user: any) => {
        const hasValidRole = user.roles && user.roles.length > 0 &&
            (user.roles.includes("Admin") || user.roles.includes("Teacher") ||
                user.roles.includes("Student") || user.roles.includes("Assistant") ||
                user.roles.includes("Parent"));

        if (!hasValidRole) {
            router.push("/auth/complete-profile");
            return;
        }

        // Check if teacher is approved (isBlocked = true means not approved yet)
        if (user.roles?.includes("Teacher")) {
            // If teacher is blocked or not approved, redirect to pending approval page
            if (user.isBlocked === true || user.isApproved === false) {
                router.push("/auth/pending-approval");
                return;
            }
        }

        if (user.roles?.includes("Admin")) router.push("/dashboard/admin");
        else if (user.roles?.includes("Teacher")) router.push("/dashboard/teacher");
        else if (user.roles?.includes("Assistant")) router.push("/dashboard/teacher");
        else if (user.roles?.includes("Parent")) router.push("/dashboard/parent");
        else if (user.roles?.includes("Student")) router.push("/dashboard/student");
        else router.push("/dashboard");
    };

    const { isPending, mutate } = useMutation({
        mutationFn: AuthService.login,
        onSuccess: (response) => {
            if (response.succeeded) handleRedirect(response.data);
            else setApiError(response.message || "حدث خطأ ما في تسجيل الدخول");
        },
        onError: (error: any) => {
            setApiError(error.response?.data?.message || "تعذر الاتصال بالسيرفر، يرجى المحاولة لاحقاً");
        }
    });

    const onSubmit = (data: LoginFormValues) => {
        setApiError(null);
        mutate(data);
    };

    const handleGoogleSignIn = async () => {
        setApiError(null);
        setIsGoogleLoading(true);
        try {
            const response = await AuthService.signInWithGoogle();
            if (response.succeeded) handleRedirect(response.data);
            else setApiError(response.message || "فشل تسجيل الدخول بـ Google");
        } catch (error: any) {
            // Check for 400 status (Blocked/Pending Approval)
            if (error.response?.status === 400) {
                router.push("/auth/pending-approval");
                return;
            }
            setApiError(error.message || error.response?.data?.message || "فشل تسجيل الدخول بـ Google");
        } finally {
            setIsGoogleLoading(false);
        }
    };

    if (!mounted) return <div className="min-h-screen bg-[#0a0a0f]" />;

    return (
        <div className="min-h-screen w-full bg-[#0a0a0f] relative overflow-hidden flex items-center justify-center px-4 py-6">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Gradient Orbs */}
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px] animate-morph" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-purple-500/8 rounded-full blur-[100px] animate-morph" style={{ animationDelay: '4s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[150px]" />

                {/* Subtle Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '60px 60px'
                }} />

                {/* Floating Particles */}
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-red-500/40 rounded-full animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${8 + Math.random() * 8}s`,
                        }}
                    />
                ))}
            </div>

            {/* Main Content Container */}
            <div className="relative z-10 w-full max-w-[420px]">
                {/* Logo & Branding - Top */}
                <div className="text-center mb-6 animate-slide-up">
                    <div className="inline-block relative mb-4">
                        {/* Glow Effect */}
                        <div className="absolute -inset-6 bg-red-500/30 rounded-full blur-2xl animate-glow-pulse" />
                        <Image
                            src="/images/bousla-compass.png"
                            alt="بوصلة"
                            width={120}
                            height={120}
                            className="relative animate-spin-slow drop-shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                            priority
                        />
                    </div>
                    <h1 className="text-2xl font-black text-white mb-2">تسجيل الدخول</h1>
                    <p className="text-sm text-gray-400">
                        <span className="text-red-400 font-bold">منصة بوصلة</span>
                        <span className="mx-2 text-gray-600">|</span>
                        <span>وجهتك نحو التفوق</span>
                    </p>
                </div>

                {/* Form Card */}
                <div className="animate-slide-up-delay-1">
                    <div className="relative">
                        {/* Animated Border Glow */}
                        <div className="absolute -inset-[1px] bg-gradient-to-r from-red-500/50 via-pink-500/30 to-red-500/50 rounded-2xl opacity-50 blur-sm" />

                        {/* Card Content */}
                        <div className="relative bg-[#0f0f15]/90 backdrop-blur-xl rounded-2xl p-5 border border-white/5">
                            {successMessage && (
                                <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-xl text-center text-sm font-bold mb-4 animate-scale-in">
                                    ✓ {successMessage}
                                </div>
                            )}

                            {apiError && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-center text-sm font-bold mb-4 animate-scale-in">
                                    {apiError}
                                </div>
                            )}

                            {/* Google Sign-In */}
                            <Button
                                type="button"
                                onClick={handleGoogleSignIn}
                                disabled={isGoogleLoading || isPending}
                                className="w-full h-10 bg-white hover:bg-gray-100 text-gray-700 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] shadow-lg text-sm"
                            >
                                {isGoogleLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <GoogleIcon />
                                        <span>الدخول بحساب Google</span>
                                    </>
                                )}
                            </Button>

                            {/* Divider */}
                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="px-3 bg-[#0f0f15] text-gray-600 text-xs font-medium">أو</span>
                                </div>
                            </div>

                            {/* Login Form */}
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                                <div className="space-y-1.5">
                                    <label className="block text-right font-semibold text-gray-400 text-xs mr-1">البريد الإلكتروني</label>
                                    <Input
                                        type="email"
                                        placeholder="name@example.com"
                                        icon={<Mail size={18} className="text-gray-500" />}
                                        {...form.register("email")}
                                        className="h-11 rounded-xl text-sm bg-[#12121a] border-white/5 focus:border-red-500/50 transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center px-1">
                                        <Link href="/forgot-password" className="text-xs text-red-400 font-semibold hover:text-red-300 transition-colors">
                                            نسيت كلمة المرور؟
                                        </Link>
                                        <label className="font-semibold text-gray-400 text-xs">كلمة المرور</label>
                                    </div>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        icon={<Lock size={18} className="text-gray-500" />}
                                        {...form.register("password")}
                                        className="h-11 rounded-xl text-sm bg-[#12121a] border-white/5 focus:border-red-500/50 transition-all"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-10 text-sm font-bold rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-500/20 transition-all duration-300 hover:shadow-red-500/30 hover:scale-[1.02] mt-1"
                                    isLoading={isPending}
                                    disabled={isGoogleLoading}
                                >
                                    <LogIn size={16} />
                                    <span>دخول</span>
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Register Link */}
                <div className="text-center mt-4 text-gray-500 text-sm animate-slide-up-delay-2">
                    ليس لديك حساب؟{" "}
                    <Link href="/register" className="text-red-400 font-bold hover:text-red-300 transition-colors">
                        إنشاء حساب جديد
                    </Link>
                </div>

                {/* Support & Help Buttons */}
                <div className="flex justify-center gap-6 mt-4 animate-slide-up-delay-3">
                    {supportPhone && (
                        <a
                            href={`https://wa.me/${supportPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-gray-500 hover:text-green-400 text-xs transition-all"
                        >
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            <span>الدعم</span>
                        </a>
                    )}
                    {explanationVideo && (
                        <button
                            onClick={() => setShowVideoModal(true)}
                            className="flex items-center gap-1 text-gray-500 hover:text-blue-400 text-xs transition-all"
                        >
                            <PlayCircle size={14} />
                            <span>شرح المنصة</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Footer Branding */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center animate-slide-up-delay-3">
                <p className="text-gray-600 text-xs flex items-center gap-2">
                    <span className="text-red-500">✦</span>
                    منصة بوصلة التعليمية
                    <span className="text-red-500">✦</span>
                </p>
            </div>

            {/* Video Modal */}
            {showVideoModal && explanationVideo && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setShowVideoModal(false)}
                >
                    <div
                        className="relative w-full max-w-4xl animate-scale-in"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Glow effect behind the modal */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-red-500/20 via-pink-500/10 to-red-500/20 rounded-3xl blur-2xl" />

                        {/* Modal content */}
                        <div className="relative bg-gradient-to-b from-[#151520] to-[#0a0a0f] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                                        <PlayCircle size={20} className="text-red-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-white text-lg font-bold">شرح المنصة</h3>
                                        <p className="text-gray-500 text-xs">تعرف على كيفية استخدام منصة بوصلة</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowVideoModal(false)}
                                    className="w-8 h-8 bg-white/5 hover:bg-red-500/20 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all"
                                >
                                    <svg width="16\" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Video container */}
                            <div className="p-4">
                                <div className="relative rounded-xl overflow-hidden bg-black">
                                    <video
                                        src={explanationVideo}
                                        controls
                                        autoPlay
                                        className="w-full aspect-video"
                                        controlsList="nodownload"
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between">
                                <p className="text-gray-500 text-xs flex items-center gap-2">
                                    <span className="text-red-500">✦</span>
                                    منصة بوصلة التعليمية
                                </p>
                                <button
                                    onClick={() => setShowVideoModal(false)}
                                    className="text-xs text-gray-400 hover:text-white transition-colors"
                                >
                                    إغلاق
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
