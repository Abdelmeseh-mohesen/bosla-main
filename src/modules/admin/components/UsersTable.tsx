"use client";

import React, { useState } from "react";
import { Student, Teacher, Parent } from "../types/admin.types";
import { AdminService } from "../services/admin.service";
import {
    Mail,
    Phone,
    GraduationCap,
    BookOpen,
    Users as UsersIcon,
    User,
    Power,
    Loader2,
    ShieldCheck,
    ShieldOff,
    LogOut,
    AlertTriangle,
    ShieldAlert,
    UserX,
    UserCheck,
    LogIn
} from "lucide-react";
import { useRouter } from "next/navigation";

interface UsersTableProps {
    students: Student[];
    teachers: Teacher[];
    parents: Parent[];
    activeTab: "students" | "teachers" | "parents";
    onTabChange: (tab: "students" | "teachers" | "parents") => void;
    onUserStatusChange?: () => void;
}

const tabs = [
    { id: "students" as const, label: "الطلاب", icon: GraduationCap },
    { id: "teachers" as const, label: "المعلمين", icon: BookOpen },
    { id: "parents" as const, label: "أولياء الأمور", icon: UsersIcon },
];

// Professional Confirmation Modal
interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
    type: 'logout' | 'disable' | 'enable' | 'loginAs';
    userName: string;
    userType: 'طالب' | 'معلم' | 'ولي أمر';
}

function ConfirmModal({ isOpen, onClose, onConfirm, isLoading, type, userName, userType }: ConfirmModalProps) {
    if (!isOpen) return null;

    const config = {
        logout: {
            icon: LogOut,
            title: "تسجيل خروج المستخدم",
            message: `هل أنت متأكد من تسجيل خروج هذا ${userType} من جميع أجهزته؟`,
            warning: "سيتم إنهاء جميع الجلسات النشطة فوراً",
            confirmText: "تسجيل الخروج",
            iconBg: "bg-orange-500/10",
            iconColor: "text-orange-500",
            buttonGradient: "from-orange-600 to-orange-500",
            buttonShadow: "shadow-orange-500/25 hover:shadow-orange-500/40"
        },
        disable: {
            icon: UserX,
            title: "تعطيل الحساب",
            message: `هل أنت متأكد من تعطيل حساب هذا ${userType}؟`,
            warning: "لن يتمكن المستخدم من الوصول للمنصة حتى يتم إعادة تفعيله",
            confirmText: "تعطيل الحساب",
            iconBg: "bg-rose-500/10",
            iconColor: "text-rose-500",
            buttonGradient: "from-rose-600 to-rose-500",
            buttonShadow: "shadow-rose-500/25 hover:shadow-rose-500/40"
        },
        enable: {
            icon: UserCheck,
            title: "تفعيل الحساب",
            message: `هل أنت متأكد من إعادة تفعيل حساب هذا ${userType}؟`,
            warning: "سيتمكن المستخدم من الوصول للمنصة مرة أخرى",
            confirmText: "تفعيل الحساب",
            iconBg: "bg-emerald-500/10",
            iconColor: "text-emerald-500",
            buttonGradient: "from-emerald-600 to-emerald-500",
            buttonShadow: "shadow-emerald-500/25 hover:shadow-emerald-500/40"
        },
        loginAs: {
            icon: LogIn,
            title: "الدخول كمعلم",
            message: `أنت على وشك الدخول للحساب الخاص بالمعلم:`,
            warning: "ستتمكن من إدارة الامتحانات والطلاب والمحتوى كأنك المعلم تماماً",
            confirmText: "دخول للحساب",
            iconBg: "bg-purple-500/10",
            iconColor: "text-purple-500",
            buttonGradient: "from-purple-600 to-purple-500",
            buttonShadow: "shadow-purple-500/25 hover:shadow-purple-500/40"
        }
    };

    const c = config[type];
    const Icon = c.icon;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
                onClick={!isLoading ? onClose : undefined}
            />

            {/* Modal */}
            <div className="relative bg-gradient-to-b from-[#12161c] to-[#0d1117] border border-white/10 rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 fade-in duration-300">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />

                {/* Icon with animated ring */}
                <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className={`absolute inset-0 ${c.iconBg} rounded-full animate-ping opacity-20`} />
                    <div className={`relative w-full h-full rounded-full ${c.iconBg} flex items-center justify-center border border-white/5`}>
                        <Icon size={42} className={c.iconColor} />
                    </div>
                </div>

                {/* Content */}
                <div className="text-center space-y-4 mb-8">
                    <h3 className="text-2xl font-black text-white">{c.title}</h3>
                    <p className="text-gray-400 font-medium text-lg">{c.message}</p>

                    {/* User Name Card */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 inline-block">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center`}>
                                <User size={20} className={c.iconColor} />
                            </div>
                            <div className="text-right">
                                <p className="text-white font-black text-lg">{userName}</p>
                                <p className="text-gray-500 text-sm font-bold">{userType}</p>
                            </div>
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                        <AlertTriangle size={14} className="text-amber-500" />
                        <span>{c.warning}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`
                            flex-1 h-14 rounded-2xl font-black text-lg
                            flex items-center justify-center gap-3
                            transition-all duration-300
                            disabled:opacity-50 disabled:cursor-not-allowed
                            bg-gradient-to-r ${c.buttonGradient} text-white 
                            shadow-lg ${c.buttonShadow}
                            hover:scale-[1.02] active:scale-[0.98]
                        `}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={22} className="animate-spin" />
                                <span>جاري التنفيذ...</span>
                            </>
                        ) : (
                            <>
                                <Icon size={22} />
                                <span>{c.confirmText}</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 h-14 rounded-2xl border border-white/10 text-gray-300 font-bold text-lg hover:bg-white/5 hover:border-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );
}

