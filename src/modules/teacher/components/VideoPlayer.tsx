"use client";

import React from "react";
import { XCircle, Lock, Play } from "lucide-react";
import { extractYoutubeVideoId, buildSecureYoutubeEmbedUrl } from "@/lib/youtube-utils";

interface VideoPlayerProps {
    url: string;
    title?: string;
}

/**
 * VideoPlayer - مشغل فيديو آمن للمعلم (معاينة الفيديوهات)
 * يستخدم نفس إعدادات الأمان للتأكد من شكل الفيديو للطلاب
 */
export function VideoPlayer({ url, title = "معاينة الفيديو" }: VideoPlayerProps) {
    const videoId = extractYoutubeVideoId(url);

    if (!videoId) {
        return (
            <div className="w-full aspect-video flex flex-col items-center justify-center text-gray-500 gap-4 bg-black/50 rounded-2xl border border-red-500/20">
                <XCircle size={64} className="text-red-500" />
                <p className="text-xl font-bold text-red-400">رابط الفيديو غير صالح</p>
                <p className="text-sm text-gray-500">تأكد من أن الرابط صحيح (YouTube)</p>
            </div>
        );
    }

    // بناء رابط Embed آمن للمعلم (مع controls للمعاينة)
    const getTeacherEmbedUrl = (): string => {
        try {
            return buildSecureYoutubeEmbedUrl(videoId, {
                autoplay: false,
                showControls: true,  // ✅ إظهار controls للمعلم فقط
                mute: false,
                loop: false,
                language: 'ar'
            });
        } catch (error) {
            console.error("خطأ في بناء رابط Embed:", error);
            return "";
        }
    };

    return (
        <div
            className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl group"
            onContextMenu={(e) => e.preventDefault()}
            style={{ userSelect: "none" }}
        >
            {/* الطبقة العلوية المانعة للنسخ والمشاركة */}
            <div
                className="absolute top-0 left-0 right-0 h-[60px] z-30"
                style={{ background: "transparent" }}
                onClick={(e) => e.stopPropagation()}
            />

            {/* مشغل الفيديو الآمن */}
            <iframe
                src={getTeacherEmbedUrl()}
                className="w-full h-full relative z-10"
                title={title}
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                sandbox="allow-scripts allow-same-origin"  // ✅ الحد الأدنى فقط - بدون popups
                referrerPolicy="strict-origin-when-cross-origin"
                style={{ border: 0 }}
                loading="lazy"
            />

            {/* حماية شعار يوتيوب السفلي */}
            <div
                className="absolute bottom-12 right-0 w-[100px] h-[40px] z-20"
                style={{ background: "transparent" }}
                onClick={(e) => e.stopPropagation()}
            />

            {/* شريط التشغيل الآمن */}
            <div className="absolute top-3 left-3 z-40 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-white/80">معاينة آمنة</span>
            </div>
        </div>
    );
}

export default VideoPlayer;
