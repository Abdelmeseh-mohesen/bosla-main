"use client";

import React, { useState, useRef, useEffect } from "react";
import { TeacherCourse, Lecture, LectureMaterial, Exam } from "../types/student.types";
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
    AlertCircle,
    ClipboardList,
    Loader2
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import dynamic from 'next/dynamic';
import { StudentService } from "../services/student.service";

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any;
import { SecureVideoPlayer } from "./SecureVideoPlayer";
import { TeacherService } from "@/modules/teacher/services/teacher.service";

interface CoursePlayerProps {
    course: TeacherCourse;
    onBack: () => void;
    onStartExam: (examId: number, exam?: Exam) => void;
    role?: string;
    studentName?: string;
    studentId?: number;
}

export function CoursePlayer({ course, onBack, onStartExam, role = 'student', studentName, studentId }: CoursePlayerProps) {
    // Debug logs
    console.log("=== CoursePlayer Debug ===");
    console.log("Course:", course);
    console.log("Lectures count:", course.lectures?.length);
    console.log("Subscription Status:", course.subscriptionStatus);
    if (course.lectures?.[0]) {
        console.log("First Lecture:", course.lectures[0]);
        console.log("First Lecture Materials:", course.lectures[0].materials);
    }

    const visibleLectures = course.lectures?.filter((l: Lecture) => l.isVisible !== false) || [];
    const [expandedLecture, setExpandedLecture] = useState<number | null>(visibleLectures[0]?.id || null);
    const [activeContent, setActiveContent] = useState<{ type: 'video' | 'pdf', url: string, title: string } | null>(null);

    // State لحفظ الامتحانات والواجبات لكل محاضرة
    const [lectureExams, setLectureExams] = useState<Record<number, Exam[]>>({});
    const [loadingExams, setLoadingExams] = useState<Record<number, boolean>>({});

    // Player State
    const [playing, setPlaying] = useState(false);
    const [played, setPlayed] = useState(0); // 0 to 1
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(false);
    const [showControls, setShowControls] = useState(false); // Controls visibility

    const playerRef = useRef<any>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);

    // جلب الامتحانات عند توسيع المحاضرة
    useEffect(() => {
        if (expandedLecture && !lectureExams[expandedLecture] && !loadingExams[expandedLecture]) {
            fetchLectureExams(expandedLecture);
        }
    }, [expandedLecture]);

    const fetchLectureExams = async (lectureId: number) => {
        setLoadingExams(prev => ({ ...prev, [lectureId]: true }));
        try {
            // جلب الامتحانات من StudentService أولاً
            let exams = await StudentService.getExamsByLecture(lectureId);
            console.log(`StudentService exams for lecture ${lectureId}:`, exams);

            // لو ما في امتحانات، نجرب TeacherService كـ fallback
            if (!exams || exams.length === 0) {
                console.log(`No exams from StudentService, trying TeacherService...`);
                try {
                    const teacherResponse = await TeacherService.getExams(lectureId);
                    console.log(`TeacherService exams response:`, teacherResponse);
                    if (teacherResponse.data && teacherResponse.data.length > 0) {
                        // تحويل الامتحانات إلى النوع المطلوب للطلاب
                        exams = teacherResponse.data
                            // .filter((e: any) => e.isVisible !== false) // تم إزالة هذا الشرط للسماح بظهور الامتحانات المخفية
                            .map((e: any) => ({
                                id: e.id,
                                title: e.title,
                                lectureId: e.lectureId,
                                lectureName: e.lectureName || '',
                                isFinished: e.isFinished || false,
                                deadline: e.deadline,
                                durationInMinutes: e.durationInMinutes,
                                examType: e.type === 2 ? 'homework' : 'exam',
                                isVisible: e.isVisible, // نحتفظ بحالة الرؤية
                                questions: e.questions || []
                            }));
                        console.log(`Converted TeacherService exams:`, exams);
                    }
                } catch (teacherError) {
                    console.log(`TeacherService fallback also failed:`, teacherError);
                }
            }

            setLectureExams(prev => ({ ...prev, [lectureId]: exams }));
        } catch (error) {
            console.error("Error fetching exams for lecture:", lectureId, error);
            setLectureExams(prev => ({ ...prev, [lectureId]: [] }));
        } finally {
            setLoadingExams(prev => ({ ...prev, [lectureId]: false }));
        }
    };

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
                                    studentName={studentName}
                                    studentId={studentId}
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
                            {/* فلترة المحاضرات المرئية فقط للطلاب */}
                            {course.lectures.filter((l: Lecture) => l.isVisible !== false).map((lecture, index) => (
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

                                                // تصنيف المواد حسب النوع
                                                const videos = lecture.materials?.filter((m: LectureMaterial) => m.type === 'video') || [];
                                                const pdfs = lecture.materials?.filter((m: LectureMaterial) => m.type === 'pdf') || [];
                                                const homeworks = lecture.materials?.filter((m: LectureMaterial) => m.type === 'homework') || [];
                                                const hasContent = videos.length > 0 || pdfs.length > 0 || homeworks.length > 0;

                                                return (
                                                    <>
                                                        {/* Videos - عرض الفيديوهات */}
                                                        {videos.map((material: LectureMaterial) => {
                                                            const canView = isApproved || material.isFree;
                                                            return canView ? (
                                                                <button
                                                                    key={material.id}
                                                                    onClick={() => {
                                                                        setActiveContent({ type: 'video', url: material.fileUrl, title: material.title });
                                                                        setPlaying(true);
                                                                    }}
                                                                    className="w-full flex items-center justify-between p-3 rounded-xl bg-brand-red/10 hover:bg-brand-red/20 transition-colors border border-brand-red/20 group/video"
                                                                >
                                                                    <Play size={14} className="text-brand-red" />
                                                                    <span className="text-xs font-bold text-white">{material.title}</span>
                                                                </button>
                                                            ) : (
                                                                <div key={material.id} className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-800/30 border border-gray-700/30 opacity-60">
                                                                    <Lock size={14} className="text-gray-500" />
                                                                    <span className="text-xs font-bold text-gray-400">{material.title} (مقفل)</span>
                                                                </div>
                                                            );
                                                        })}

                                                        {/* Exams & Homeworks - عرض الامتحانات والواجبات الفعلية */}
                                                        {loadingExams[lecture.id] ? (
                                                            <div className="w-full flex items-center justify-center p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                                                                <Loader2 size={16} className="text-orange-500 animate-spin ml-2" />
                                                                <span className="text-xs font-bold text-gray-400">جاري تحميل الامتحانات...</span>
                                                            </div>
                                                        ) : lectureExams[lecture.id] && lectureExams[lecture.id].length > 0 ? (
                                                            // عرض كل الامتحانات المتاحة
                                                            lectureExams[lecture.id].map((exam) => {
                                                                const isHomework = (exam as any).examType === 'homework' ||
                                                                    (exam as any).type === 'homework' ||
                                                                    exam.title?.includes('واجب');
                                                                const isHidden = (exam as any).isVisible === false;

                                                                return (
                                                                    <button
                                                                        key={exam.id}
                                                                        onClick={() => onStartExam(exam.id, exam)}
                                                                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors border group/exam ${isHomework
                                                                            ? 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20'
                                                                            : 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20'
                                                                            } ${isHidden ? 'opacity-70 border-dashed' : ''}`}
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <ClipboardList size={14} className={isHomework ? 'text-purple-500' : 'text-orange-500'} />
                                                                            <span className="text-xs font-bold text-white text-right">{exam.title}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            {isHidden && (
                                                                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-300 ml-1">
                                                                                    مخفي
                                                                                </span>
                                                                            )}
                                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isHomework
                                                                                ? 'bg-purple-500/20 text-purple-400'
                                                                                : 'bg-orange-500/20 text-orange-400'
                                                                                }`}>
                                                                                {isHomework ? 'واجب' : 'امتحان'}
                                                                            </span>
                                                                        </div>
                                                                    </button>
                                                                );
                                                            })
                                                        ) : (
                                                            // Fallback - زر للبحث عن امتحان عند عدم وجود امتحانات محملة
                                                            <button
                                                                onClick={async () => {
                                                                    <button
                                                                        onClick={async () => {
                                                                            // محاولة أولى: StudentService
                                                                            let exam = await StudentService.getExamByLecture(lecture.id);

                                                                            // محاولة ثانية: TeacherService (Fallback قوي)
                                                                            if (!exam) {
                                                                                try {
                                                                                    console.log("Fallback: Fetching from TeacherService...");
                                                                                    const teacherResponse = await TeacherService.getExams(lecture.id);
                                                                                    if (teacherResponse.data && Array.isArray(teacherResponse.data) && teacherResponse.data.length > 0) {
                                                                                        const tExam = teacherResponse.data[0];
                                                                                        exam = {
                                                                                            id: tExam.id,
                                                                                            title: tExam.title,
                                                                                            lectureId: tExam.lectureId,
                                                                                            lectureName: tExam.lectureName || '',
                                                                                            isFinished: (tExam as any).isFinished || false,
                                                                                            deadline: tExam.deadline,
                                                                                            durationInMinutes: tExam.durationInMinutes,
                                                                                            examType: tExam.type === 2 ? 'homework' : 'exam',
                                                                                            questions: tExam.questions || []
                                                                                        } as any;
                                                                                        console.log("Fallback: Found exam in TeacherService", exam);
                                                                                    }
                                                                                } catch (e) {
                                                                                    console.error("Fallback failed:", e);
                                                                                }
                                                                            }

                                                                            if (exam) {
                                                                                onStartExam(exam.id, exam);
                                                                            } else {
                                                                                alert("لا يوجد امتحان متاح لهذه المحاضرة حالياً - تأكد من صلاحية العرض");
                                                                            }
                                                                        }}
                                                                        className="w-full flex items-center justify-between p-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 transition-colors border border-orange-500/20 group/exam"
                                                                    >
                                                                        <AlertCircle size={14} className="text-orange-500" />
                                                                        <span className="text-xs font-bold text-white">دخول الامتحان (محاولة مباشرة)</span>
                                                                    </button>
                                                                }}
                                                                className="w-full flex items-center justify-between p-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 transition-colors border border-orange-500/20 group/exam"
                                                            >
                                                                <AlertCircle size={14} className="text-orange-500" />
                                                                <span className="text-xs font-bold text-white">دخول الامتحان</span>
                                                            </button>
                                                        )}

                                                        {/* PDFs - ملفات PDF */}
                                                        {pdfs.map((material: LectureMaterial) => {
                                                            const canView = isApproved || material.isFree;
                                                            return canView ? (
                                                                <button
                                                                    key={material.id}
                                                                    onClick={() => setActiveContent({ type: 'pdf', url: material.fileUrl, title: material.title })}
                                                                    className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 transition-colors border border-blue-500/20 group/pdf"
                                                                >
                                                                    <ExternalLink size={14} className="text-blue-400 group-hover/pdf:text-blue-300" />
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-xs font-bold text-gray-300">{material.title}</span>
                                                                        <FileText size={16} className="text-blue-400" />
                                                                    </div>
                                                                </button>
                                                            ) : (
                                                                <div key={material.id} className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-800/30 border border-gray-700/30 opacity-60">
                                                                    <Lock size={14} className="text-gray-500" />
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-xs font-bold text-gray-400">{material.title} (مقفل)</span>
                                                                        <FileText size={16} className="text-gray-500" />
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}

                                                        {/* Homeworks - الواجبات */}
                                                        {homeworks.map((material: LectureMaterial) => {
                                                            const canView = isApproved || material.isFree;
                                                            return canView ? (
                                                                <button
                                                                    key={material.id}
                                                                    onClick={() => setActiveContent({ type: 'pdf', url: material.fileUrl, title: material.title })}
                                                                    className="w-full flex items-center justify-between p-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 transition-colors border border-green-500/20 group/hw"
                                                                >
                                                                    <ExternalLink size={14} className="text-green-400 group-hover/hw:text-green-300" />
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-xs font-bold text-gray-300">{material.title}</span>
                                                                        <FileText size={16} className="text-green-400" />
                                                                    </div>
                                                                </button>
                                                            ) : (
                                                                <div key={material.id} className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-800/30 border border-gray-700/30 opacity-60">
                                                                    <Lock size={14} className="text-gray-500" />
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-xs font-bold text-gray-400">{material.title} (مقفل)</span>
                                                                        <FileText size={16} className="text-gray-500" />
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}

                                                        {/* Empty State */}
                                                        {!hasContent && (
                                                            <div className="flex items-center justify-end gap-2 p-3 text-gray-600 grayscale">
                                                                <span className="text-xs font-bold">لا توجد محتويات حالياً</span>
                                                                <Lock size={14} />
                                                            </div>
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