export function UsersTable({ students, teachers, parents, activeTab, onTabChange, onUserStatusChange }: UsersTableProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [localTeachers, setLocalTeachers] = useState<Teacher[]>(teachers);
    const [localStudents, setLocalStudents] = useState<Student[]>(students);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

    // Modal state
    const [modal, setModal] = useState<{
        isOpen: boolean;
        type: 'logout' | 'disable' | 'enable' | 'loginAs';
        userId: string;
        teacherData?: Teacher; // Store full teacher data for login
        userName: string;
        userType: 'طالب' | 'معلم' | 'ولي أمر';
        userCategory: 'student' | 'teacher' | 'parent';
        currentStatus?: boolean;
    }>({
        isOpen: false,
        type: 'logout',
        userId: '',
        userName: '',
        userType: 'طالب',
        userCategory: 'student'
    });

    React.useEffect(() => {
        setLocalTeachers(teachers);
    }, [teachers]);

    React.useEffect(() => {
        setLocalStudents(students);
    }, [students]);

    const getGradeLabel = (year: number) => {
        const grades: Record<number, string> = {
            1: "الصف الأول الثانوي",
            2: "الصف الثاني الثانوي",
            3: "الصف الثالث الثانوي",
        };
        return grades[year] || `الصف ${year}`;
    };

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const closeModal = () => {
        setModal(prev => ({ ...prev, isOpen: false }));
    };

    // Open logout confirmation
    const openLogoutModal = (userId: string, userName: string, userType: 'طالب' | 'معلم' | 'ولي أمر', userCategory: 'student' | 'teacher' | 'parent') => {
        setModal({
            isOpen: true,
            type: 'logout',
            userId,
            userName,
            userType,
            userCategory
        });
    };

    // Open toggle confirmation
    const openToggleModal = (userId: string, userName: string, userType: 'طالب' | 'معلم', userCategory: 'student' | 'teacher', isCurrentlyDisabled: boolean) => {
        setModal({
            isOpen: true,
            type: isCurrentlyDisabled ? 'enable' : 'disable',
            userId,
            userName,
            userType,
            userCategory,
            currentStatus: isCurrentlyDisabled
        });
    };

    // Execute modal action
    const executeModalAction = async () => {
        setIsLoading(true);
        const { type, userId, userName, userCategory, currentStatus, teacherData } = modal;

        try {
            if (type === 'loginAs' && teacherData) {
                // 1. Save current admin session
                const currentUser = localStorage.getItem('user');
                const currentRole = localStorage.getItem('role');

                if (currentUser) {
                    localStorage.setItem('adminSession', JSON.stringify({
                        user: currentUser,
                        role: currentRole
                    }));
                }

                // 2. Create teacher user object
                const teacherUser = {
                    id: teacherData.userId,
                    userId: teacherData.userId,
                    teacherId: teacherData.teacherId,
                    fullName: teacherData.fullName,
                    firstName: teacherData.firstName,
                    lastName: teacherData.lastName,
                    email: teacherData.email,
                    photoUrl: teacherData.photoUrl,
                    roles: ["Teacher"],
                    isApproved: true,
                };

                // 3. Update storage
                localStorage.setItem('user', JSON.stringify(teacherUser));
                localStorage.setItem('role', "Teacher");

                // 4. Redirect
                showToast(`جارٍ تحويلك للوحة تحكم المعلم...`, 'success');
                setTimeout(() => {
                    router.push('/dashboard/teacher');
                }, 1000);
                return; // Return early to avoid calling API for other types
            }

            if (type === 'logout') {
                const response = await AdminService.logoutUser(userId);
                if (response.succeeded) {
                    showToast(`✓ تم تسجيل خروج "${userName}" من جميع الأجهزة بنجاح`, 'success');
                } else {
                    showToast(response.message || "حدث خطأ ما", 'error');
                }
            } else {
                // Toggle status
                let response;
                if (userCategory === 'teacher') {
                    response = await AdminService.toggleBlockTeacher(userId);
                    if (response.succeeded) {
                        setLocalTeachers(prev => prev.map(t =>
                            t.userId === userId ? { ...t, isDisable: !t.isDisable } : t
                        ));
                    }
                } else if (userCategory === 'student') {
                    response = await AdminService.toggleBlockStudent(userId);
                    if (response.succeeded) {
                        setLocalStudents(prev => prev.map(s =>
                            s.userId === userId ? { ...s, isDisable: !s.isDisable } : s
                        ));
                    }
                }

                if (response?.succeeded) {
                    showToast(
                        currentStatus
                            ? `✓ تم تفعيل حساب "${userName}" بنجاح`
                            : `✓ تم تعطيل حساب "${userName}" بنجاح`,
                        'success'
                    );
                    if (onUserStatusChange) onUserStatusChange();
                } else {
                    showToast(response?.message || "حدث خطأ ما", 'error');
                }
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || "فشلت العملية", 'error');
        } finally {
            setIsLoading(false);
            closeModal();
        }
    };

    // Login as Teacher
    const handleLoginAsTeacher = (teacher: Teacher) => {
        setModal({
            isOpen: true,
            type: 'loginAs',
            userId: teacher.userId,
            userName: teacher.fullName || teacher.firstName,
            userType: 'معلم',
            userCategory: 'teacher',
            teacherData: teacher
        });
    };


    // Reusable Components
    const LogoutButton = ({ userId, userName, userType, userCategory }: {
        userId: string;
        userName: string;
        userType: 'طالب' | 'معلم' | 'ولي أمر';
        userCategory: 'student' | 'teacher' | 'parent';
    }) => (
        <button
            onClick={() => openLogoutModal(userId, userName, userType, userCategory)}
            className="
                group/logout relative overflow-hidden
                flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-xs
                bg-gradient-to-r from-orange-600/10 to-orange-500/10
                text-orange-400 border border-orange-500/20
                hover:from-orange-600 hover:to-orange-500 hover:text-white
                hover:shadow-lg hover:shadow-orange-500/25 hover:scale-105
                transition-all duration-300
            "
        >
            <LogOut size={12} />
            <span>خروج</span>
        </button>
    );


    const LoginAsButton = ({ teacher }: { teacher: Teacher }) => (
        <button
            onClick={() => handleLoginAsTeacher(teacher)}
            className="
                group/login relative overflow-hidden
                flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-xs
                bg-gradient-to-r from-purple-600/10 to-purple-500/10
                text-purple-400 border border-purple-500/20
                hover:from-purple-600 hover:to-purple-500 hover:text-white
                hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105
                transition-all duration-300
            "
            title="دخول كمعلم"
        >
            <LogIn size={12} />
            <span>دخول</span>
        </button>
    );

    const ToggleButton = ({
        userId,
        userName,
        userType,
        userCategory,
        isDisabled
    }: {
        userId: string;
        userName: string;
        userType: 'طالب' | 'معلم';
        userCategory: 'student' | 'teacher';
        isDisabled: boolean;
    }) => (
        <button
            onClick={() => openToggleModal(userId, userName, userType, userCategory, isDisabled)}
            className={`
                group/btn relative overflow-hidden
                flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-xs
                transition-all duration-300
                ${isDisabled
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105'
                    : 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:scale-105'
                }
            `}
        >
            <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <Power size={12} />
            <span className="relative z-10">{isDisabled ? 'تفعيل' : 'تعطيل'}</span>
        </button>
    );

    const StatusBadge = ({ isDisabled }: { isDisabled: boolean }) => (
        <div className={`
            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold
            ${isDisabled
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }
        `}>
            {isDisabled ? <ShieldOff size={12} /> : <ShieldCheck size={12} />}
            <span>{isDisabled ? 'معطل' : 'نشط'}</span>
        </div>
    );

    return (
        <div className="bg-[#0d1117]/80 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden relative">
            {/* Toast Notification */}
            {toast && (
                <div className={`
                    fixed top-6 left-1/2 -translate-x-1/2 z-[150]
                    px-8 py-4 rounded-2xl font-bold text-base
                    animate-in fade-in slide-in-from-top-4 duration-300
                    shadow-2xl backdrop-blur-xl
                    ${toast.type === 'success'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }
                `}>
                    {toast.message}
                </div>
            )}

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={modal.isOpen}
                onClose={closeModal}
                onConfirm={executeModalAction}
                isLoading={isLoading}
                type={modal.type}
                userName={modal.userName}
                userType={modal.userType}
            />

            {/* Tabs */}
            <div className="flex border-b border-white/5">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const count = tab.id === "students" ? localStudents.length :
                        tab.id === "teachers" ? localTeachers.length : parents.length;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`
                                flex-1 flex items-center justify-center gap-3 
                                px-6 py-5 font-bold text-sm
                                transition-all duration-300
                                relative overflow-hidden
                                ${activeTab === tab.id
                                    ? "text-white bg-white/5"
                                    : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]"
                                }
                            `}
                        >
                            <Icon size={20} />
                            <span>{tab.label}</span>
                            <span className={`
                                px-2.5 py-1 rounded-full text-xs font-black
                                ${activeTab === tab.id ? "bg-brand-red/20 text-brand-red" : "bg-white/5 text-gray-500"}
                            `}>
                                {count}
                            </span>
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand-red to-transparent" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tables */}
            <div className="overflow-x-auto">
                {/* Students Table */}
                {activeTab === "students" && (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-right px-6 py-4 text-gray-400 font-bold text-sm">الطالب</th>
                                <th className="text-right px-6 py-4 text-gray-400 font-bold text-sm">البريد الإلكتروني</th>
                                <th className="text-right px-6 py-4 text-gray-400 font-bold text-sm">الصف الدراسي</th>
                                <th className="text-right px-6 py-4 text-gray-400 font-bold text-sm">هاتف ولي الأمر</th>
                                <th className="text-right px-6 py-4 text-gray-400 font-bold text-sm">الحالة</th>
                                <th className="text-center px-6 py-4 text-gray-400 font-bold text-sm">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {localStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-gray-500">
                                        <GraduationCap size={48} className="mx-auto mb-4 opacity-30" />
                                        <p className="font-bold">لا يوجد طلاب مسجلين</p>
                                    </td>
                                </tr>
                            ) : (
                                localStudents.map((student, index) => (
                                    <tr
                                        key={student.studentId}
                                        className={`
                                            border-b border-white/[0.02] hover:bg-white/[0.02] transition-all duration-300 group
                                            ${student.isDisable ? 'opacity-60' : ''}
                                        `}
                                        style={{ animationDelay: `${index * 50}ms`, animation: 'fadeInUp 0.4s ease-out forwards' }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${student.isDisable ? 'from-gray-500/20 to-gray-600/10 border-gray-500/20' : 'from-blue-500/20 to-blue-600/10 border-blue-500/20'} border flex items-center justify-center`}>
                                                    <User size={18} className={student.isDisable ? "text-gray-400" : "text-blue-400"} />
                                                </div>
                                                <p className={`font-bold transition-colors ${student.isDisable ? 'text-gray-400' : 'text-white group-hover:text-blue-400'}`}>
                                                    {student.fullName || `${student.firstName} ${student.lastName}`}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Mail size={14} />
                                                <span className="text-sm">{student.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-sm font-bold">
                                                {getGradeLabel(student.gradeYear)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Phone size={14} />
                                                <span className="text-sm" dir="ltr">{student.parentPhoneNumber || "-"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge isDisabled={student.isDisable} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                <ToggleButton
                                                    userId={student.userId}
                                                    userName={student.fullName || student.firstName}
                                                    userType="طالب"
                                                    userCategory="student"
                                                    isDisabled={student.isDisable}
                                                />
                                                <LogoutButton
                                                    userId={student.userId}
                                                    userName={student.fullName || student.firstName}
                                                    userType="طالب"
                                                    userCategory="student"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}

                {/* Teachers Table */}
                {activeTab === "teachers" && (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-right px-6 py-4 text-gray-400 font-bold text-sm">المعلم</th>
                                <th className="text-right px-6 py-4 text-gray-400 font-bold text-sm">البريد الإلكتروني</th>
                                <th className="text-right px-6 py-4 text-gray-400 font-bold text-sm">المادة</th>
                                <th className="text-right px-6 py-4 text-gray-400 font-bold text-sm">الهاتف</th>
                                <th className="text-right px-6 py-4 text-gray-400 font-bold text-sm">الحالة</th>
                                <th className="text-center px-6 py-4 text-gray-400 font-bold text-sm">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {localTeachers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-gray-500">
                                        <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
                                        <p className="font-bold">لا يوجد معلمين مسجلين</p>
                                    </td>
                                </tr>
                            ) : (
                                localTeachers.map((teacher, index) => (
                                    <tr
                                        key={teacher.teacherId}
                                        className={`
                                            border-b border-white/[0.02] hover:bg-white/[0.02] transition-all duration-300 group
                                            ${teacher.isDisable ? 'opacity-60' : ''}
                                        `}
                                        style={{ animationDelay: `${index * 50}ms`, animation: 'fadeInUp 0.4s ease-out forwards' }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {teacher.photoUrl && !failedImages.has(teacher.photoUrl) ? (
                                                    <img
                                                        src={teacher.photoUrl}
                                                        alt={teacher.fullName}
                                                        className={`w-10 h-10 rounded-xl object-cover border ${teacher.isDisable ? 'border-gray-600 grayscale' : 'border-white/10'}`}
                                                        onError={() => setFailedImages(prev => new Set(prev).add(teacher.photoUrl!))}
                                                    />
                                                ) : (
                                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${teacher.isDisable ? 'from-gray-500/20 to-gray-600/10 border-gray-500/20' : 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20'} border flex items-center justify-center`}>
                                                        <User size={18} className={teacher.isDisable ? "text-gray-400" : "text-emerald-400"} />
                                                    </div>
                                                )}
                                                <p className={`font-bold transition-colors ${teacher.isDisable ? 'text-gray-400' : 'text-white group-hover:text-emerald-400'}`}>
                                                    {teacher.fullName || `${teacher.firstName} ${teacher.lastName}`}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Mail size={14} />
                                                <span className="text-sm">{teacher.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1.5 bg-violet-500/10 text-violet-400 rounded-lg text-sm font-bold">
                                                {teacher.subjectName || "-"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Phone size={14} />
                                                <span className="text-sm" dir="ltr">{teacher.phoneNumber || "-"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge isDisabled={teacher.isDisable} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                <LoginAsButton teacher={teacher} />
                                                <ToggleButton
                                                    userId={teacher.userId}
                                                    userName={teacher.fullName || teacher.firstName}
                                                    userType="معلم"
                                                    userCategory="teacher"
                                                    isDisabled={teacher.isDisable}
                                                />
                                                <LogoutButton
                                                    userId={teacher.userId}
                                                    userName={teacher.fullName || teacher.firstName}
                                                    userType="معلم"
                                                    userCategory="teacher"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}

                {/* Parents Table */}
                {activeTab === "parents" && (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-right px-6 py-4 text-gray-400 font-bold text-sm">ولي الأمر</th>
                                <th className="text-right px-6 py-4 text-gray-400 font-bold text-sm">البريد الإلكتروني</th>
                                <th className="text-right px-6 py-4 text-gray-400 font-bold text-sm">الهاتف</th>
                                <th className="text-right px-6 py-4 text-gray-400 font-bold text-sm">عدد الأبناء</th>
                                <th className="text-center px-6 py-4 text-gray-400 font-bold text-sm">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parents.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-gray-500">
                                        <UsersIcon size={48} className="mx-auto mb-4 opacity-30" />
                                        <p className="font-bold">لا يوجد أولياء أمور مسجلين</p>
                                    </td>
                                </tr>
                            ) : (
                                parents.map((parent, index) => (
                                    <tr
                                        key={parent.parentId}
                                        className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group"
                                        style={{ animationDelay: `${index * 50}ms`, animation: 'fadeInUp 0.4s ease-out forwards' }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/20 flex items-center justify-center">
                                                    <User size={18} className="text-orange-400" />
                                                </div>
                                                <p className="font-bold text-white group-hover:text-orange-400 transition-colors">
                                                    {parent.fullName || `${parent.firstName} ${parent.lastName}`}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Mail size={14} />
                                                <span className="text-sm">{parent.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Phone size={14} />
                                                <span className="text-sm" dir="ltr">{parent.parentPhoneNumber || "-"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1.5 bg-orange-500/10 text-orange-400 rounded-lg text-sm font-black">
                                                {parent.childrenCount} طالب
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <LogoutButton
                                                    userId={parent.userId}
                                                    userName={parent.fullName || parent.firstName}
                                                    userType="ولي أمر"
                                                    userCategory="parent"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
