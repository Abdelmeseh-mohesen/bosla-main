"use client";

import React, { useState, useRef } from "react";
import { TeacherCourse } from "../types/student.types";
import {
    ArrowLeft,
    Play,
    Pause,
    Maximize,
    Volume2,
    VolumeX,
    FileText,
    Lock,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    MonitorPlay,
    AlertCircle
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import dynamic from 'next/dynamic';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any;
import { SecureVideoPlayer } from "./SecureVideoPlayer";

interface CoursePlayerProps {
    course: TeacherCourse;
    onBack: () => void;
    onStartExam: (lectureId: number) => void;
    role?: string;
}

export function CoursePlayer({ course, onBack, onStartExam, role = 'student' }: CoursePlayerProps) {
    const [expandedLecture, setExpandedLecture] = useState<number | null>(course.lectures[0]?.id || null);
    const [activeContent, setActiveContent] = useState<{ type: 'video' | 'pdf', url: string, title: string } | null>(null);

    // Player State
    const [playing, setPlaying] = useState(false);
    const [played, setPlayed] = useState(0); // 0 to 1
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(false);
    const [showControls, setShowControls] = useState(false); // Controls visibility

    const playerRef = useRef<any>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);

    const handlePlayPause = () => setPlaying(!playing);

    const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPlayed = parseFloat(e.target.value);
        setPlayed(newPlayed);
        playerRef.current?.seekTo(newPlayed);
    };

    const toggleFullScreen = () => {
        if (playerContainerRef.current) {
            if (!document.fullscreenElement) {
                playerContainerRef.current.requestFullscreen().catch(err => {
                    console.error("Error attempting to enable fullscreen:", err);
                });
            } else {
                document.exitFullscreen();
            }
        }
    };

    const formatTime = (seconds: number) => {
        if (!seconds) return "00:00";
        const date = new Date(seconds * 1000);
        const hh = date.getUTCHours();
        const mm = date.getUTCMinutes();
        const ss = ('0' + date.getUTCSeconds()).slice(-2);
        if (hh) {
            return `${hh}:${('0' + mm).slice(-2)}:${ss}`;
        }
        return `${('0' + mm).slice(-2)}:${ss}`;
    };

    // Unified Embed URL generator
    const getEmbedUrl = (url: string) => {
        if (!url) return "";

        try {
            // Google Drive
            if (url.includes("drive.google.com") && (url.includes("/view") || url.includes("/edit"))) {
                return url.replace(/\/view.*|\/edit.*/, "/preview");
            }

            // YouTube Shorts
            if (url.includes("youtube.com/shorts/")) {
                const id = url.split("shorts/")[1]?.split("?")[0];
                return `https://www.youtube.com/embed/${id}`;
            }

            // YouTube Watch
            if (url.includes("youtube.com/watch")) {
                const vParam = url.split("v=")[1];
                const id = vParam ? vParam.split("&")[0] : null;
                if (id) return `https://www.youtube.com/embed/${id}`;
            }

            // YouTube Short Link
            if (url.includes("youtu.be/")) {
                const id = url.split("youtu.be/")[1]?.split("?")[0];
                return `https://www.youtube.com/embed/${id}`;
            }

            // Already Embed
            if (url.includes("youtube.com/embed/")) {
                return url;
            }

        } catch (e) {
            console.error("Error parsing URL:", e);
        }

        return url;
    };

    return (
        <div className="space-y-12 animate-in slide-in-from-left-8 duration-700">
            {/* Player Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
                <div className="text-right space-y-2">
                    <div className="flex items-center justify-end gap-3 text-brand-red mb-2">
                        <span className="text-xs font-black uppercase tracking-[0.2em] bg-brand-red/10 px-3 py-1 rounded-lg">
                            {activeContent ? (activeContent.type === 'video' ? 'شاهد الآن' : 'اقرأ الآن') : 'Now Learning'}
                        </span>
                        <MonitorPlay size={20} />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white">{activeContent?.title || course.title}</h2>
                    <p className="text-gray-500 font-bold text-lg">منهج {course.educationStageName}</p>
                </div>

                <Button
                    variant="outline"
                    onClick={onBack}
                    className="rounded-2xl border-white/10 hover:bg-white/5 gap-2 h-14 pr-6"
                >
                    <ArrowLeft size={20} />
                    العودة للكورسات
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Custom Player Container */}
                    <div
                        ref={playerContainerRef}
                        className="w-full"
                    >
                        {activeContent ? (
                            activeContent.type === 'video' ? (
                                // استخدام SecureVideoPlayer للفيديوهات
                                <SecureVideoPlayer
                                    videoUrl={activeContent.url}
                                    title={activeContent.title}
                                    isAuthenticated={true}
                                    role={role}
                                />
                            ) : (
                                // PDF Viewer
                                <div className="aspect-video w-full rounded-[2rem] bg-black border border-white/5 relative overflow-hidden shadow-2xl">
                                    <iframe
                                        src={getEmbedUrl(activeContent.url)}
                                        className="w-full h-full border-0"
                                        title={activeContent.title}
                                        allow="autoplay"
                                    />
                                </div>
                            )
                        ) : (
                            <div className="aspect-video w-full rounded-[3rem] bg-black border border-white/5 relative overflow-hidden shadow-2xl group select-none">
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-red/10 via-transparent to-transparent opacity-50" />
                                <div className="relative z-10 flex flex-col items-center justify-center h-full gap-6">
                                    <div className="h-24 w-24 rounded-full bg-brand-red/20 flex items-center justify-center text-brand-red group-hover:scale-110 transition-transform duration-500">
                                        <Play size={40} fill="currentColor" />
                                    </div>
                                    <p className="text-xl font-bold text-gray-400">اختر محاضرة أو ملف لبدء التعلم</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Subscription Status Banner */}
                    {course.subscriptionStatus !== 'Approved' && (
                        <div className="glass-card p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-3">
                            <div className="flex items-center gap-3 justify-end">
                                <div className="text-right">
                                    <h5 className="text-lg font-black text-amber-500">
                                        {course.subscriptionStatus === 'Pending' ? 'طلبك قيد المراجعة' : 'محتوى مجاني محدود'}
                                    </h5>
                                    <p className="text-sm text-gray-400 font-bold mt-1">
                                        {course.subscriptionStatus === 'Pending'
                                            ? 'يمكنك الآن مشاهدة المحتوى المجاني فقط. سيتم السماح بالوصول الكامل بعد الموافقة.'
                                            : 'يمكنك مشاهدة المحتوى المجاني فقط. اشترك في الكورس للوصول الكامل لجميع المحاضرات والمواد.'}
                                    </p>
                                </div>
                                <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
                                    <Lock size={24} className="text-amber-500" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="glass-card p-10 rounded-[3rem] border border-white/5 space-y-6">
                        <h4 className="text-2xl font-black text-white">نظرة عامة</h4>
                        <p className="text-gray-400 font-bold leading-relaxed text-right">
                            {activeContent ? `أنت الآن تتابع: ${activeContent.title}` : 'هذا الكورس مصمم خصيصاً لتغطية كافة جوانب المنهج بأسلوب مبسط وعلمي. يتضمن الكورس محاضرات فيديو، ملخصات بصيغة PDF، واختبارات دورية لقياس المستوى.'}
                        </p>
                    </div>
                </div>

                {/* Sidebar - Lectures List */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-[#0d1117] rounded-[2.5rem] border border-white/5 overflow-hidden">
                        <div className="p-6 border-b border-white/5 bg-white/5">
                            <h4 className="text-xl font-black text-white text-right">محتوى المنهج</h4>
                        </div>

                        <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
                            {course.lectures.map((lecture, index) => (
                                <div key={lecture.id} className="group">
                                    <button
                                        onClick={() => setExpandedLecture(expandedLecture === lecture.id ? null : lecture.id)}
                                        className={`w-full p-6 flex items-center justify-between transition-colors hover:bg-white/5 ${expandedLecture === lecture.id ? 'bg-brand-red/5' : ''}`}
                                    >
                                        {expandedLecture === lecture.id ? <ChevronUp size={20} className="text-brand-red" /> : <ChevronDown size={20} className="text-gray-500" />}
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className={`font-black tracking-wide ${expandedLecture === lecture.id ? 'text-brand-red' : 'text-white'}`}>
                                                    {lecture.title}
                                                </p>
                                                <p className="text-[10px] font-bold text-gray-500 mt-1">المحاضرة {index + 1}</p>
                                            </div>
                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm border ${expandedLecture === lecture.id ? 'bg-brand-red text-white border-brand-red' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                                                {index + 1}
                                            </div>
                                        </div>
                                    </button>

                                    {expandedLecture === lecture.id && (
                                        <div className="p-4 bg-black/20 space-y-2 animate-in slide-in-from-top-2 duration-300">
                                            {/* 
                                                فلترة المحتوى حسب حالة الاشتراك:
                                                - إذا subscriptionStatus === 'Approved' → عرض كل المحتوى
                                                - إذا غير ذلك → عرض المحتوى المجاني فقط (isFree: true)
                                            */}
                                            {(() => {
                                                const isApproved = course.subscriptionStatus === 'Approved';
                                                const lectureVideoUrl = (lecture as any).videoUrl;
                                                const lectureIsFree = (lecture as any).isFree;

                                                // Video Button - عرض فقط إذا Approved أو isFree
                                                const canViewVideo = isApproved || lectureIsFree;

                                                return (
                                                    <>
                                                        {lectureVideoUrl && (
                                                            canViewVideo ? (
                                                                <button
                                                                    onClick={() => {
                                                                        setActiveContent({ type: 'video', url: lectureVideoUrl, title: lecture.title });
                                                                        setPlaying(true);
                                                                    }}
                                                                    className="w-full flex items-center justify-between p-3 rounded-xl bg-brand-red/10 hover:bg-brand-red/20 transition-colors border border-brand-red/20 group/video"
                                                                >
                                                                    <Play size={14} className="text-brand-red" />
                                                                    <span className="text-xs font-bold text-white">مشاهدة الفيديو</span>
                                                                </button>
                                                            ) : (
                                                                <div className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-800/30 border border-gray-700/30 opacity-60">
                                                                    <Lock size={14} className="text-gray-500" />
                                                                    <span className="text-xs font-bold text-gray-400">الفيديو مقفل - اشترك للمشاهدة</span>
                                                                </div>
                                                            )
                                                        )}

                                                        {/* Exam Button - دائماً متاح */}
                                                        <button
                                                            onClick={() => onStartExam(lecture.id)}
                                                            className="w-full flex items-center justify-between p-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 transition-colors border border-orange-500/20 group/exam"
                                                        >
                                                            <AlertCircle size={14} className="text-orange-500" />
                                                            <span className="text-xs font-bold text-white">دخول الامتحان</span>
                                                        </button>

                                                        {/* Materials - فلترة حسب isFree */}
                                                        {lecture.materials && lecture.materials.length > 0 ? (
                                                            lecture.materials.map((material: any) => {
                                                                const canViewMaterial = isApproved || material.isFree;

                                                                return canViewMaterial ? (
                                                                    <button
                                                                        key={material.id}
                                                                        onClick={() => setActiveContent({ type: 'pdf', url: material.fileUrl, title: material.title })}
                                                                        className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group/link"
                                                                    >
                                                                        <ExternalLink size={14} className="text-gray-500 group-hover/link:text-brand-red" />
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="text-xs font-bold text-gray-300">{material.title}</span>
                                                                            <FileText size={16} className="text-brand-red" />
                                                                        </div>
                                                                    </button>
                                                                ) : (
                                                                    <div
                                                                        key={material.id}
                                                                        className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-800/30 border border-gray-700/30 opacity-60"
                                                                    >
                                                                        <Lock size={14} className="text-gray-500" />
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="text-xs font-bold text-gray-400">{material.title} (مقفل)</span>
                                                                            <FileText size={16} className="text-gray-500" />
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            !lectureVideoUrl && (
                                                                <div className="flex items-center justify-end gap-2 p-3 text-gray-600 grayscale">
                                                                    <span className="text-xs font-bold">لا توجد محتويات حالياً</span>
                                                                    <Lock size={14} />
                                                                </div>
                                                            )
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Support Card */}
                    <div className="bg-gradient-to-br from-brand-red to-red-800 p-8 rounded-[2.5rem] text-center space-y-4">
                        <h5 className="text-xl font-black text-white">هل تواجه مشكلة؟</h5>
                        <p className="text-white/80 text-sm font-bold">فريق الدعم الفني متاح 24/7 لمساعدتك في أي وقت</p>
                        <Button className="w-full bg-white text-brand-red hover:bg-gray-100 h-12 rounded-xl font-black">
                            تواصل مع الدعم
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
