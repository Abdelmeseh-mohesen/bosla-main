"use client";

import React, { useState, useEffect } from "react";
import { useParentAuth } from "@/modules/parent/hooks/use-parent-auth";
import { ParentService } from "@/modules/parent/services/parent.service";
import { Student, StudentCourse, ExamScore } from "@/modules/parent/types/parent.types";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";
import {
    LogOut,
    Loader2,
    Users,
    GraduationCap,
    BookOpen,
    Trophy,
    TrendingUp,
    ChevronLeft,
    ChevronDown,
    CheckCircle2,
    Clock,
    XCircle,
    Award,
    Target,
    Calendar,
    BarChart3,
    Sparkles,
    Eye,
    Star,
    User,
    Mail,
    Shield
} from "lucide-react";

export default function ParentDashboardPage() {
    const { user, parentId, isLoading: authLoading, logout } = useParentAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<StudentCourse | null>(null);
    const [examScores, setExamScores] = useState<ExamScore[]>([]);
    const [isLoadingScores, setIsLoadingScores] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [expandedStudentId, setExpandedStudentId] = useState<number | null>(null);

    // Fetch students
    useEffect(() => {
        const fetchStudents = async () => {
            if (!parentId) return;

            setIsLoading(true);
            setError(null);

            try {
                const response = await ParentService.getMyStudents(parentId);
                if (response.succeeded) {
                    setStudents(response.data);
                } else {
                    setError(response.message || "فشل في تحميل بيانات الطلاب");
                }
            } catch (err: any) {
                console.error("Error fetching students:", err);
                setError(err?.response?.data?.message || "حدث خطأ أثناء تحميل البيانات");
            } finally {
                setIsLoading(false);
            }
        };

        if (parentId) {
            fetchStudents();
        }
    }, [parentId]);

    // Fetch exam scores for selected course
    const handleViewExamScores = async (student: Student, course: StudentCourse) => {
        setSelectedStudent(student);
        setSelectedCourse(course);
        setIsLoadingScores(true);
        setExamScores([]);

        try {
            const response = await ParentService.getStudentExamScores(student.studentId, course.courseId);
            if (response.succeeded) {
                setExamScores(response.data);
            }
        } catch (err: any) {
            console.error("Error fetching exam scores:", err);
        } finally {
            setIsLoadingScores(false);
        }
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await logout();
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Approved':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 size={12} />
                        مفعّل
                    </span>
                );
            case 'Pending':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        <Clock size={12} />
                        قيد المراجعة
                    </span>
                );
            case 'Rejected':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                        <XCircle size={12} />
                        مرفوض
                    </span>
                );
            default:
                return null;
        }
    };

    const getScoreColor = (percentage: number) => {
        if (percentage >= 85) return 'from-emerald-500 to-teal-500';
        if (percentage >= 70) return 'from-blue-500 to-cyan-500';
        if (percentage >= 50) return 'from-amber-500 to-orange-500';
        return 'from-red-500 to-rose-500';
    };

    const getScoreTextColor = (percentage: number) => {
        if (percentage >= 85) return 'text-emerald-400';
        if (percentage >= 70) return 'text-blue-400';
        if (percentage >= 50) return 'text-amber-400';
        return 'text-red-400';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    // Calculate statistics
    const totalCourses = students.reduce((acc, s) => acc + s.courses.length, 0);
    const approvedCourses = students.reduce((acc, s) => acc + s.courses.filter(c => c.status === 'Approved').length, 0);

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-[#06080a] flex items-center justify-center">
                <div className="text-center space-y-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-brand-red/20 border-t-brand-red animate-spin mx-auto" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Shield className="w-10 h-10 text-brand-red animate-pulse" />
                        </div>
                    </div>
                    <p className="text-xl font-black text-white">جاري تحميل بيانات أبنائك...</p>
                    <p className="text-gray-500 font-bold">لحظات قليلة</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#06080a] relative overflow-hidden">
            {/* Premium Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-30%] right-[-15%] w-[800px] h-[800px] bg-brand-red/8 rounded-full blur-[200px] animate-pulse" />
                <div className="absolute bottom-[-30%] left-[-15%] w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[200px]" />
                <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/3 rounded-full blur-[180px]" />
            </div>

            {/* Grid Pattern Overlay */}
            <div className="fixed inset-0 z-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px'
                }}
            />

            <div className="relative z-10 container mx-auto px-4 md:px-8 py-8 md:py-12">
                {/* Premium Header */}
                <div className="mb-12 animate-in fade-in slide-in-from-top-6 duration-700">
                    <div className="relative overflow-hidden bg-gradient-to-l from-[#0d1117] via-[#0f1419] to-[#0d1117] rounded-[2.5rem] border border-white/5 p-8 md:p-10 backdrop-blur-xl shadow-2xl">
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-brand-red/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-600/5 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

                        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                            {/* User Info */}
                            <div className="flex items-center gap-6 order-2 lg:order-1">
                                <div className="relative group">
                                    {/* Avatar */}
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-brand-red via-red-600 to-rose-700 flex items-center justify-center text-white shadow-2xl shadow-brand-red/30 overflow-hidden ring-4 ring-brand-red/20">
                                        {user?.photoUrl ? (
                                            <img src={user.photoUrl} alt={user.firstName} className="w-full h-full object-cover" />
                                        ) : (
                                            <Shield size={40} />
                                        )}
                                    </div>
                                    {/* Verified Badge */}
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                        <CheckCircle2 size={16} className="text-white" />
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="bg-gradient-to-r from-brand-red/20 to-rose-500/20 text-brand-red text-xs font-black px-4 py-1.5 rounded-full flex items-center gap-1.5 border border-brand-red/20">
                                            <Shield size={12} />
                                            ولي أمر مميز
                                        </span>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                                        أهلاً بك، <span className="bg-gradient-to-l from-brand-red to-rose-500 text-transparent bg-clip-text">{user?.firstName || 'ولي الأمر'}</span>
                                    </h1>
                                    <p className="text-gray-500 font-bold flex items-center gap-2 justify-end">
                                        <Mail size={14} />
                                        {user?.email || 'تابع تقدم أبنائك الدراسي'}
                                    </p>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="order-1 lg:order-2 w-full lg:w-auto flex justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsLogoutModalOpen(true)}
                                    className="h-14 px-8 rounded-2xl border-white/10 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 font-bold text-gray-400 transition-all duration-300 flex items-center gap-3 group bg-white/5 backdrop-blur-sm"
                                >
                                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                                    تسجيل الخروج
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                    <div className="group relative overflow-hidden bg-gradient-to-br from-[#0d1117] to-[#161b22] rounded-2xl border border-white/5 p-6 hover:border-brand-red/20 transition-all duration-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-red/20 to-rose-500/20 flex items-center justify-center text-brand-red mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Users size={28} />
                            </div>
                            <p className="text-4xl font-black text-white mb-1">{students.length}</p>
                            <p className="text-gray-500 font-bold text-sm">عدد الأبناء</p>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden bg-gradient-to-br from-[#0d1117] to-[#161b22] rounded-2xl border border-white/5 p-6 hover:border-emerald-500/20 transition-all duration-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                                <BookOpen size={28} />
                            </div>
                            <p className="text-4xl font-black text-white mb-1">{totalCourses}</p>
                            <p className="text-gray-500 font-bold text-sm">إجمالي الكورسات</p>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden bg-gradient-to-br from-[#0d1117] to-[#161b22] rounded-2xl border border-white/5 p-6 hover:border-blue-500/20 transition-all duration-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                                <CheckCircle2 size={28} />
                            </div>
                            <p className="text-4xl font-black text-white mb-1">{approvedCourses}</p>
                            <p className="text-gray-500 font-bold text-sm">كورسات مفعّلة</p>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden bg-gradient-to-br from-[#0d1117] to-[#161b22] rounded-2xl border border-white/5 p-6 hover:border-amber-500/20 transition-all duration-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Trophy size={28} />
                            </div>
                            <p className="text-4xl font-black text-white mb-1">{totalCourses - approvedCourses}</p>
                            <p className="text-gray-500 font-bold text-sm">قيد المراجعة</p>
                        </div>
                    </div>
                </div>

                {/* Students List */}
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-red/20 to-rose-500/20 flex items-center justify-center text-brand-red">
                            <GraduationCap size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white">أبنائي</h2>
                            <p className="text-gray-500 font-bold text-sm">تابع تقدمهم الدراسي ونتائج امتحاناتهم</p>
                        </div>
                    </div>

                    {error ? (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
                            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <p className="text-red-400 font-bold text-lg">{error}</p>
                        </div>
                    ) : students.length === 0 ? (
                        <div className="bg-[#0d1117] border border-white/5 rounded-3xl p-12 text-center">
                            <div className="w-24 h-24 rounded-full bg-gray-800/50 flex items-center justify-center mx-auto mb-6">
                                <Users className="w-12 h-12 text-gray-600" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-3">لا يوجد طلاب مرتبطين</h3>
                            <p className="text-gray-500 font-bold">لم يتم ربط أي طالب بحسابك بعد</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {students.map((student, index) => (
                                <div
                                    key={student.studentId}
                                    className="group bg-gradient-to-l from-[#0d1117] to-[#0f1419] rounded-3xl border border-white/5 overflow-hidden hover:border-brand-red/20 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {/* Student Header */}
                                    <button
                                        onClick={() => setExpandedStudentId(expandedStudentId === student.studentId ? null : student.studentId)}
                                        className="w-full p-6 md:p-8 flex items-center justify-between cursor-pointer hover:bg-white/[0.01] transition-colors"
                                    >
                                        <div className="flex items-center gap-5">
                                            {/* Avatar */}
                                            <div className="relative">
                                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                                                    <span className="text-2xl md:text-3xl font-black">
                                                        {student.firstName.charAt(0)}
                                                    </span>
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-brand-red to-rose-600 rounded-full flex items-center justify-center text-white text-xs font-black shadow-lg">
                                                    {student.gradeYear}
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <h3 className="text-xl md:text-2xl font-black text-white mb-1">{student.fullName}</h3>
                                                <p className="text-gray-500 font-bold text-sm flex items-center gap-2 justify-end">
                                                    <Mail size={12} />
                                                    {student.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="hidden md:flex items-center gap-6">
                                                <div className="text-center">
                                                    <p className="text-2xl font-black text-white">{student.courses.length}</p>
                                                    <p className="text-gray-500 font-bold text-xs">كورسات</p>
                                                </div>
                                                <div className="h-10 w-px bg-white/10" />
                                                <div className="text-center">
                                                    <p className="text-2xl font-black text-emerald-400">{student.courses.filter(c => c.status === 'Approved').length}</p>
                                                    <p className="text-gray-500 font-bold text-xs">مفعّلة</p>
                                                </div>
                                            </div>

                                            <ChevronDown
                                                size={24}
                                                className={`text-gray-500 transition-transform duration-300 ${expandedStudentId === student.studentId ? 'rotate-180' : ''}`}
                                            />
                                        </div>
                                    </button>

                                    {/* Courses List (Expandable) */}
                                    {expandedStudentId === student.studentId && (
                                        <div className="border-t border-white/5 p-6 md:p-8 animate-in fade-in slide-in-from-top-4 duration-300">
                                            {student.courses.length === 0 ? (
                                                <div className="text-center py-8">
                                                    <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                                    <p className="text-gray-500 font-bold">لم يشترك في أي كورس بعد</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {student.courses.map((course) => (
                                                        <div
                                                            key={course.courseId}
                                                            className="group/course bg-[#0d1117] rounded-2xl border border-white/5 p-5 hover:border-brand-red/20 transition-all duration-300 cursor-pointer"
                                                            onClick={() => course.status === 'Approved' && handleViewExamScores(student, course)}
                                                        >
                                                            <div className="flex items-start justify-between mb-4">
                                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-blue-400">
                                                                    <BookOpen size={24} />
                                                                </div>
                                                                {getStatusBadge(course.status)}
                                                            </div>

                                                            <h4 className="text-lg font-black text-white mb-2 group-hover/course:text-brand-red transition-colors">
                                                                {course.courseTitle}
                                                            </h4>

                                                            <p className="text-gray-500 text-sm font-bold flex items-center gap-2">
                                                                <Calendar size={12} />
                                                                {formatDate(course.createdAt)}
                                                            </p>

                                                            {course.status === 'Approved' && (
                                                                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                                                    <span className="text-gray-400 text-sm font-bold">عرض نتائج الامتحانات</span>
                                                                    <Eye size={16} className="text-brand-red group-hover/course:translate-x-[-4px] transition-transform" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Exam Scores Modal */}
            <Modal
                isOpen={selectedCourse !== null}
                onClose={() => {
                    setSelectedCourse(null);
                    setSelectedStudent(null);
                    setExamScores([]);
                }}
                title={`نتائج امتحانات: ${selectedCourse?.courseTitle || ''}`}
                className="max-w-4xl"
            >
                <div className="space-y-6">
                    {/* Student Info Header */}
                    {selectedStudent && (
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xl font-black">
                                {selectedStudent.firstName.charAt(0)}
                            </div>
                            <div className="text-right flex-1">
                                <h3 className="text-lg font-black text-white">{selectedStudent.fullName}</h3>
                                <p className="text-gray-500 text-sm font-bold">{selectedCourse?.courseTitle}</p>
                            </div>
                        </div>
                    )}

                    {/* Scores List */}
                    {isLoadingScores ? (
                        <div className="py-12 text-center">
                            <Loader2 className="w-12 h-12 text-brand-red animate-spin mx-auto mb-4" />
                            <p className="text-gray-400 font-bold">جاري تحميل النتائج...</p>
                        </div>
                    ) : examScores.length === 0 ? (
                        <div className="py-12 text-center">
                            <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-black text-white mb-2">لا توجد امتحانات</h3>
                            <p className="text-gray-500 font-bold">لم يقم الطالب بأداء أي امتحان في هذا الكورس بعد</p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto px-2">
                            {examScores.map((exam, index) => (
                                <div
                                    key={exam.examId}
                                    className="relative overflow-hidden bg-[#0d1117] rounded-2xl border border-white/5 p-6 animate-in fade-in slide-in-from-bottom-4"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {/* Progress Background */}
                                    <div
                                        className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getScoreColor(exam.percentage)} opacity-5`}
                                        style={{ width: `${exam.percentage}%` }}
                                    />

                                    <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
                                        {/* Score Circle */}
                                        <div className="relative">
                                            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getScoreColor(exam.percentage)} flex items-center justify-center shadow-lg`}>
                                                <span className="text-2xl font-black text-white">{exam.percentage.toFixed(0)}%</span>
                                            </div>
                                            {exam.percentage >= 85 && (
                                                <div className="absolute -top-2 -right-2">
                                                    <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Exam Details */}
                                        <div className="flex-1 text-right">
                                            <h4 className="text-xl font-black text-white mb-2">{exam.examTitle}</h4>
                                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                                <span className="flex items-center gap-1.5 text-gray-400 font-bold">
                                                    <Target size={14} />
                                                    {exam.totalScore} / {exam.maxScore}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-gray-400 font-bold">
                                                    <CheckCircle2 size={14} />
                                                    {exam.correctAnswers} / {exam.totalQuestions} صحيحة
                                                </span>
                                                <span className="flex items-center gap-1.5 text-gray-400 font-bold">
                                                    <Calendar size={14} />
                                                    {formatDate(exam.submittedAt)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className={`px-4 py-2 rounded-xl font-bold text-sm ${exam.isFinished
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                            }`}>
                                            {exam.isFinished ? 'مكتمل' : 'قيد التصحيح'}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Summary Stats */}
                            {examScores.length > 0 && (
                                <div className="mt-6 p-6 bg-gradient-to-l from-brand-red/10 to-rose-500/10 rounded-2xl border border-brand-red/20">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-red to-rose-600 flex items-center justify-center text-white">
                                            <TrendingUp size={28} />
                                        </div>
                                        <div className="text-right flex-1">
                                            <h4 className="text-lg font-black text-white mb-1">متوسط الأداء</h4>
                                            <p className="text-gray-400 font-bold text-sm">في جميع الامتحانات</p>
                                        </div>
                                        <div className="text-left">
                                            <p className={`text-4xl font-black ${getScoreTextColor(examScores.reduce((acc, e) => acc + e.percentage, 0) / examScores.length)}`}>
                                                {(examScores.reduce((acc, e) => acc + e.percentage, 0) / examScores.length).toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Modal>

            {/* Logout Confirmation Modal */}
            <Modal
                isOpen={isLogoutModalOpen}
                onClose={() => !isLoggingOut && setIsLogoutModalOpen(false)}
                title="تسجيل الخروج"
                className="max-w-md"
            >
                <div className="text-center space-y-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-full flex items-center justify-center mx-auto text-red-500 animate-in zoom-in duration-300">
                        <LogOut size={48} className="mr-1" />
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-2xl font-black text-white">هل تود المغادرة؟</h3>
                        <p className="text-gray-400 font-bold">
                            سيتم إنهاء جلستك الحالية. يمكنك العودة في أي وقت لمتابعة تقدم أبنائك!
                        </p>
                    </div>
                    <div className="flex gap-4 pt-2">
                        <Button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white h-14 rounded-2xl text-lg font-bold shadow-lg shadow-red-500/20"
                        >
                            {isLoggingOut ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                "نعم، تسجيل الخروج"
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setIsLogoutModalOpen(false)}
                            disabled={isLoggingOut}
                            className="flex-1 border-white/10 hover:bg-white/5 h-14 rounded-2xl text-lg font-bold"
                        >
                            البقاء
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
