"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, Lock, Loader2 } from "lucide-react";
import { extractYoutubeVideoId, buildSecureYoutubeEmbedUrl } from "@/lib/youtube-utils";

interface SecureVideoPlayerProps {
    videoUrl: string; // Could be YouTube URL or HLS (.m3u8) or MP4
    title: string;
    isAuthenticated: boolean;
    onUnauthorized?: () => void;
    role?: string;
    studentName?: string;
    studentId?: number;
}

export function SecureVideoPlayer({
    videoUrl,
    title,
    isAuthenticated,
    onUnauthorized,
    role = 'student',
    studentName,
    studentId
}: SecureVideoPlayerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [secureUrl, setSecureUrl] = useState<string | null>(null);
    const [isYouTube, setIsYouTube] = useState(false);

    // Watermark State
    const [watermarkContent, setWatermarkContent] = useState<string>("");
    const [watermarkPosition, setWatermarkPosition] = useState({ top: "20%", left: "20%" });

    // 1. Prepare URL
    useEffect(() => {
        if (!videoUrl || !isAuthenticated) return;
        setIsLoading(true);

        const videoId = extractYoutubeVideoId(videoUrl);
        if (videoId) {
            setIsYouTube(true);
            try {
                // Use strict student security options (no controls if desired, or limited)
                // The teacher view had "showControls: true". User said "As it appeared to the teacher".
                // So we will use showControls: true.
                const embedUrl = buildSecureYoutubeEmbedUrl(videoId, {
                    autoplay: false,
                    showControls: true,
                    mute: false,
                    loop: false,
                    language: 'ar',
                    // extra security measures are internal to helper
                });
                setSecureUrl(embedUrl);
            } catch (e) {
                console.error(e);
                setError("فشل تحميل الفيديو");
            }
        } else {
            setIsYouTube(false);
            setSecureUrl(videoUrl); // Fallback for MP4/HLS if not youtube, though Teacher view was YT only.
        }
        setIsLoading(false);
    }, [videoUrl, isAuthenticated]);


    // 2. Dynamic Watermark Logic
    useEffect(() => {
        const updateWatermark = () => {
            const time = new Date().toLocaleTimeString('ar-EG');
            const info = `${studentName || 'Student'} | ${studentId || 'ID'} \n ${time}`;
            setWatermarkContent(info);

            const top = Math.floor(Math.random() * 60) + 20;
            const left = Math.floor(Math.random() * 60) + 20;
            setWatermarkPosition({ top: `${top}%`, left: `${left}%` });
        };

        updateWatermark();
        const interval = setInterval(updateWatermark, 15000);
        return () => clearInterval(interval);
    }, [studentName, studentId]);


    // 3. Security Event Listeners
    useEffect(() => {
        const preventDefault = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Block common shortcuts
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
                (e.ctrlKey && (e.key === 's' || e.key === 'u' || e.key === 'p'))
            ) {
                e.preventDefault();
            }
        };

        document.addEventListener('contextmenu', preventDefault);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('contextmenu', preventDefault);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    if (!isAuthenticated) {
        return (
            <div className="aspect-video w-full rounded-[2rem] bg-gray-900 flex flex-col items-center justify-center gap-4 text-white">
                <Lock size={40} className="text-brand-red" />
                <p>يجب تسجيل الدخول لمشاهدة الفيديو</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="aspect-video w-full rounded-[2rem] bg-gray-900 flex flex-col items-center justify-center gap-4 text-red-500">
                <AlertCircle size={40} />
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div
            className="group relative w-full aspect-video rounded-[2rem] overflow-hidden bg-black shadow-2xl border border-white/5"
            onContextMenu={(e) => e.preventDefault()}
            style={{ userSelect: "none" }}
        >
            {isLoading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <Loader2 className="animate-spin text-brand-red w-10 h-10" />
                </div>
            )}

            {/* Video Container */}
            {secureUrl && (
                isYouTube ? (
                    <>
                        {/* Protection Overlays for Iframe (Teacher Style) */}
                        <div
                            className="absolute top-0 left-0 right-0 h-[60px] z-30"
                            style={{ background: "transparent" }}
                            onClick={(e) => e.stopPropagation()}
                        />

                        <iframe
                            src={secureUrl}
                            className="w-full h-full relative z-10 rounded-[2rem]"
                            title={title}
                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                            sandbox="allow-scripts allow-same-origin"
                            referrerPolicy="strict-origin-when-cross-origin"
                            style={{ border: 0 }}
                            loading="lazy"
                        />

                        <div
                            className="absolute bottom-12 right-0 w-[100px] h-[40px] z-20"
                            style={{ background: "transparent" }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </>
                ) : (
                    // Simple Fallback for non-YT (e.g. MP4) if any. Teacher view didn't have this but we keep it safe.
                    <video
                        src={secureUrl}
                        className="w-full h-full rounded-[2rem]"
                        controls
                        controlsList="nodownload"
                    />
                )
            )}

            {/* Dynamic Watermark Overlay */}
            <div
                className="pointer-events-none absolute z-50 select-none opacity-40 mix-blend-difference whitespace-pre-line text-center font-black text-white/50 text-sm md:text-lg animate-pulse"
                style={{
                    top: watermarkPosition.top,
                    left: watermarkPosition.left,
                    transform: 'translate(-50%, -50%) rotate(-15deg)',
                    textShadow: '0 0 5px rgba(0,0,0,0.5)'
                }}
            >
                {watermarkContent}
            </div>
        </div>
    );
}
