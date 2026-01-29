"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/modules/auth/services/auth.service";
import { Button } from "@/shared/ui/button";
import {
    GraduationCap,
    BookOpen,
    Loader2,
    User,
    Phone,
    MapPin,
    ArrowRight,
    CheckCircle,
    AlertCircle
} from "lucide-react";

type Step = "role" | "student-form" | "teacher-form";

export default function CompleteProfilePage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("role");
    const [selectedRole, setSelectedRole] = useState<"Student" | "Teacher" | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string>("");
    const [subjects, setSubjects] = useState<any[]>([]);
    const [educationStages, setEducationStages] = useState<any[]>([]);

    // Student form
    const [studentForm, setStudentForm] = useState({
        parentPhoneNumber: "",
        studentPhoneNumber: "",
        governorate: "",
        city: ""
    });

    // Teacher form
    const [teacherForm, setTeacherForm] = useState({
        subjectId: 0,
        phoneNumber: "",
        governorate: "",
        city: "",
        educationStageIds: [] as number[]
    });

    useEffect(() => {
        // Get user data from localStorage
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            setUserId(user.applicationUserId || user.id);

            // If user already has a role, redirect to dashboard
            if (user.roles && user.roles.length > 0 && !user.roles.includes("User")) {
                redirectToDashboard(user.roles[0]);
            }
        } else {
            // No user data, redirect to login
            router.push("/login");
        }

        // Fetch subjects and education stages
        loadFormData();
    }, []);

    const loadFormData = async () => {
        try {
            const [subjectsRes, stagesRes] = await Promise.all([
                AuthService.getSubjects(),
                AuthService.getEducationStages()
            ]);
            if (subjectsRes.succeeded) setSubjects(subjectsRes.data || []);
            if (stagesRes.succeeded) setEducationStages(stagesRes.data || []);
        } catch (e) {
            console.error("Error loading form data:", e);
        }
    };

    const redirectToDashboard = (role: string) => {
        switch (role) {
            case "Teacher":
                router.push("/dashboard/teacher");
                break;
            case "Student":
                router.push("/dashboard/student");
                break;
            default:
                router.push("/dashboard");
        }
    };

    const handleRoleSelect = async (role: "Student" | "Teacher") => {
        setSelectedRole(role);
        setError(null);
        setIsLoading(true);

        try {
            // Update user role
            const response = await AuthService.updateUserRole({
                userId,
                newRole: role
            });

            if (response.succeeded) {
                // Move to profile form
                setStep(role === "Student" ? "student-form" : "teacher-form");
            } else {
                setError(response.message || "فشل في تحديث الدور");
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || "حدث خطأ أثناء التحديث");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStudentSubmit = async () => {
        if (!studentForm.parentPhoneNumber || studentForm.parentPhoneNumber.length < 11) {
            setError("الرجاء إدخال رقم هاتف ولي الأمر صحيح");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await AuthService.createStudentProfile({
                userId,
                parentPhoneNumber: studentForm.parentPhoneNumber,
                studentPhoneNumber: studentForm.studentPhoneNumber || undefined,
                governorate: studentForm.governorate || undefined,
                city: studentForm.city || undefined
            });

            if (response.succeeded) {
                router.push("/dashboard/student");
            } else {
                setError(response.message || "فشل في إنشاء الملف الشخصي");
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || "حدث خطأ");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTeacherSubmit = async () => {
        if (!teacherForm.subjectId) {
            setError("الرجاء اختيار المادة");
            return;
        }
        if (teacherForm.educationStageIds.length === 0) {
            setError("الرجاء اختيار مرحلة دراسية واحدة على الأقل");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await AuthService.createTeacherProfile({
                UserId: userId,
                SubjectId: teacherForm.subjectId,
                PhoneNumber: teacherForm.phoneNumber || undefined,
                Governorate: teacherForm.governorate || undefined,
                City: teacherForm.city || undefined,
                EducationStageIds: teacherForm.educationStageIds
            });

            if (response.succeeded) {
                // Check if teacherId was saved in response
                const userStr = localStorage.getItem("user");
                const user = userStr ? JSON.parse(userStr) : null;

                if (user?.teacherId && typeof user.teacherId === 'number') {
                    // We have numeric teacherId, can redirect
                    router.push("/dashboard/teacher");
                } else {
                    // Need to re-login to get proper teacherId
                    // Clear localStorage and redirect to login with success message
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    localStorage.removeItem("role");

                    // Store message in sessionStorage to show on login page
                    sessionStorage.setItem("loginMessage", "تم إنشاء حسابك بنجاح! يرجى تسجيل الدخول مرة أخرى");

                    router.push("/login");
                }
            } else {
                setError(response.message || "فشل في إنشاء الملف الشخصي");
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || "حدث خطأ");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleEducationStage = (stageId: number) => {
        setTeacherForm(prev => ({
            ...prev,
            educationStageIds: prev.educationStageIds.includes(stageId)
                ? prev.educationStageIds.filter(id => id !== stageId)
                : [...prev.educationStageIds, stageId]
        }));
    };

    return (
        <div className="min-h-screen bg-[#06080a] flex items-center justify-center p-4">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-brand-red/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="relative z-10 w-full max-w-lg">
                {/* Role Selection */}
                {step === "role" && (
                    <div className="text-center space-y-8 animate-in fade-in duration-500">
                        <div className="space-y-3">
                            <h1 className="text-4xl font-black text-white">مرحباً بك! 👋</h1>
                            <p className="text-gray-400 text-lg">اختر نوع حسابك للمتابعة</p>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-center font-bold flex items-center justify-center gap-2">
                                <AlertCircle size={20} />
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            {/* Student Card */}
                            <button
                                onClick={() => handleRoleSelect("Student")}
                                disabled={isLoading}
                                className="group bg-gradient-to-br from-[#0d1117] to-[#12141a] p-8 rounded-2xl border border-white/5 hover:border-brand-red/30 transition-all duration-300 hover:scale-105 disabled:opacity-50"
                            >
                                <div className="w-20 h-20 rounded-2xl bg-brand-red/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <GraduationCap size={40} className="text-brand-red" />
                                </div>
                                <h3 className="text-xl font-black text-white mb-2">طالب</h3>
                                <p className="text-gray-500 text-sm">انضم كطالب للتعلم</p>
                            </button>

                            {/* Teacher Card */}
                            <button
                                onClick={() => handleRoleSelect("Teacher")}
                                disabled={isLoading}
                                className="group bg-gradient-to-br from-[#0d1117] to-[#12141a] p-8 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all duration-300 hover:scale-105 disabled:opacity-50"
                            >
                                <div className="w-20 h-20 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <BookOpen size={40} className="text-purple-400" />
                                </div>
                                <h3 className="text-xl font-black text-white mb-2">معلم</h3>
                                <p className="text-gray-500 text-sm">انضم كمعلم للتدريس</p>
                            </button>
                        </div>

                        {isLoading && (
                            <div className="flex items-center justify-center gap-2 text-gray-400">
                                <Loader2 className="animate-spin" size={20} />
                                <span>جاري التحديث...</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Student Form */}
                {step === "student-form" && (
                    <div className="bg-gradient-to-br from-[#0d1117] to-[#12141a] p-8 rounded-2xl border border-white/5 animate-in fade-in slide-in-from-right duration-500">
                        <button
                            onClick={() => setStep("role")}
                            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                        >
                            <ArrowRight size={18} />
                            <span>رجوع</span>
                        </button>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-brand-red/10 flex items-center justify-center">
                                <GraduationCap size={28} className="text-brand-red" />
                            </div>
                            <div className="text-right flex-1">
                                <h2 className="text-2xl font-black text-white">بيانات الطالب</h2>
                                <p className="text-gray-500">أكمل بياناتك للمتابعة</p>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-center font-bold mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-400 text-right">
                                    رقم هاتف ولي الأمر <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        value={studentForm.parentPhoneNumber}
                                        onChange={(e) => setStudentForm(p => ({ ...p, parentPhoneNumber: e.target.value }))}
                                        className="w-full h-12 px-4 pr-12 rounded-xl bg-white/5 border border-white/10 text-white text-right focus:border-brand-red focus:outline-none"
                                        placeholder="01xxxxxxxxx"
                                        dir="ltr"
                                    />
                                    <Phone size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-400 text-right">رقم هاتف الطالب</label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        value={studentForm.studentPhoneNumber}
                                        onChange={(e) => setStudentForm(p => ({ ...p, studentPhoneNumber: e.target.value }))}
                                        className="w-full h-12 px-4 pr-12 rounded-xl bg-white/5 border border-white/10 text-white text-right focus:border-brand-red focus:outline-none"
                                        placeholder="01xxxxxxxxx"
                                        dir="ltr"
                                    />
                                    <Phone size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-400 text-right">المحافظة</label>
                                    <input
                                        type="text"
                                        value={studentForm.governorate}
                                        onChange={(e) => setStudentForm(p => ({ ...p, governorate: e.target.value }))}
                                        className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-right focus:border-brand-red focus:outline-none"
                                        placeholder="القاهرة"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-400 text-right">المدينة</label>
                                    <input
                                        type="text"
                                        value={studentForm.city}
                                        onChange={(e) => setStudentForm(p => ({ ...p, city: e.target.value }))}
                                        className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-right focus:border-brand-red focus:outline-none"
                                        placeholder="مدينة نصر"
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleStudentSubmit}
                                disabled={isLoading}
                                className="w-full h-12 bg-brand-red hover:bg-red-600 rounded-xl font-bold mt-4"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : "إنشاء الحساب"}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Teacher Form */}
                {step === "teacher-form" && (
                    <div className="bg-gradient-to-br from-[#0d1117] to-[#12141a] p-8 rounded-2xl border border-white/5 animate-in fade-in slide-in-from-right duration-500">
                        <button
                            onClick={() => setStep("role")}
                            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                        >
                            <ArrowRight size={18} />
                            <span>رجوع</span>
                        </button>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                                <BookOpen size={28} className="text-purple-400" />
                            </div>
                            <div className="text-right flex-1">
                                <h2 className="text-2xl font-black text-white">بيانات المعلم</h2>
                                <p className="text-gray-500">أكمل بياناتك للمتابعة</p>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-center font-bold mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-400 text-right">
                                    المادة <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={teacherForm.subjectId}
                                    onChange={(e) => setTeacherForm(p => ({ ...p, subjectId: Number(e.target.value) }))}
                                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-right focus:border-purple-500 focus:outline-none"
                                >
                                    <option value={0} className="bg-[#0d1117]">اختر المادة</option>
                                    {subjects.map(subject => (
                                        <option key={subject.id} value={subject.id} className="bg-[#0d1117]">
                                            {subject.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-400 text-right">
                                    المراحل الدراسية <span className="text-red-500">*</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {educationStages.map(stage => (
                                        <button
                                            key={stage.id}
                                            type="button"
                                            onClick={() => toggleEducationStage(stage.id)}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${teacherForm.educationStageIds.includes(stage.id)
                                                ? 'bg-purple-500 text-white'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            {stage.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-400 text-right">رقم الهاتف</label>
                                <input
                                    type="tel"
                                    value={teacherForm.phoneNumber}
                                    onChange={(e) => setTeacherForm(p => ({ ...p, phoneNumber: e.target.value }))}
                                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-right focus:border-purple-500 focus:outline-none"
                                    placeholder="01xxxxxxxxx"
                                    dir="ltr"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-400 text-right">المحافظة</label>
                                    <input
                                        type="text"
                                        value={teacherForm.governorate}
                                        onChange={(e) => setTeacherForm(p => ({ ...p, governorate: e.target.value }))}
                                        className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-right focus:border-purple-500 focus:outline-none"
                                        placeholder="القاهرة"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-400 text-right">المدينة</label>
                                    <input
                                        type="text"
                                        value={teacherForm.city}
                                        onChange={(e) => setTeacherForm(p => ({ ...p, city: e.target.value }))}
                                        className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-right focus:border-purple-500 focus:outline-none"
                                        placeholder="مدينة نصر"
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleTeacherSubmit}
                                disabled={isLoading}
                                className="w-full h-12 bg-purple-500 hover:bg-purple-600 rounded-xl font-bold mt-4"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : "إنشاء الحساب"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
