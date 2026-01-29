"use client";

import React, { useState, useEffect } from "react";
import { StudentService } from "../services/student.service";
import { StudentProfile as StudentProfileType, UpdateStudentProfileRequest } from "../types/student.types";
import { Button } from "@/shared/ui/button";
import {
    User,
    Phone,
    MapPin,
    Edit3,
    Save,
    X,
    Loader2,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    Shield,
    Sparkles,
    Camera
} from "lucide-react";

interface StudentProfileProps {
    userId: string;
    onBack?: () => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ userId, onBack }) => {
    const [profile, setProfile] = useState<StudentProfileType | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const [editForm, setEditForm] = useState<UpdateStudentProfileRequest>({
        studentId: "",
        studentPhoneNumber: "",
        parentPhoneNumber: "",
        governorate: "",
        city: ""
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!userId) {
                showToast("خطأ: لم يتم العثور على معرف المستخدم", "error");
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const response = await StudentService.getStudentProfile(userId);
                if (response.succeeded && response.data) {
                    setProfile(response.data);
                    setEditForm({
                        studentId: response.data.studentId.toString(),
                        studentPhoneNumber: response.data.studentPhoneNumber || "",
                        parentPhoneNumber: response.data.parentPhoneNumber || "",
                        governorate: response.data.governorate || "",
                        city: response.data.city || ""
                    });
                } else {
                    showToast(response.message || "فشل في تحميل البيانات", "error");
                }
            } catch (error: any) {
                const errorMsg = error?.response?.status === 404
                    ? "لم يتم العثور على بيانات الطالب"
                    : "حدث خطأ أثناء تحميل البيانات";
                showToast(errorMsg, "error");
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchProfile();
        else setLoading(false);
    }, [userId]);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleSaveProfile = async () => {
        if (!editForm.parentPhoneNumber || editForm.parentPhoneNumber.length < 11) {
            showToast("الرجاء إدخال رقم هاتف ولي الأمر صحيح", "error");
            return;
        }

        setIsSaving(true);
        try {
            const response = await StudentService.updateStudentProfile(editForm);
            if (response.succeeded) {
                showToast("تم تحديث البيانات بنجاح ✓", "success");
                setIsEditing(false);
                const updatedProfile = await StudentService.getStudentProfile(userId);
                if (updatedProfile.succeeded) setProfile(updatedProfile.data);
            } else {
                showToast(response.message || "فشل في تحديث البيانات", "error");
            }
        } catch (error: any) {
            showToast(error?.response?.data?.message || "حدث خطأ أثناء التحديث", "error");
        } finally {
            setIsSaving(false);
        }
    };



    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                    <Loader2 className="h-10 w-10 text-brand-red animate-spin mx-auto" />
                    <p className="text-white font-bold">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4 bg-[#0d1117] p-8 rounded-2xl border border-white/5">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                    <p className="text-white font-bold">لم يتم العثور على البيانات</p>
                    {onBack && (
                        <Button onClick={onBack} className="bg-brand-red hover:bg-red-600">
                            العودة
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                {onBack && (
                    <Button
                        variant="outline"
                        onClick={onBack}
                        className="h-10 px-4 rounded-xl border-white/10 hover:bg-white/5 text-gray-400 hover:text-white text-sm"
                    >
                        <ArrowRight size={16} className="ml-1" />
                        عودة
                    </Button>
                )}
                <div className="flex-1" />
                {!isEditing && (
                    <Button
                        onClick={() => setIsEditing(true)}
                        className="h-10 px-5 rounded-xl bg-brand-red hover:bg-red-600 text-white text-sm font-bold"
                    >
                        <Edit3 size={16} className="ml-2" />
                        تعديل
                    </Button>
                )}
            </div>

            {/* Profile Card - Compact */}
            <div className="bg-gradient-to-br from-[#0d1117] to-[#12141a] rounded-2xl border border-white/5 p-6 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-brand-red/5 rounded-full blur-[80px]" />

                <div className="relative flex items-center gap-5">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-red to-red-600 flex items-center justify-center text-white shadow-lg shadow-brand-red/20 overflow-hidden relative">
                            {profile.studentProfileImageUrl ? (
                                <img
                                    src={profile.studentProfileImageUrl}
                                    alt={profile.firstName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User size={36} strokeWidth={1.5} />
                            )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-[#0d1117] flex items-center justify-center ${profile.isProfileComplete ? 'bg-green-500' : 'bg-amber-500'
                            }`}>
                            {profile.isProfileComplete ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 text-right">
                        <div className="flex items-center gap-2 justify-end mb-1">
                            <span className="bg-brand-red/15 text-brand-red text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                                <Sparkles size={10} />
                                طالب
                            </span>
                        </div>
                        <h2 className="text-xl font-black text-white truncate">
                            {profile.firstName} {profile.lastName}
                        </h2>
                        <p className="text-gray-500 text-sm truncate">{profile.email}</p>
                    </div>
                </div>

                {/* Quick Info Row */}
                <div className="flex gap-3 mt-5 pt-5 border-t border-white/5">
                    <div className="flex-1 bg-white/5 rounded-xl p-3 text-center">
                        <MapPin size={18} className="text-purple-400 mx-auto mb-1" />
                        <p className="text-[10px] text-gray-500 mb-0.5">الموقع</p>
                        <p className="text-white text-xs font-bold truncate">{profile.governorate || "غير محدد"}</p>
                    </div>
                    <div className="flex-1 bg-white/5 rounded-xl p-3 text-center">
                        <Shield size={18} className={`mx-auto mb-1 ${profile.isProfileComplete ? 'text-green-400' : 'text-amber-400'}`} />
                        <p className="text-[10px] text-gray-500 mb-0.5">الحالة</p>
                        <p className="text-white text-xs font-bold">{profile.isProfileComplete ? "مكتمل" : "غير مكتمل"}</p>
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            {!isEditing ? (
                <div className="grid grid-cols-2 gap-3">
                    <InfoCard icon={<Phone size={18} />} label="هاتف الطالب" value={profile.studentPhoneNumber || "—"} />
                    <InfoCard icon={<Phone size={18} />} label="هاتف ولي الأمر" value={profile.parentPhoneNumber || "—"} />
                    <InfoCard icon={<MapPin size={18} />} label="المحافظة" value={profile.governorate || "—"} />
                    <InfoCard icon={<MapPin size={18} />} label="المدينة" value={profile.city || "—"} />
                </div>
            ) : (
                /* Edit Form - Compact */
                <div className="bg-[#0d1117] rounded-2xl border border-white/5 p-5">
                    <h3 className="text-lg font-bold text-white text-right mb-4 flex items-center justify-end gap-2">
                        <span>تعديل البيانات</span>
                        <Edit3 size={18} className="text-brand-red" />
                    </h3>

                    <div className="mb-6 flex justify-center">
                        <div className="relative group cursor-pointer" onClick={() => document.getElementById('profile-image-upload')?.click()}>
                            <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden group-hover:border-brand-red transition-colors">
                                {editForm.photoFile ? (
                                    <img
                                        src={URL.createObjectURL(editForm.photoFile)}
                                        alt="New Profile Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : profile.studentProfileImageUrl ? (
                                    <img
                                        src={profile.studentProfileImageUrl}
                                        alt="Current Profile"
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                    />
                                ) : (
                                    <User size={32} className="text-gray-400 group-hover:text-brand-red transition-colors" />
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-brand-red text-white flex items-center justify-center shadow-lg transform translate-x-1 translate-y-1">
                                <Camera size={14} />
                            </div>
                            <input
                                id="profile-image-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setEditForm(p => ({ ...p, photoFile: e.target.files![0] }));
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            label="هاتف الطالب"
                            value={editForm.studentPhoneNumber}
                            onChange={(v) => setEditForm(p => ({ ...p, studentPhoneNumber: v }))}
                            placeholder="01xxxxxxxxx"
                            icon={<Phone size={16} />}
                            dir="ltr"
                        />
                        <InputField
                            label="هاتف ولي الأمر *"
                            value={editForm.parentPhoneNumber}
                            onChange={(v) => setEditForm(p => ({ ...p, parentPhoneNumber: v }))}
                            placeholder="01xxxxxxxxx"
                            icon={<Phone size={16} />}
                            dir="ltr"
                            required
                        />
                        <InputField
                            label="المحافظة"
                            value={editForm.governorate}
                            onChange={(v) => setEditForm(p => ({ ...p, governorate: v }))}
                            placeholder="القاهرة"
                            icon={<MapPin size={16} />}
                        />
                        <InputField
                            label="المدينة"
                            value={editForm.city}
                            onChange={(v) => setEditForm(p => ({ ...p, city: v }))}
                            placeholder="مدينة نصر"
                            icon={<MapPin size={16} />}
                        />
                    </div>

                    <div className="flex gap-3 mt-5 pt-4 border-t border-white/5">
                        <Button
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            className="flex-1 bg-brand-red hover:bg-red-600 h-11 rounded-xl text-sm font-bold"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save size={16} className="ml-2" />حفظ</>}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                            disabled={isSaving}
                            className="flex-1 border-white/10 h-11 rounded-xl text-sm"
                        >
                            <X size={16} className="ml-2" />إلغاء
                        </Button>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[300] px-5 py-3 rounded-xl shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200 flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    } text-white`}>
                    {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    <span className="font-bold text-sm">{toast.message}</span>
                </div>
            )}
        </div>
    );
};

// Compact Info Card
const InfoCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="bg-[#0d1117] rounded-xl border border-white/5 p-4 hover:border-brand-red/20 transition-colors">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-red/10 flex items-center justify-center text-brand-red shrink-0">
                {icon}
            </div>
            <div className="flex-1 text-right min-w-0">
                <p className="text-gray-500 text-xs mb-0.5">{label}</p>
                <p className="text-white font-bold text-sm truncate">{value}</p>
            </div>
        </div>
    </div>
);

// Compact Input Field
const InputField = ({
    label, value, onChange, placeholder, icon, dir = "rtl", required
}: {
    label: string; value: string; onChange: (v: string) => void;
    placeholder: string; icon: React.ReactNode; dir?: string; required?: boolean
}) => (
    <div className="space-y-1.5">
        <label className="block text-xs font-bold text-gray-400 text-right">{label}</label>
        <div className="relative">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-11 px-4 pr-10 rounded-xl bg-white/5 border border-white/10 text-white text-sm text-right focus:border-brand-red focus:outline-none transition-colors"
                placeholder={placeholder}
                dir={dir}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">{icon}</div>
        </div>
    </div>
);
