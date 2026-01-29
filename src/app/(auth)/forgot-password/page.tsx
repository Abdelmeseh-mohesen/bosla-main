"use client";

import React, { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import Link from "next/link";
import { Mail, Key, Lock, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import Image from "next/image";
import { env } from "@/config/env";

type Step = "email" | "otp" | "password" | "success";

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Step 1: Send OTP
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await fetch(
                `${env.API.FULL_URL}/auth/send-otp?email=${encodeURIComponent(email)}`,
                { method: "POST" }
            );
            const data = await response.json();

            if (data.succeeded) {
                setSuccessMessage("تم إرسال رمز التحقق إلى بريدك الإلكتروني");
                setStep("otp");
            } else {
                setError(data.message || "حدث خطأ أثناء إرسال رمز التحقق");
            }
        } catch {
            setError("تعذر الاتصال بالسيرفر، يرجى المحاولة لاحقاً");
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await fetch(
                `${env.API.FULL_URL}/auth/verify-otp`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, otp }),
                }
            );
            const data = await response.json();

            if (data.succeeded) {
                setSuccessMessage("تم التحقق بنجاح، يمكنك الآن إعادة تعيين كلمة المرور");
                setStep("password");
            } else {
                setError(data.message || "رمز التحقق غير صحيح");
            }
        } catch {
            setError("تعذر الاتصال بالسيرفر، يرجى المحاولة لاحقاً");
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (newPassword !== confirmPassword) {
            setError("كلمات المرور غير متطابقة");
            return;
        }

        if (newPassword.length < 6) {
            setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(
                `${env.API.FULL_URL}/auth/reset-password`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, newPassword }),
                }
            );
            const data = await response.json();

            if (data.succeeded) {
                setStep("success");
            } else {
                setError(data.message || "حدث خطأ أثناء إعادة تعيين كلمة المرور");
            }
        } catch {
            setError("تعذر الاتصال بالسيرفر، يرجى المحاولة لاحقاً");
        } finally {
            setIsLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <div className="flex items-center justify-center gap-2 mb-6">
            {["email", "otp", "password"].map((s, i) => (
                <React.Fragment key={s}>
                    <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === s || (step === "success" && i < 3)
                            ? "bg-red-500 text-white"
                            : ["otp", "password", "success"].indexOf(step) > i - 1 && step !== "email"
                                ? "bg-green-500 text-white"
                                : "bg-white/10 text-gray-500"
                            }`}
                    >
                        {["otp", "password", "success"].indexOf(step) > i ? "✓" : i + 1}
                    </div>
                    {i < 2 && (
                        <div className={`w-12 h-0.5 ${["otp", "password", "success"].indexOf(step) > i ? "bg-green-500" : "bg-white/10"}`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen w-full bg-[#0a0a0f] relative overflow-hidden flex items-center justify-center px-4 py-6">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-purple-500/8 rounded-full blur-[100px]" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-[420px]">
                {/* Logo */}
                <div className="text-center mb-6 animate-slide-up">
                    <div className="inline-block relative mb-4">
                        <div className="absolute -inset-6 bg-red-500/30 rounded-full blur-2xl animate-glow-pulse" />
                        <Image
                            src="/images/bousla-compass.png"
                            alt="بوصلة"
                            width={80}
                            height={80}
                            className="relative animate-spin-slow drop-shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                            priority
                        />
                    </div>
                    <h1 className="text-2xl font-black text-white mb-2">استعادة كلمة المرور</h1>
                    <p className="text-sm text-gray-400">
                        {step === "email" && "أدخل بريدك الإلكتروني لإرسال رمز التحقق"}
                        {step === "otp" && "أدخل رمز التحقق المرسل إلى بريدك"}
                        {step === "password" && "أدخل كلمة المرور الجديدة"}
                        {step === "success" && "تم إعادة تعيين كلمة المرور بنجاح"}
                    </p>
                </div>

                {/* Step Indicator */}
                {step !== "success" && renderStepIndicator()}

                {/* Form Card */}
                <div className="animate-slide-up-delay-1">
                    <div className="relative">
                        <div className="absolute -inset-[1px] bg-gradient-to-r from-red-500/50 via-pink-500/30 to-red-500/50 rounded-2xl opacity-50 blur-sm" />

                        <div className="relative bg-[#0f0f15]/90 backdrop-blur-xl rounded-2xl p-6 border border-white/5">
                            {/* Messages */}
                            {successMessage && step !== "success" && (
                                <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-xl text-center text-sm font-bold mb-4">
                                    ✓ {successMessage}
                                </div>
                            )}
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-center text-sm font-bold mb-4">
                                    {error}
                                </div>
                            )}

                            {/* Step 1: Email */}
                            {step === "email" && (
                                <form onSubmit={handleSendOtp} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-right font-semibold text-gray-400 text-xs">البريد الإلكتروني</label>
                                        <Input
                                            type="email"
                                            placeholder="name@example.com"
                                            icon={<Mail size={18} className="text-gray-500" />}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="h-11 rounded-xl text-sm bg-[#12121a] border-white/5 focus:border-red-500/50"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full h-11 text-sm font-bold rounded-xl bg-gradient-to-r from-red-600 to-red-500"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                            <>
                                                <span>إرسال رمز التحقق</span>
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            )}

                            {/* Step 2: OTP */}
                            {step === "otp" && (
                                <form onSubmit={handleVerifyOtp} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-right font-semibold text-gray-400 text-xs">رمز التحقق</label>
                                        <Input
                                            type="text"
                                            placeholder="أدخل رمز التحقق"
                                            icon={<Key size={18} className="text-gray-500" />}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            required
                                            className="h-11 rounded-xl text-sm bg-[#12121a] border-white/5 focus:border-red-500/50 text-center tracking-[0.5em] font-mono"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full h-11 text-sm font-bold rounded-xl bg-gradient-to-r from-red-600 to-red-500"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                            <>
                                                <span>تحقق</span>
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </Button>
                                    <button
                                        type="button"
                                        onClick={() => { setStep("email"); setSuccessMessage(null); }}
                                        className="w-full text-center text-xs text-gray-500 hover:text-red-400 transition-colors"
                                    >
                                        إعادة إرسال الرمز
                                    </button>
                                </form>
                            )}

                            {/* Step 3: New Password */}
                            {step === "password" && (
                                <form onSubmit={handleResetPassword} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-right font-semibold text-gray-400 text-xs">كلمة المرور الجديدة</label>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            icon={<Lock size={18} className="text-gray-500" />}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            className="h-11 rounded-xl text-sm bg-[#12121a] border-white/5 focus:border-red-500/50"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-right font-semibold text-gray-400 text-xs">تأكيد كلمة المرور</label>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            icon={<Lock size={18} className="text-gray-500" />}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="h-11 rounded-xl text-sm bg-[#12121a] border-white/5 focus:border-red-500/50"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full h-11 text-sm font-bold rounded-xl bg-gradient-to-r from-red-600 to-red-500"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                            <>
                                                <span>إعادة تعيين كلمة المرور</span>
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            )}

                            {/* Success */}
                            {step === "success" && (
                                <div className="text-center py-8">
                                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle size={40} className="text-green-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">تم بنجاح!</h3>
                                    <p className="text-gray-400 text-sm mb-6">تم إعادة تعيين كلمة المرور بنجاح</p>
                                    <Link href="/login">
                                        <Button className="w-full h-11 text-sm font-bold rounded-xl bg-gradient-to-r from-red-600 to-red-500">
                                            تسجيل الدخول
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Back to Login */}
                {step !== "success" && (
                    <div className="text-center mt-6 text-gray-500 text-sm">
                        <Link href="/login" className="text-red-400 font-bold hover:text-red-300 transition-colors">
                            العودة لتسجيل الدخول
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
