"use client";

import React, { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { AdminService } from "../services/admin.service";
import { UpdateAppInfoRequest } from "../types/admin.types";
import { Button } from "@/shared/ui/button";
import {
    Settings,
    Phone,
    Globe,
    FileText,
    Video,
    CheckCircle2,
    XCircle,
    Upload,
    Loader2,
    Sparkles,
    Info,
    Save,
    ToggleLeft,
    ToggleRight
} from "lucide-react";

export function AppInfoSettings() {
    // Form state
    const [aboutUs, setAboutUs] = useState("");
    const [supportPhoneNumber, setSupportPhoneNumber] = useState("");
    const [applicationUrl, setApplicationUrl] = useState("");
    const [googleIconEnabled, setGoogleIconEnabled] = useState(true);
    const [version, setVersion] = useState("");
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);

    // UI state
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Mutation for updating app info
    const updateMutation = useMutation({
        mutationFn: (data: UpdateAppInfoRequest) => AdminService.updateAppInfo(data),
        onSuccess: (response) => {
            if (response.succeeded) {
                setSuccessMessage(response.data || "تم تحديث معلومات التطبيق بنجاح");
                setErrorMessage(null);
                // Clear success message after 5 seconds
                setTimeout(() => setSuccessMessage(null), 5000);
            } else {
                setErrorMessage(response.message || "حدث خطأ أثناء التحديث");
                setSuccessMessage(null);
            }
        },
        onError: (error: any) => {
            console.error('Update App Info Error:', error);
            const errorMsg = error?.response?.data?.message
                || error?.response?.data?.errors?.join(', ')
                || error?.message
                || "حدث خطأ غير متوقع";
            setErrorMessage(errorMsg);
            setSuccessMessage(null);
        }
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVideoFile(file);
            // Create preview URL
            const url = URL.createObjectURL(file);
            setVideoPreview(url);
        }
    };

    const handleRemoveVideo = () => {
        setVideoFile(null);
        if (videoPreview) {
            URL.revokeObjectURL(videoPreview);
            setVideoPreview(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const data: UpdateAppInfoRequest = {
            AboutUs: aboutUs || undefined,
            SupportPhoneNumber: supportPhoneNumber || undefined,
            ApplicationUrl: applicationUrl || undefined,
            GoogleIconEnabled: googleIconEnabled,
            Version: version || undefined,
            ExplanationVideoFile: videoFile || undefined
        };

        updateMutation.mutate(data);
    };

    return (
        <div className="rounded-3xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-violet-500/5 to-purple-500/5">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/20 flex items-center justify-center">
                        <Settings size={28} className="text-violet-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white flex items-center gap-2">
                            إعدادات التطبيق
                            <Sparkles size={18} className="text-violet-400" />
                        </h3>
                        <p className="text-gray-400 text-sm font-medium mt-1">
                            قم بتحديث معلومات التطبيق الأساسية
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Success/Error Messages */}
                {successMessage && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 animate-in slide-in-from-top duration-300">
                        <CheckCircle2 className="text-emerald-400" size={20} />
                        <p className="text-emerald-400 font-bold text-sm">{successMessage}</p>
                    </div>
                )}

                {errorMessage && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 animate-in slide-in-from-top duration-300">
                        <XCircle className="text-rose-400" size={20} />
                        <p className="text-rose-400 font-bold text-sm">{errorMessage}</p>
                    </div>
                )}

                {/* About Us */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-300">
                        <FileText size={16} className="text-violet-400" />
                        من نحن
                    </label>
                    <textarea
                        value={aboutUs}
                        onChange={(e) => setAboutUs(e.target.value)}
                        placeholder="أدخل نص من نحن..."
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 resize-none font-medium"
                    />
                </div>

                {/* Phone & URL Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Support Phone Number */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-300">
                            <Phone size={16} className="text-emerald-400" />
                            رقم الدعم الفني
                        </label>
                        <input
                            type="text"
                            value={supportPhoneNumber}
                            onChange={(e) => setSupportPhoneNumber(e.target.value)}
                            placeholder="مثال: +20 123 456 7890"
                            className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 font-medium"
                        />
                    </div>

                    {/* Application URL */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-300">
                            <Globe size={16} className="text-blue-400" />
                            رابط التطبيق
                        </label>
                        <input
                            type="url"
                            value={applicationUrl}
                            onChange={(e) => setApplicationUrl(e.target.value)}
                            placeholder="مثال: https://example.com"
                            className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 font-medium"
                            dir="ltr"
                        />
                    </div>
                </div>

                {/* Version & Google Icon Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Version */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-300">
                            <Info size={16} className="text-amber-400" />
                            إصدار التطبيق
                        </label>
                        <input
                            type="text"
                            value={version}
                            onChange={(e) => setVersion(e.target.value)}
                            placeholder="مثال: 1.0.0"
                            className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 font-medium"
                            dir="ltr"
                        />
                    </div>

                    {/* Google Icon Toggle */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-300">
                            <svg viewBox="0 0 24 24" width={16} height={16} className="text-red-400">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            تسجيل الدخول بجوجل
                        </label>
                        <button
                            type="button"
                            onClick={() => setGoogleIconEnabled(!googleIconEnabled)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300 ${googleIconEnabled
                                ? "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/15"
                                : "bg-white/[0.03] border-white/10 hover:bg-white/[0.05]"
                                }`}
                        >
                            <span className={`font-bold ${googleIconEnabled ? "text-emerald-400" : "text-gray-400"}`}>
                                {googleIconEnabled ? "مفعّل" : "غير مفعّل"}
                            </span>
                            {googleIconEnabled ? (
                                <ToggleRight size={28} className="text-emerald-400" />
                            ) : (
                                <ToggleLeft size={28} className="text-gray-500" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Video Upload */}
                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-300">
                        <Video size={16} className="text-pink-400" />
                        فيديو الشرح
                    </label>

                    {!videoFile ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full p-8 rounded-2xl border-2 border-dashed border-white/10 hover:border-pink-500/30 bg-white/[0.02] hover:bg-pink-500/5 cursor-pointer transition-all duration-300 group"
                        >
                            <div className="flex flex-col items-center gap-3 text-center">
                                <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Upload size={28} className="text-pink-400" />
                                </div>
                                <div>
                                    <p className="text-white font-bold">اضغط لرفع فيديو</p>
                                    <p className="text-gray-500 text-sm font-medium mt-1">MP4, MOV, AVI (حد أقصى 100MB)</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center">
                                        <Video size={24} className="text-pink-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm truncate max-w-[200px]">
                                            {videoFile.name}
                                        </p>
                                        <p className="text-gray-500 text-xs font-medium">
                                            {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={handleRemoveVideo}
                                    className="h-10 w-10 p-0 rounded-xl hover:bg-rose-500/10 hover:text-rose-400"
                                >
                                    <XCircle size={20} />
                                </Button>
                            </div>
                            {videoPreview && (
                                <video
                                    src={videoPreview}
                                    controls
                                    className="mt-4 w-full rounded-xl max-h-[200px] object-cover"
                                />
                            )}
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <Button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="w-full h-14 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-black text-lg shadow-2xl shadow-violet-500/25 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {updateMutation.isPending ? (
                            <>
                                <Loader2 size={24} className="animate-spin" />
                                جاري الحفظ...
                            </>
                        ) : (
                            <>
                                <Save size={24} />
                                حفظ التغييرات
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
