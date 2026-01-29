"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/modules/auth/services/auth.service";
import { Button } from "@/shared/ui/button";
import Image from "next/image";
import {
    BookOpen,
    Loader2,
    Phone,
    MapPin,
    ArrowRight,
    CheckCircle,
    AlertCircle,
    Facebook,
    Send,
    Youtube,
    MessageCircle,
    Camera,
    GraduationCap,
    Sparkles,
    User
} from "lucide-react";

export default function CompleteTeacherProfilePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [teacherId, setTeacherId] = useState<number>(0);
    const [educationStages, setEducationStages] = useState<any[]>([]);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    // Form state
    const [form, setForm] = useState({
        phoneNumber: "",
        whatsAppNumber: "",
        facebookUrl: "",
        telegramUrl: "",
        youtubeChannelUrl: "",
        governorate: "",
        city: "",
        educationStageIds: [] as number[],
        photoFile: null as File | null
    });

    useEffect(() => {
        // Get user data from localStorage
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);

            // Check if user is a teacher
            if (!user.roles?.includes("Teacher")) {
                router.push("/dashboard");
                return;
            }

            // Get teacherId
            const tId = user.teacherId || user.id;
            if (tId) {
                setTeacherId(typeof tId === 'number' ? tId : parseInt(tId));
            } else {
                // No teacherId, need to create profile first
                router.push("/auth/complete-profile");
                return;
            }

            // Pre-fill form with existing data
            if (user.phoneNumber) setForm(prev => ({ ...prev, phoneNumber: user.phoneNumber }));
        } else {
            router.push("/login");
        }

        // Fetch education stages
        loadEducationStages();
    }, []);

    const loadEducationStages = async () => {
        try {
            const response = await AuthService.getEducationStages();
            if (response.succeeded) {
                setEducationStages(response.data || []);
            }
        } catch (e) {
            console.error("Error loading education stages:", e);
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setForm(prev => ({ ...prev, photoFile: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleEducationStage = (stageId: number) => {
        setForm(prev => ({
            ...prev,
            educationStageIds: prev.educationStageIds.includes(stageId)
                ? prev.educationStageIds.filter(id => id !== stageId)
                : [...prev.educationStageIds, stageId]
        }));
    };

    const handleSubmit = async () => {
        // Validate required fields
        if (form.educationStageIds.length === 0) {
            setError("الرجاء اختيار مرحلة دراسية واحدة على الأقل");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await AuthService.updateTeacherProfile({
                TeacherId: teacherId,
                PhoneNumber: form.phoneNumber || undefined,
                WhatsAppNumber: form.whatsAppNumber || undefined,
                FacebookUrl: form.facebookUrl || undefined,
                TelegramUrl: form.telegramUrl || undefined,
                YouTubeChannelUrl: form.youtubeChannelUrl || undefined,
                Governorate: form.governorate || undefined,
                City: form.city || undefined,
                PhotoFile: form.photoFile || undefined,
                EducationStageIds: form.educationStageIds
            });

            if (response.succeeded) {
                setSuccess(true);
                // Update local storage with new data
                const userStr = localStorage.getItem("user");
                if (userStr) {
                    const user = JSON.parse(userStr);
                    user.profileCompleted = true;
                    localStorage.setItem("user", JSON.stringify(user));
                }
                // Redirect after short delay
                setTimeout(() => {
                    router.push("/dashboard/teacher");
                }, 2000);
            } else {
                setError(response.message || "فشل في تحديث الملف الشخصي");
            }
        } catch (err: any) {
            console.error("Update teacher profile error:", err);
            setError(err?.response?.data?.message || "حدث خطأ أثناء التحديث");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkip = () => {
        // Mark as skipped in localStorage
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            user.profileSkipped = true;
            localStorage.setItem("user", JSON.stringify(user));
        }
        router.push("/dashboard/teacher");
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#06080a] flex items-center justify-center p-4">
                <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle size={48} className="text-green-500" />
                    </div>
                    <h2 className="text-3xl font-black text-white">تم تحديث بياناتك بنجاح!</h2>
                    <p className="text-gray-400">جاري التوجيه للوحة التحكم...</p>
                    <Loader2 className="animate-spin mx-auto text-brand-red" size={32} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#06080a] flex items-center justify-center p-4 font-arabic" dir="rtl">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-brand-red/5 rounded-full blur-[150px]" />
            </div>

            <div className="relative z-10 w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-block relative mb-4">
                        <div className="absolute -inset-6 bg-purple-500/20 rounded-full blur-2xl" />
                        <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500/30 to-purple-600/10 rounded-2xl flex items-center justify-center border border-purple-500/20">
                            <BookOpen size={40} className="text-purple-400" />
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2">أكمل بياناتك</h1>
                    <p className="text-gray-400 flex items-center justify-center gap-2">
                        <Sparkles size={16} className="text-purple-400" />
                        أكمل بيانات حسابك كمعلم للحصول على أفضل تجربة
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-gradient-to-br from-[#0d1117] via-[#0d1117] to-[#12141a] rounded-3xl border border-white/5 p-6 md:p-8 shadow-2xl">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-center font-bold mb-6 flex items-center justify-center gap-2">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Photo Upload */}
                        <div className="flex flex-col items-center gap-4 mb-6">
                            <label className="cursor-pointer group">
                                <div className="relative">
                                    {photoPreview ? (
                                        <img
                                            src={photoPreview}
                                            alt="Preview"
                                            className="w-24 h-24 rounded-2xl object-cover border-2 border-purple-500/50"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-2xl bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center group-hover:border-purple-500/50 transition-colors">
                                            <User size={32} className="text-gray-500" />
                                        </div>
                                    )}
                                    <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                                        <Camera size={16} />
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                />
                            </label>
                            <p className="text-gray-500 text-sm">اضغط لإضافة صورة شخصية</p>
                        </div>

                        {/* Education Stages - Required */}
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-gray-400 flex items-center gap-2">
                                <GraduationCap size={16} className="text-purple-400" />
                                المراحل الدراسية <span className="text-red-500">*</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {educationStages.map(stage => (
                                    <button
                                        key={stage.id}
                                        type="button"
                                        onClick={() => toggleEducationStage(stage.id)}
                                        className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${form.educationStageIds.includes(stage.id)
                                            ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                                            }`}
                                    >
                                        {stage.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Phone Numbers */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-400 flex items-center gap-2">
                                    <Phone size={14} />
                                    رقم الهاتف
                                </label>
                                <input
                                    type="tel"
                                    value={form.phoneNumber}
                                    onChange={(e) => setForm(p => ({ ...p, phoneNumber: e.target.value }))}
                                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none transition-colors"
                                    placeholder="01xxxxxxxxx"
                                    dir="ltr"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-400 flex items-center gap-2">
                                    <MessageCircle size={14} className="text-green-500" />
                                    رقم الواتساب
                                </label>
                                <input
                                    type="tel"
                                    value={form.whatsAppNumber}
                                    onChange={(e) => setForm(p => ({ ...p, whatsAppNumber: e.target.value }))}
                                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-green-500 focus:outline-none transition-colors"
                                    placeholder="01xxxxxxxxx"
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-gray-400">روابط التواصل الاجتماعي</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <Facebook size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500" />
                                    <input
                                        type="url"
                                        value={form.facebookUrl}
                                        onChange={(e) => setForm(p => ({ ...p, facebookUrl: e.target.value }))}
                                        className="w-full h-12 px-4 pr-12 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 focus:outline-none transition-colors"
                                        placeholder="رابط فيسبوك"
                                        dir="ltr"
                                    />
                                </div>
                                <div className="relative">
                                    <Send size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-sky-500" />
                                    <input
                                        type="url"
                                        value={form.telegramUrl}
                                        onChange={(e) => setForm(p => ({ ...p, telegramUrl: e.target.value }))}
                                        className="w-full h-12 px-4 pr-12 rounded-xl bg-white/5 border border-white/10 text-white focus:border-sky-500 focus:outline-none transition-colors"
                                        placeholder="رابط تليجرام"
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                            <div className="relative">
                                <Youtube size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500" />
                                <input
                                    type="url"
                                    value={form.youtubeChannelUrl}
                                    onChange={(e) => setForm(p => ({ ...p, youtubeChannelUrl: e.target.value }))}
                                    className="w-full h-12 px-4 pr-12 rounded-xl bg-white/5 border border-white/10 text-white focus:border-red-500 focus:outline-none transition-colors"
                                    placeholder="رابط قناة يوتيوب"
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-400 flex items-center gap-2">
                                    <MapPin size={14} />
                                    المحافظة
                                </label>
                                <input
                                    type="text"
                                    value={form.governorate}
                                    onChange={(e) => setForm(p => ({ ...p, governorate: e.target.value }))}
                                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none transition-colors"
                                    placeholder="القاهرة"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-400">المدينة</label>
                                <input
                                    type="text"
                                    value={form.city}
                                    onChange={(e) => setForm(p => ({ ...p, city: e.target.value }))}
                                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none transition-colors"
                                    placeholder="مدينة نصر"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <Button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="flex-[2] h-14 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-xl font-black text-lg shadow-lg shadow-purple-500/20"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle size={20} className="ml-2" />
                                        حفظ البيانات
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={handleSkip}
                                variant="outline"
                                disabled={isLoading}
                                className="flex-1 h-14 rounded-xl border-white/10 hover:bg-white/5 text-gray-400 font-bold"
                            >
                                تخطي الآن
                                <ArrowRight size={18} className="mr-2" />
                            </Button>
                        </div>

                        <p className="text-center text-gray-600 text-sm">
                            يمكنك تعديل هذه البيانات لاحقاً من إعدادات الحساب
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
