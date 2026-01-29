"use client";

import React, { useState } from "react";
import { Teacher, TeacherCourse } from "../types/student.types";
import { ArrowLeft, Play, BookOpen, Clock, Globe, Shield, Sparkles, ShoppingCart, Check, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { StudentService } from "../services/student.service";
import { useStudentAuth } from "../hooks/use-student-auth";
import { env } from "@/config/env";

interface TeacherCoursesViewProps {
    teacher: Teacher;
    stageId: number;
    stageName: string;
    onBack: () => void;
    onSelectCourse: (course: TeacherCourse) => void;
}

export function TeacherCoursesView({ teacher, stageId, stageName, onBack, onSelectCourse }: TeacherCoursesViewProps) {
    const { userId, studentId: authStudentId } = useStudentAuth();
    const [subscribingCourseId, setSubscribingCourseId] = useState<number | null>(null);
    const [subscribedCourses, setSubscribedCourses] = useState<number[]>([]);
    const [pendingCourses, setPendingCourses] = useState<number[]>([]);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // حفظ بيانات الـ subscriptions الكاملة (تتضمن المحاضرات الكاملة للطلاب المشتركين)
    const [subscriptionsData, setSubscriptionsData] = useState<any[]>([]);

    // State for resolved numeric ID
    const [resolvedStudentId, setResolvedStudentId] = useState<number | null>(null);

    // Effect to resolve numeric ID if missing
    React.useEffect(() => {
        const resolveId = async () => {
            if (authStudentId) {
                setResolvedStudentId(authStudentId);
            } else if (userId) {
                try {
                    const profile = await StudentService.getStudentProfile(userId);
                    if (profile.data?.studentId) {
                        setResolvedStudentId(profile.data.studentId);
                    }
                } catch (e) {
                    console.error("Failed to resolve student ID", e);
                }
            }
        };
        resolveId();
    }, [authStudentId, userId]);

    // Effect to fetch subscriptions (Approved & Pending) when ID is resolved
    React.useEffect(() => {
        const fetchSubscriptions = async () => {
            if (!resolvedStudentId) return;
            try {
                // Fetch Approved
                const approvedRes = await StudentService.getSubscribedCourses(resolvedStudentId, 'Approved');
                if (approvedRes.succeeded && Array.isArray(approvedRes.data)) {
                    const approvedIds = approvedRes.data.map((sub: any) => sub.courseId);
                    setSubscribedCourses(prev => [...prev, ...approvedIds]);
                    // حفظ بيانات الـ subscriptions الكاملة (مع المحاضرات)
                    setSubscriptionsData(approvedRes.data);
                }

                // Fetch Pending
                const pendingRes = await StudentService.getSubscribedCourses(resolvedStudentId, 'Pending');
                if (pendingRes.succeeded && Array.isArray(pendingRes.data)) {
                    const pendingIds = pendingRes.data.map((sub: any) => sub.courseId);
                    setPendingCourses(prev => [...prev, ...pendingIds]);
                    console.log("Loaded pending courses:", pendingIds);
                }
            } catch (error) {
                console.error("Failed to load subscriptions", error);
            }
        };

        fetchSubscriptions();
    }, [resolvedStudentId]);

    const handleSubscribe = async (courseId: number) => {
        if (!resolvedStudentId) {
            setToast({ message: "جاري تحميل بيانات الطالب... حاول مرة أخرى", type: 'error' });
            return;
        }
        setSubscribingCourseId(courseId);
        try {
            const response = await StudentService.subscribeToCourse({
                studentId: resolvedStudentId,
                courseId,
            });

            // Handle success
            if (response.succeeded) {
                setPendingCourses(prev => [...prev, courseId]);
                setToast({ message: "تم إرسال طلب الانضمام بنجاح! في انتظار موافقة المدرس ⏳", type: 'success' });
            } else if (response.message.includes("مشترك بالفعل")) {
                // If backend says already subscribed, treat as success for UI
                setSubscribedCourses(prev => [...prev, courseId]);
                setToast({ message: "أنت مشترك بالفعل في هذا الكورس ✅", type: 'success' });
            } else {
                setToast({ message: response.message || "حدث خطأ أثناء الاشتراك", type: 'error' });
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "";
            if (errorMsg.includes("مشترك بالفعل")) {
                setSubscribedCourses(prev => [...prev, courseId]);
                setToast({ message: "أنت مشترك بالفعل في هذا الكورس ✅", type: 'success' });
            } else {
                setToast({ message: errorMsg || "فشل الاشتراك، حاول مرة أخرى", type: 'error' });
            }
        } finally {
            setSubscribingCourseId(null);
        }
    };

    return (
        <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-700">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl font-bold shadow-2xl animate-in slide-in-from-top-4 duration-300 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {toast.message}
                    <button onClick={() => setToast(null)} className="ml-4 opacity-70 hover:opacity-100">✕</button>
                </div>
            )}

            {/* Compact Profile Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0d1117] border border-white/5 p-8">
                <div className="absolute top-0 right-0 h-48 w-48 bg-brand-red/10 blur-[80px] -mr-24 -mt-24" />

                <div className="relative flex flex-col md:flex-row items-center gap-8">
                    {/* Avatar */}
                    <div className="h-32 w-32 rounded-[2rem] overflow-hidden border-4 border-white/5 shadow-2xl shrink-0">
                        {teacher.photoUrl ? (
                            <img
                                src={teacher.photoUrl.startsWith('http') ? teacher.photoUrl : `${env.API.SERVER_URL}${teacher.photoUrl}`}
                                alt={teacher.teacherName}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-brand-red/10 text-brand-red">
                                <Shield size={56} />
                            </div>
                        )}
                    </div>

                    {/* Meta */}
                    <div className="flex-1 text-right md:text-right space-y-3">
                        <div className="inline-flex items-center gap-2 bg-brand-red/10 text-brand-red px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                            <Sparkles size={12} />
                            مدرس معتمد
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white">أ/ {teacher.teacherName}</h2>
                        <div className="flex flex-wrap items-center justify-end gap-4 text-gray-400 font-bold text-sm">
                            <span className="flex items-center gap-2">
                                <BookOpen size={16} className="text-brand-red" />
                                {teacher.subjectName}
                            </span>
                            <span className="flex items-center gap-2">
                                <Globe size={16} className="text-brand-red" />
                                {teacher.teacherEducationStages[0]?.educationStageName || 'جميع المراحل'}
                            </span>
                        </div>
                    </div>

                    {/* Back Action */}
                    <div className="shrink-0">
                        <Button
                            variant="outline"
                            onClick={onBack}
                            className="rounded-2xl border-white/10 hover:bg-white/5 gap-2 h-14 w-14 p-0"
                        >
                            <ArrowLeft size={24} />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Courses Showcase */}
            <div className="space-y-6">
                <div className="text-right flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 font-bold text-sm">
                            {teacher.courses.filter(c => c.educationStageId === stageId).length} كورس متاح
                        </p>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-brand-red rounded-full" />
                            كورسات {stageName}
                        </h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teacher.courses.filter(course => course.educationStageId === stageId).map((course) => {
                        const isSubscribed = subscribedCourses.includes(course.id);
                        const isPending = pendingCourses.includes(course.id);
                        const isSubscribing = subscribingCourseId === course.id;
                        const hasDiscount = course.discountedPrice > 0 && course.discountedPrice < course.price;
                        const isFree = course.price === 0;

                        return (
                            <div
                                key={course.id}
                                className="group relative overflow-hidden rounded-[2rem] bg-[#0d1117] border border-white/5 hover:border-brand-red/30 transition-all duration-500"
                            >
                                {/* Course Image */}
                                <div className="relative h-40 overflow-hidden">
                                    {course.courseImageUrl ? (
                                        <img
                                            src={course.courseImageUrl}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-brand-red/20 to-transparent flex items-center justify-center">
                                            <Play size={48} className="text-brand-red/50" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-transparent" />

                                    {/* Price Badge */}
                                    <div className="absolute top-3 left-3">
                                        {isFree ? (
                                            <span className="bg-green-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
                                                مجاني
                                            </span>
                                        ) : hasDiscount ? (
                                            <div className="flex items-center gap-2">
                                                <span className="bg-brand-red text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                                                    خصم {Math.round(((course.price - course.discountedPrice) / course.price) * 100)}%
                                                </span>
                                            </div>
                                        ) : null}
                                    </div>

                                    {/* Stage Badge */}
                                    <div className="absolute top-3 right-3">
                                        <span className="bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                                            {course.educationStageName}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 space-y-4">
                                    <div className="text-right">
                                        <h4 className="text-xl font-black text-white group-hover:text-brand-red transition-colors line-clamp-1">
                                            {course.title}
                                        </h4>
                                        <p className="text-gray-500 text-sm font-bold mt-1">
                                            {course.lectures.length} محاضرة
                                        </p>
                                    </div>

                                    {/* Price */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 font-bold">
                                            {isFree ? (
                                                <span className="text-green-500 text-lg">مجاني</span>
                                            ) : hasDiscount ? (
                                                <>
                                                    <span className="text-gray-500 line-through text-sm">{course.price} ج.م</span>
                                                    <span className="text-brand-red text-lg">{course.discountedPrice} ج.م</span>
                                                </>
                                            ) : (
                                                <span className="text-white text-lg">{course.price} ج.م</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions - Always show both buttons */}
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => {
                                                // إذا كان الطالب مشترك، استخدم المحاضرات من endpoint الـ subscriptions (الكاملة)
                                                if (isSubscribed) {
                                                    const subscription = subscriptionsData.find((sub: any) => sub.courseId === course.id);
                                                    if (subscription && subscription.lectures) {
                                                        // إنشاء كورس جديد مع المحاضرات الكاملة من الـ subscription
                                                        const courseWithFullLectures = {
                                                            ...course,
                                                            lectures: subscription.lectures,
                                                            subscriptionStatus: 'Approved' as const, // حالة الاشتراك موافق عليها
                                                            isSubscribed: true
                                                        };
                                                        onSelectCourse(courseWithFullLectures);
                                                        return;
                                                    }
                                                }

                                                // إذا كان Pending، مرر الكورس بدون subscriptionStatus
                                                if (isPending) {
                                                    const courseWithStatus = {
                                                        ...course,
                                                        subscriptionStatus: 'Pending' as const,
                                                        isSubscribed: false
                                                    };
                                                    onSelectCourse(courseWithStatus);
                                                    return;
                                                }

                                                // إذا لم يكن مشترك، مرر الكورس بدون اشتراك
                                                const courseWithStatus = {
                                                    ...course,
                                                    subscriptionStatus: null,
                                                    isSubscribed: false
                                                };
                                                onSelectCourse(courseWithStatus);
                                            }}
                                            variant="outline"
                                            className="flex-1 h-11 rounded-xl border-white/10 hover:bg-white/5 hover:border-white/20 text-white font-bold text-sm"
                                        >
                                            <Play size={16} className="ml-1.5" />
                                            ابدأ التعلم
                                        </Button>
                                        {!isSubscribed && !isPending ? (
                                            <Button
                                                onClick={() => handleSubscribe(course.id)}
                                                disabled={isSubscribing}
                                                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-brand-red to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold shadow-lg shadow-brand-red/20 text-sm"
                                            >
                                                {isSubscribing ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <>
                                                        <ShoppingCart size={16} className="ml-1.5" />
                                                        اشترك الآن
                                                    </>
                                                )}
                                            </Button>
                                        ) : isPending ? (
                                            <div className="flex-1 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center gap-1.5 text-amber-500 font-bold text-sm animate-pulse">
                                                <Clock size={16} />
                                                قيد المراجعة
                                            </div>
                                        ) : (
                                            <div className="flex-1 h-11 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center gap-1.5 text-green-500 font-bold text-sm">
                                                <Check size={16} />
                                                مشترك
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Hover Glow */}
                                <div className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none border-2 border-brand-red/20" />
                            </div>
                        );
                    })}
                </div>

                {teacher.courses.filter(c => c.educationStageId === stageId).length === 0 && (
                    <div className="text-center py-16 bg-white/5 rounded-[2rem] border-2 border-dashed border-white/5">
                        <BookOpen size={48} className="mx-auto text-gray-600 mb-4" />
                        <p className="text-xl font-bold text-gray-500">لا توجد كورسات متاحة لـ {stageName} حالياً</p>
                    </div>
                )}
            </div>
        </div>
    );
}
