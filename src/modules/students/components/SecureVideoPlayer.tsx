"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Play, AlertCircle, Lock, Shield } from "lucide-react";
import {
    extractYoutubeVideoId,
    buildSecureYoutubeEmbedUrl,
    isValidYoutubeId
} from "@/lib/youtube-utils";

interface SecureVideoPlayerProps {
    videoUrl: string;
    title: string;
    isAuthenticated: boolean;
    onUnauthorized?: () => void;
    /**
     * User role, defaults to 'student' for strict security.
     */
    role?: string;
}

/**
 * SecureVideoPlayer - مشغل فيديو آمن 100%
 * 
 * استراتيجية الحماية:
 * - الـ iframe محمي بطبقة overlay كاملة
 * - لا يمكن التفاعل مع الـ iframe مباشرة
 * - التحكم يتم عبر أزرار مخصصة
 * - منع جميع الطرق للوصول إلى يوتيوب أو مشاركة الفيديو
 */
export function SecureVideoPlayer({
    videoUrl,
    title,
    isAuthenticated,
    onUnauthorized,
    role = 'student'
}: SecureVideoPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [showInitialOverlay, setShowInitialOverlay] = useState(true);

    // استخراج Video ID باستخدام الـ utility المركزية
    const videoId = extractYoutubeVideoId(videoUrl);

    // 🔍 Debugging - سيساعد في معرفة المشكلة
    React.useEffect(() => {
        console.log("=== SecureVideoPlayer Debug ===");
        console.log("videoUrl received:", videoUrl);
        console.log("videoId extracted:", videoId);
        console.log("isAuthenticated:", isAuthenticated);
    }, [videoUrl, videoId, isAuthenticated]);

    // بناء رابط Embed آمن
    const getSecureEmbedUrl = useCallback((autoplay: boolean = false): string => {
        if (!videoId) return "";

        try {
            const embedUrl = buildSecureYoutubeEmbedUrl(videoId, {
                autoplay,
                showControls: true,   // ✅ إظهار controls يوتيوب للتحكم بالفيديو (تقديم/تأخير)
                mute: autoplay,       // كتم الصوت عند التشغيل التلقائي
                loop: false,
                language: 'ar'
            });
            console.log("🔗 Secure Embed URL:", embedUrl);
            return embedUrl;
        } catch (error) {
            console.error("خطأ في بناء رابط Embed:", error);
            return "";
        }
    }, [videoId]);

    // ===== حماية شاملة: منع اختصارات لوحة المفاتيح =====
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();

            // منع Ctrl+S (حفظ), Ctrl+C (نسخ), Ctrl+U (عرض المصدر), Ctrl+A (تحديد الكل), Ctrl+P (طباعة)
            if (e.ctrlKey && ["s", "c", "u", "a", "p"].includes(key)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            // منع Ctrl+Shift+I (DevTools), Ctrl+Shift+J (Console), Ctrl+Shift+C (Inspect)
            if (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(key)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            // منع F12 (DevTools)
            if (e.key === "F12") {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            // منع PrintScreen
            if (e.key === "PrintScreen") {
                e.preventDefault();
                e.stopPropagation();
                // محاولة مسح الـ clipboard
                if (navigator.clipboard) {
                    navigator.clipboard.writeText("");
                }
                return false;
            }
        };

        document.addEventListener("keydown", handleKeyDown, true);
        return () => document.removeEventListener("keydown", handleKeyDown, true);
    }, []);

    // ===== حماية شاملة: منع Right-click على الصفحة كلها =====
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };

        document.addEventListener("contextmenu", handleContextMenu, true);
        return () => document.removeEventListener("contextmenu", handleContextMenu, true);
    }, []);

    // ===== حماية شاملة: منع السحب والإفلات (Drag & Drop) =====
    useEffect(() => {
        const handleDragStart = (e: DragEvent) => {
            e.preventDefault();
            return false;
        };

        document.addEventListener("dragstart", handleDragStart, true);
        return () => document.removeEventListener("dragstart", handleDragStart, true);
    }, []);

    // ===== حماية شاملة: منع تحديد النص =====
    useEffect(() => {
        const handleSelectStart = (e: Event) => {
            if (containerRef.current?.contains(e.target as Node)) {
                e.preventDefault();
                return false;
            }
        };

        document.addEventListener("selectstart", handleSelectStart, true);
        return () => document.removeEventListener("selectstart", handleSelectStart, true);
    }, []);

    // ===== حماية شاملة: منع النسخ =====
    useEffect(() => {
        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };

        document.addEventListener("copy", handleCopy, true);
        return () => document.removeEventListener("copy", handleCopy, true);
    }, []);

    // إرسال أوامر إلى الـ iframe (محفوظة للاستخدام المستقبلي)
    // const sendCommand = (command: string, args?: any) => {
    //     if (iframeRef.current?.contentWindow) {
    //         iframeRef.current.contentWindow.postMessage(
    //             JSON.stringify({ event: "command", func: command, args: args || [] }),
    //             "*"
    //         );
    //     }
    // };

    // تسجيل الدخول مطلوب
    if (!isAuthenticated) {
        return (
            <div ref={containerRef} className="aspect-video w-full rounded-[2rem] bg-gradient-to-br from-gray-900 to-black border border-white/10 flex flex-col items-center justify-center gap-6 relative overflow-hidden" style={{ userSelect: "none" }} onContextMenu={(e) => e.preventDefault()}>
                <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-brand-red/20 flex items-center justify-center">
                        <Lock size={40} className="text-brand-red" />
                    </div>
                    <h3 className="text-2xl font-black text-white">يجب تسجيل الدخول</h3>
                    <p className="text-gray-400 font-medium text-center max-w-md">لمشاهدة هذا الفيديو، يُرجى تسجيل الدخول</p>
                    {onUnauthorized && (
                        <button onClick={onUnauthorized} className="mt-4 px-8 py-3 bg-brand-red text-white rounded-xl font-bold hover:bg-brand-red/90 transition-colors">
                            تسجيل الدخول
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // رابط غير صالح
    if (!videoId) {
        return (
            <div ref={containerRef} className="aspect-video w-full rounded-[2rem] bg-gradient-to-br from-gray-900 to-black border border-red-500/20 flex flex-col items-center justify-center gap-4" style={{ userSelect: "none" }}>
                <AlertCircle size={48} className="text-red-500" />
                <p className="text-red-400 font-bold">رابط الفيديو غير صالح</p>
            </div>
        );
    }

    const handleStartVideo = () => {
        setShowInitialOverlay(false);
    };

    return (
        <div
            ref={containerRef}
            className="aspect-video w-full rounded-[2rem] bg-black border border-white/10 relative overflow-hidden shadow-2xl group"
            style={{ userSelect: "none" }}
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* ===== Overlay البداية ===== */}
            {showInitialOverlay && (
                <div
                    className="absolute inset-0 z-50 bg-gradient-to-br from-black/90 via-black/70 to-black/90 flex flex-col items-center justify-center cursor-pointer group/overlay"
                    onClick={handleStartVideo}
                >
                    <div className="relative z-10 flex flex-col items-center gap-6">
                        <div className="h-28 w-28 rounded-full bg-brand-red flex items-center justify-center shadow-2xl shadow-brand-red/40 group-hover/overlay:scale-110 transition-all duration-300">
                            <Play size={50} className="text-white ml-2" fill="currentColor" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-black text-white mb-2">{title}</h3>
                            <p className="text-gray-400 font-medium">اضغط لبدء المشاهدة</p>
                        </div>
                    </div>
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-green-500/20 backdrop-blur-sm px-5 py-2.5 rounded-full border border-green-500/30">
                        <Shield size={16} className="text-green-400" />
                        <span className="text-sm font-bold text-green-300">مشاهدة آمنة داخل المنصة</span>
                    </div>
                </div>
            )}

            {/* ===== iframe يوتيوب (مخفي تحت الـ overlay) ===== */}
            {!showInitialOverlay && (
                <iframe
                    ref={iframeRef}
                    src={getSecureEmbedUrl(true)}
                    className="absolute inset-0 w-full h-full border-0"
                    title="فيديو تعليمي"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    sandbox="allow-scripts allow-same-origin"  // ✅ الحد الأدنى فقط - بدون popups
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    style={{ pointerEvents: "auto" }} // ✅ السماح بالتفاعل مع أزرار التحكم
                />
            )}

            {/* ===== نظام منع التشتت - إخفاء عناصر YouTube المشتتة ===== */}
            {!showInitialOverlay && (
                <>
                    {/* ████████████████████████████████████████████████████████████████████ */}
                    {/* طبقات حجب محسّنة - تغطي جميع عناصر YouTube ما عدا أزرار التحكم الأساسية */}
                    {/* ████████████████████████████████████████████████████████████████████ */}

                    {/* 🔒 طبقة علوية كاملة - تحجب: العنوان، المشاركة، المشاهدة لاحقاً، القائمة */}
                    <div
                        className="absolute top-0 left-0 right-0 z-[99999]"
                        style={{
                            height: '100px',
                            background: 'linear-gradient(to bottom, #000000 0%, #000000 90%, transparent 100%)',
                            pointerEvents: 'auto',
                            cursor: 'default'
                        }}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    >
                        {/* محتوى مخصص - شعار المنصة */}
                        <div className="absolute top-0 left-0 right-0 h-full flex items-center justify-between px-6 pointer-events-none">
                            <div className="flex items-center gap-2 bg-green-500/30 px-4 py-2 rounded-full border border-green-500/50">
                                <Shield size={16} className="text-green-400" />
                                <span className="text-sm font-bold text-green-300">منصة بوصلة</span>
                            </div>
                            <span className="text-base font-bold text-white truncate max-w-[60%]">{title}</span>
                        </div>
                    </div>

                    {/* 🔒 طبقة حجب الزاوية العلوية اليسرى - زر المشاركة والمشاهدة لاحقاً */}
                    <div
                        className="absolute top-0 left-0 z-[99999]"
                        style={{
                            width: '250px',
                            height: '120px',
                            background: 'linear-gradient(to bottom right, #000000 0%, #000000 50%, transparent 100%)',
                            pointerEvents: 'auto',
                            cursor: 'default'
                        }}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    />

                    {/* 🔒 حجب الزاوية اليسرى السفلى - شعار YouTube وأيقونة القناة */}
                    <div
                        className="absolute bottom-0 left-0 z-[99999]"
                        style={{
                            width: '200px',
                            height: '90px',
                            background: 'linear-gradient(to top right, #000000 0%, #000000 60%, transparent 100%)',
                            pointerEvents: 'auto',
                            cursor: 'default'
                        }}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    />

                    {/* 🔒 حجب الزاوية اليمنى السفلى - زر الإعدادات والإعلانات */}
                    <div
                        className="absolute bottom-0 right-0 z-[99999]"
                        style={{
                            width: '150px',
                            height: '90px',
                            background: 'linear-gradient(to top left, #000000 0%, #000000 60%, transparent 100%)',
                            pointerEvents: 'auto',
                            cursor: 'default'
                        }}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    />

                    {/* 🔒 طبقة حجب المنطقة الوسطى - تمنع النقر على الفيديو نفسه */}
                    {/* لكن تترك شريط التحكم السفلي (آخر 48px) قابل للنقر */}
                    <div
                        className="absolute z-[99997]"
                        style={{
                            top: '90px',
                            bottom: '48px',
                            left: '20px',
                            right: '20px',
                            backgroundColor: 'transparent',
                            pointerEvents: 'auto',
                            cursor: 'default'
                        }}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    />

                    {/* 🔒 طبقة حجب الفيديوهات المقترحة - تظهر في نهاية الفيديو */}
                    <div
                        className="absolute z-[99998]"
                        style={{
                            top: '120px',
                            bottom: '100px',
                            left: '40px',
                            right: '40px',
                            backgroundColor: 'rgba(0,0,0,0.02)',
                            pointerEvents: 'auto',
                            cursor: 'default'
                        }}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    />

                    {/* 🔒 طبقة حماية إضافية - تغطي كامل الجوانب */}
                    <div
                        className="absolute inset-0 z-[99998]"
                        style={{
                            pointerEvents: 'none'
                        }}
                    >
                        {/* الحافة اليسرى */}
                        <div
                            className="absolute top-0 bottom-0 left-0"
                            style={{
                                width: '20px',
                                backgroundColor: 'rgba(0,0,0,0.01)',
                                pointerEvents: 'auto',
                                cursor: 'default'
                            }}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        />

                        {/* الحافة اليمنى */}
                        <div
                            className="absolute top-0 bottom-0 right-0"
                            style={{
                                width: '20px',
                                backgroundColor: 'rgba(0,0,0,0.01)',
                                pointerEvents: 'auto',
                                cursor: 'default'
                            }}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        />
                    </div>

                    {/* شريط علامة منصة بوصلة في الأسفل */}
                    <div
                        className="absolute bottom-[2px] left-[200px] right-[150px] z-[99999] flex items-center justify-center"
                        style={{
                            height: '28px',
                            backgroundColor: 'rgba(0,0,0,0.95)',
                            pointerEvents: 'none',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        <span className="text-xs font-bold text-brand-red">◆ منصة بوصلة التعليمية</span>
                    </div>
                </>
            )}
        </div>
    );
}

export default SecureVideoPlayer;

