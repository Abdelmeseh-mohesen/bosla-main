"use client";

import React from "react";
import { Button } from "@/shared/ui/button";
import Link from "next/link";
import { Clock, ArrowRight, MessageCircle, Mail, Phone } from "lucide-react";
import Image from "next/image";

export default function PendingApprovalPage() {
    const [supportPhone, setSupportPhone] = React.useState<string | null>(null);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        // Try to get support phone from API or localStorage
        const fetchSupport = async () => {
            try {
                const { env } = await import("@/config/env");
                const res = await fetch(`${env.API.FULL_URL}/settings/support-phone`);
                const data = await res.json();
                if (data.succeeded && data.data?.supportPhoneNumber) {
                    setSupportPhone(data.data.supportPhoneNumber);
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchSupport();
    }, []);

    if (!mounted) return <div className="min-h-screen bg-[#0a0a0f]" />;

    return (
        <div className="min-h-screen w-full bg-[#0a0a0f] relative overflow-hidden flex items-center justify-center px-4 py-6 font-arabic" dir="rtl">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-orange-500/8 rounded-full blur-[100px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-[150px]" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-lg text-center">
                {/* Logo */}
                <div className="mb-8 animate-slide-up">
                    <div className="inline-block relative">
                        <div className="absolute -inset-8 bg-yellow-500/20 rounded-full blur-3xl animate-pulse" />
                        <Image
                            src="/images/bousla-compass.png"
                            alt="بوصلة"
                            width={100}
                            height={100}
                            className="relative animate-spin-slow drop-shadow-[0_0_25px_rgba(234,179,8,0.4)]"
                            priority
                        />
                    </div>
                </div>

                {/* Pending Icon */}
                <div className="mb-6 animate-slide-up-delay-1">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-yellow-500/10 border-2 border-yellow-500/30 mx-auto">
                        <Clock size={48} className="text-yellow-500 animate-pulse" />
                    </div>
                </div>

                {/* Message */}
                <div className="space-y-4 mb-8 animate-slide-up-delay-1">
                    <h1 className="text-3xl md:text-4xl font-black text-white">
                        في انتظار الموافقة
                    </h1>
                    <p className="text-lg text-gray-400 leading-relaxed">
                        تم استلام طلب التسجيل كمعلم بنجاح!
                        <br />
                        <span className="text-yellow-500 font-bold">حسابك قيد المراجعة من قبل الإدارة</span>
                    </p>
                </div>

                {/* Info Card */}
                <div className="bg-[#0f0f15]/80 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/20 mb-6 animate-slide-up-delay-2">
                    <div className="space-y-4 text-right">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-yellow-500 font-black">1</span>
                            </div>
                            <div>
                                <h3 className="text-white font-bold">تم استلام طلبك</h3>
                                <p className="text-gray-500 text-sm">سيتم مراجعة بياناتك من قبل فريق الإدارة</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-yellow-500 font-black">2</span>
                            </div>
                            <div>
                                <h3 className="text-white font-bold">انتظار الموافقة</h3>
                                <p className="text-gray-500 text-sm">عادة ما يستغرق الأمر من 24 إلى 48 ساعة</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-green-500 font-black">3</span>
                            </div>
                            <div>
                                <h3 className="text-white font-bold">ابدأ التدريس</h3>
                                <p className="text-gray-500 text-sm">بمجرد الموافقة، يمكنك البدء فوراً</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Support */}
                <div className="bg-white/5 rounded-2xl p-4 mb-6 animate-slide-up-delay-3">
                    <p className="text-gray-400 text-sm mb-3">للاستفسار أو المتابعة، تواصل مع الدعم:</p>
                    <div className="flex justify-center gap-4">
                        {supportPhone && (
                            <a
                                href={`https://wa.me/${supportPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-xl text-green-500 hover:bg-green-500/20 transition-colors text-sm font-bold"
                            >
                                <MessageCircle size={16} />
                                واتساب
                            </a>
                        )}
                        <a
                            href="mailto:support@bousla.com"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-xl text-blue-500 hover:bg-blue-500/20 transition-colors text-sm font-bold"
                        >
                            <Mail size={16} />
                            البريد
                        </a>
                    </div>
                </div>

                {/* Back to Login */}
                <div className="animate-slide-up-delay-3">
                    <Link href="/login">
                        <Button
                            variant="outline"
                            className="w-full h-12 rounded-xl border-white/10 hover:bg-white/5 text-gray-400 font-bold gap-2"
                        >
                            <ArrowRight size={18} />
                            العودة لتسجيل الدخول
                        </Button>
                    </Link>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center animate-slide-up-delay-3">
                    <p className="text-gray-600 text-xs flex items-center justify-center gap-2">
                        <span className="text-yellow-500">✦</span>
                        منصة بوصلة التعليمية
                        <span className="text-yellow-500">✦</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
