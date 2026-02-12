"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TeacherService } from "@/modules/teacher/services/teacher.service";
import { AuthService } from "@/modules/auth/services/auth.service";
import { useTeacherAuth } from "@/modules/teacher/hooks/use-teacher-auth";
import { CourseCard } from "@/modules/teacher/components/CourseCard";
import { CourseForm } from "@/modules/teacher/components/CourseForm";
import { CourseScoresModal } from "@/modules/teacher/components/CourseScoresModal";
import { TeacherRevenueModal } from "@/modules/teacher/components/TeacherRevenueModal";
import { Modal } from "@/shared/ui/modal";
import { Button } from "@/shared/ui/button";
import { Plus, BookOpen, LayoutDashboard, LogOut, AlertTriangle, Users, Bell, Wallet, ShieldCheck } from "lucide-react";
import { Course, CourseStudentScore, TeacherRevenue } from "@/modules/teacher/types/teacher.types";
import { apiClient } from "@/services/api-client";
import { AssistantForm } from "@/modules/teacher/components/AssistantForm";
import { AssistantList } from "@/modules/teacher/components/AssistantList";
import { Toast } from "@/shared/ui/toast";
import Link from "next/link";

export default function TeacherDashboardPage() {
    const { teacherId, user, logout, isAssistant } = useTeacherAuth();
    const queryClient = useQueryClient();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [courseToDelete, setCourseToDelete] = useState<number | null>(null);
    const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
    const [isAssistantListModalOpen, setIsAssistantListModalOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Course Scores state
    const [isScoresModalOpen, setIsScoresModalOpen] = useState(false);
    const [selectedCourseForScores, setSelectedCourseForScores] = useState<Course | null>(null);
    const [courseScores, setCourseScores] = useState<CourseStudentScore[]>([]);
    const [isLoadingScores, setIsLoadingScores] = useState(false);
    const [scoresError, setScoresError] = useState<string | null>(null);

    // Revenue state
    const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
    const [revenueData, setRevenueData] = useState<TeacherRevenue | null>(null);
    const [isLoadingRevenue, setIsLoadingRevenue] = useState(false);
    const [revenueError, setRevenueError] = useState<string | null>(null);

    // Admin Session State
    const [isAdminSession, setIsAdminSession] = useState(false);

    React.useEffect(() => {
        const adminSession = localStorage.getItem('adminSession');
        if (adminSession) {
            setIsAdminSession(true);
        }
    }, []);

    const handleReturnToAdmin = () => {
        const adminSessionStr = localStorage.getItem('adminSession');
        if (adminSessionStr) {
            const adminSession = JSON.parse(adminSessionStr);
            localStorage.setItem('user', adminSession.user);
            localStorage.setItem('role', adminSession.role);
            localStorage.removeItem('adminSession');
            // Force reload to ensure state is clean and context is updated
            window.location.href = '/dashboard/admin';
        }
    };

    const { data: coursesResponse, isLoading: isLoadingCourses } = useQuery({
        queryKey: ["teacherCourses", teacherId],
        queryFn: () => TeacherService.getCourses(teacherId!),
        enabled: !!teacherId,
    });

    const { data: lecturesResponse, isLoading: isLoadingLectures } = useQuery({
        queryKey: ["allLectures"],
        queryFn: () => apiClient.get<any>("/lectures").then((res: any) => res.data),
        enabled: !!teacherId,
    });

    const { data: assistantsResponse, isLoading: isLoadingAssistants } = useQuery({
        queryKey: ["teacherAssistants", teacherId],
        queryFn: () => TeacherService.getAssistants(teacherId!),
        enabled: !!teacherId,
    });

    const { data: subscriptionsResponse, isLoading: isLoadingSubscriptions } = useQuery({
        queryKey: ["teacherSubscriptions", teacherId],
        queryFn: () => TeacherService.getSubscriptions(teacherId!),
        enabled: !!teacherId,
    });

    const { data: stagesResponse } = useQuery({
        queryKey: ["educationStages"],
        queryFn: () => AuthService.getEducationStages(),
    });

    const isLoading = isLoadingCourses || isLoadingLectures || isLoadingAssistants;

    // Process courses to include real lecture counts
    const courses = (coursesResponse?.data || []).map(course => {
        const allLectures = Array.isArray(lecturesResponse?.data)
            ? lecturesResponse.data
            : Array.isArray(lecturesResponse) ? lecturesResponse : [];

        const count = allLectures.filter((l: any) => l.courseId === course.id).length;

        // Resolve stage name from fetched stages if available, otherwise fallback
        const stage = (stagesResponse?.data || []).find(s => s.id === course.educationStageId);
        // Fix: Prioritize the name coming from the Course API if it exists, as it's the source of truth
        const stageName = course.educationStageName || (stage ? stage.name : `الصف ${course.gradeYear}`);

        return { ...course, lectureCount: count, educationStageName: stageName };
    });

    const createMutation = useMutation({
        mutationFn: TeacherService.createCourse,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["teacherCourses"] });
            setIsAddModalOpen(false);
            setToast({ message: "تم إضافة الكورس بنجاح", type: 'success' });
        }
    });

    const assistants = assistantsResponse?.data || [];
    const subscriptions = subscriptionsResponse?.data || [];
    const pendingSubscriptionsCount = subscriptions.filter(s => s.status === "Pending").length;

    const editMutation = useMutation({
        mutationFn: TeacherService.editCourse,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["teacherCourses"] });
            setIsEditModalOpen(false);
            setToast({ message: "تم تعديل الكورس بنجاح", type: 'success' });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: TeacherService.deleteCourse,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["teacherCourses"] });
            setToast({ message: "تم حذف الكورس بنجاح", type: 'success' });
        }
    });

    const registerAssistantMutation = useMutation({
        mutationFn: TeacherService.registerAssistant,
        onSuccess: (response) => {
            if (response.succeeded) {
                setToast({ message: "تم تسجيل المساعد بنجاح", type: 'success' });
                setIsAssistantModalOpen(false);
                queryClient.invalidateQueries({ queryKey: ["teacherAssistants"] });
            } else {
                setToast({ message: response.message || "حدث خطأ ما", type: 'error' });
            }
        },
        onError: (error: any) => {
            setToast({
                message: error.response?.data?.message || "فشل تسجيل المساعد",
                type: 'error'
            });
        }
    });

    const handleAddCourse = (values: any) => {
        if (!teacherId) return;
        createMutation.mutate({ ...values, teacherId });
    };

    const handleEditCourse = (values: any) => {
        if (!teacherId || !selectedCourse) return;
        editMutation.mutate({ ...values, id: selectedCourse.id, teacherId });
    };

    const handleDeleteCourse = (id: number) => {
        setCourseToDelete(id);
    };

    const confirmDelete = () => {
        if (courseToDelete) {
            deleteMutation.mutate(courseToDelete);
            setCourseToDelete(null);
        }
    };

    const handleRegisterAssistant = (values: any) => {
        if (!teacherId) return;
        registerAssistantMutation.mutate({ ...values, teacherId });
    };

    // Handle viewing course scores
    const handleViewScores = async (course: Course) => {
        if (!teacherId) return;

        setSelectedCourseForScores(course);
        setIsScoresModalOpen(true);
        setIsLoadingScores(true);
        setScoresError(null);
        setCourseScores([]);

        try {
            const response = await TeacherService.getCourseStudentScores(course.id, teacherId);
            if (response.succeeded) {
                setCourseScores(response.data || []);
            } else {
                setScoresError(response.message || "حدث خطأ أثناء تحميل الدرجات");
            }
        } catch (error: any) {
            setScoresError(error.response?.data?.message || "فشل تحميل درجات الطلاب");
        } finally {
            setIsLoadingScores(false);
        }
    };

    // Handle viewing teacher revenue
    const handleViewRevenue = async () => {
        if (!teacherId) return;

        setIsRevenueModalOpen(true);
        setIsLoadingRevenue(true);
        setRevenueError(null);
        setRevenueData(null);

        try {
            const response = await TeacherService.getTeacherRevenue(teacherId);
            if (response.succeeded) {
                setRevenueData(response.data);
            } else {
                setRevenueError(response.message || "حدث خطأ أثناء تحميل الإحصائيات");
            }
        } catch (error: any) {
            setRevenueError(error.response?.data?.message || "فشل تحميل إحصائيات الإيرادات");
        } finally {
            setIsLoadingRevenue(false);
        }
    };

    if (!teacherId) {
        return <div className="min-h-screen flex items-center justify-center text-white">جاري التحميل...</div>;
    }


    return (
        <div className="min-h-screen bg-[#06080a] text-white p-4 md:p-10 font-arabic relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-brand-red/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 mb-16">
                    <div className="flex items-center gap-6 group">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-red/20 to-transparent border border-white/10 flex items-center justify-center text-brand-red shadow-2xl shadow-brand-red/10 group-hover:scale-105 transition-transform duration-500">
                                <span className="text-3xl font-black">
                                    {user?.firstName?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-[#06080a] rounded-full" />
                        </div>

                        <div className="text-right space-y-1">
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight flex items-center gap-3">
                                <span>مرحباً،</span>
                                <span className="bg-clip-text text-transparent bg-gradient-to-l from-white to-gray-400">
                                    {isAssistant ? "" : "أ/ "}{user?.firstName}
                                </span>
                                {isAssistant && (
                                    <span className="bg-brand-red/10 text-brand-red border border-brand-red/20 text-sm px-3 py-1 rounded-full font-bold">
                                        مساعد
                                    </span>
                                )}
                            </h1>
                            <p className="text-gray-400 font-medium text-lg max-w-lg">
                                {isAssistant
                                    ? "لوحة التحكم الخاصة بإدارة الامتحانات والمتابعة"
                                    : "إليك نظرة شاملة على أداء كورساتك وطلابك اليوم"}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 w-full xl:w-auto">
                        <Button
                            variant="outline"
                            onClick={() => setIsLogoutModalOpen(true)}
                            className="h-14 px-6 rounded-2xl border-white/5 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500 font-bold text-gray-400 transition-all duration-300 flex items-center gap-2 group/logout"
                        >
                            <LogOut size={20} className="group-hover/logout:-translate-x-1 transition-transform" />
                            <span>تسجيل الخروج</span>
                        </Button>

                        {!isAssistant && (
                            <>
                                {/* Revenue Button */}
                                <Button
                                    onClick={handleViewRevenue}
                                    variant="outline"
                                    className="h-14 px-6 rounded-2xl border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40 font-bold text-emerald-400 flex-1 xl:flex-none transition-all duration-300"
                                >
                                    <Wallet size={20} className="ml-2" />
                                    الإيرادات
                                </Button>

                                <Button
                                    onClick={() => setIsAssistantModalOpen(true)}
                                    variant="outline"
                                    className="h-14 px-6 rounded-2xl border-white/5 hover:bg-white/5 hover:border-white/20 font-bold text-gray-300 flex-1 xl:flex-none"
                                >
                                    <Users size={20} className="ml-2" />
                                    إضافة مساعد
                                </Button>

                                <Button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="h-14 px-8 rounded-2xl bg-gradient-to-r from-brand-red to-red-700 hover:from-red-600 hover:to-red-800 text-white font-black shadow-lg shadow-brand-red/25 hover:shadow-brand-red/40 hover:-translate-y-0.5 transition-all duration-300 flex-1 xl:flex-none"
                                >
                                    <Plus className="ml-2" size={22} />
                                    إضافة كورس
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Courses Stat */}
                    <div className="relative overflow-hidden group p-6 rounded-[2rem] bg-[#0d1117] border border-white/5 hover:border-brand-red/30 transition-all duration-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/10 rounded-full blur-[60px] group-hover:bg-brand-red/20 transition-all duration-500" />
                        <div className="relative flex justify-between items-start">
                            <div>
                                <p className="text-gray-400 font-bold mb-2 text-sm">إجمالي الكورسات</p>
                                <h3 className="text-4xl font-black text-white group-hover:text-brand-red transition-colors duration-300">
                                    {courses.length}
                                </h3>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/50 group-hover:text-brand-red group-hover:scale-110 transition-all duration-500">
                                <BookOpen size={28} />
                            </div>
                        </div>
                    </div>

                    {/* Pending Subscriptions Stat */}
                    <Link href="/dashboard/teacher/subscriptions" className="block">
                        <div className="relative overflow-hidden group p-6 rounded-[2rem] bg-[#0d1117] border border-white/5 hover:border-yellow-500/30 transition-all duration-500 cursor-pointer">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-[60px] group-hover:bg-yellow-500/20 transition-all duration-500" />
                            <div className="relative flex justify-between items-start">
                                <div>
                                    <p className="text-gray-400 font-bold mb-2 text-sm">طلبات الاشتراك</p>
                                    <h3 className="text-4xl font-black text-white group-hover:text-yellow-500 transition-colors duration-300">
                                        {subscriptions.length}
                                    </h3>
                                </div>
                                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/50 group-hover:text-yellow-500 group-hover:scale-110 transition-all duration-500 relative">
                                    <Bell size={28} />
                                    {pendingSubscriptionsCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-[10px] font-black text-black rounded-full flex items-center justify-center animate-pulse">
                                            {pendingSubscriptionsCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Assistants Stat */}
                    <div
                        className="relative overflow-hidden group p-6 rounded-[2rem] bg-[#0d1117] border border-white/5 hover:border-purple-500/30 transition-all duration-500 cursor-pointer"
                        onClick={() => !isAssistant && setIsAssistantListModalOpen(true)}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[60px] group-hover:bg-purple-500/20 transition-all duration-500" />
                        <div className="relative flex justify-between items-start">
                            <div>
                                <p className="text-gray-400 font-bold mb-2 text-sm">المساعدين</p>
                                <h3 className="text-4xl font-black text-white group-hover:text-purple-500 transition-colors duration-300">
                                    {assistants.length}
                                </h3>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/50 group-hover:text-purple-500 group-hover:scale-110 transition-all duration-500">
                                <Users size={28} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                        <span className="w-2 h-8 bg-brand-red rounded-full" />
                        كورساتي
                    </h2>
                    <div className="flex gap-2">
                        {/* Filter buttons could go here */}
                    </div>
                </div>

                {/* Courses Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-[220px] bg-white/5 rounded-2xl" />
                        ))}
                    </div>
                ) : courses.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {courses.map(course => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                onEdit={isAssistant ? undefined : (c) => {
                                    setSelectedCourse(c);
                                    setIsEditModalOpen(true);
                                }}
                                onDelete={isAssistant ? undefined : handleDeleteCourse}
                                onViewScores={handleViewScores}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 glass-card rounded-[3rem] border-dashed border-2 border-white/10">
                        <div className="bg-white/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-500">
                            <Plus size={48} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-400">لا يوجد كورسات حالياً</h2>
                        <p className="text-gray-500 font-bold mt-2">ابدأ بإضافة أول كورس لتبدأ رحلتك</p>
                    </div>
                )}

                {/* Add Course Modal */}
                <Modal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    title="إضافة كورس جديد"
                >
                    <CourseForm
                        onSubmit={handleAddCourse}
                        isLoading={createMutation.isPending}
                    />
                </Modal>

                {/* Edit Course Modal */}
                <Modal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    title="تعديل الكورس"
                >
                    {selectedCourse && (
                        <CourseForm
                            initialData={selectedCourse}
                            onSubmit={handleEditCourse}
                            isLoading={editMutation.isPending}
                        />
                    )}
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={!!courseToDelete}
                    onClose={() => setCourseToDelete(null)}
                    title="تأكيد الحذف"
                    className="max-w-md"
                >
                    <div className="text-center space-y-6">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-brand-red">
                            <AlertTriangle size={40} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-white">هل أنت متأكد؟</h3>
                            <p className="text-gray-400 font-bold">
                                لا يمكن التراجع عن هذا الإجراء. سيتم حذف الكورس وجميع المحاضرات والمواد المرتبطة به.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Button
                                variant="primary"
                                onClick={confirmDelete}
                                isLoading={deleteMutation.isPending}
                                className="flex-1 bg-brand-red hover:bg-red-700 h-12 rounded-xl text-lg"
                            >
                                نعم، احذف
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setCourseToDelete(null)}
                                className="flex-1 border-white/10 hover:bg-white/5 h-12 rounded-xl text-lg"
                            >
                                إلغاء
                            </Button>
                        </div>
                    </div>
                </Modal>

                {/* Add Assistant Modal */}
                <Modal
                    isOpen={isAssistantModalOpen}
                    onClose={() => setIsAssistantModalOpen(false)}
                    title="إضافة مساعد مدرس جديد"
                >
                    <AssistantForm
                        onSubmit={handleRegisterAssistant}
                        isLoading={registerAssistantMutation.isPending}
                    />
                </Modal>

                {/* View Assistants Modal */}
                <Modal
                    isOpen={isAssistantListModalOpen}
                    onClose={() => setIsAssistantListModalOpen(false)}
                    title="قائمة المساعدين"
                    className="max-w-2xl"
                >
                    <AssistantList assistants={assistants} />
                </Modal>

                {/* Logout Confirmation Modal */}
                <Modal
                    isOpen={isLogoutModalOpen}
                    onClose={() => setIsLogoutModalOpen(false)}
                    title="تسجيل الخروج"
                    className="max-w-md"
                >
                    <div className="text-center space-y-6">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500 animate-in zoom-in duration-300">
                            <LogOut size={40} className="mr-1" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-white">هل تود المغادرة؟</h3>
                            <p className="text-gray-400 font-bold">
                                سيتم إنهاء جلستك الحالية. تأكد من حفظ جميع التغييرات قبل المتابعة.
                            </p>
                        </div>
                        <div className="flex gap-4 pt-2">
                            <Button
                                onClick={logout}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white h-12 rounded-xl text-lg font-bold shadow-lg shadow-red-500/20"
                            >
                                نعم، تسجيل الخروج
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsLogoutModalOpen(false)}
                                className="flex-1 border-white/10 hover:bg-white/5 h-12 rounded-xl text-lg font-bold"
                            >
                                البقاء
                            </Button>
                        </div>
                    </div>
                </Modal>

                {/* Course Scores Modal */}
                <CourseScoresModal
                    isOpen={isScoresModalOpen}
                    onClose={() => {
                        setIsScoresModalOpen(false);
                        setSelectedCourseForScores(null);
                        setCourseScores([]);
                        setScoresError(null);
                    }}
                    courseTitle={selectedCourseForScores?.title || ""}
                    scores={courseScores}
                    isLoading={isLoadingScores}
                    error={scoresError}
                />

                {/* Teacher Revenue Modal */}
                <TeacherRevenueModal
                    isOpen={isRevenueModalOpen}
                    onClose={() => {
                        setIsRevenueModalOpen(false);
                        setRevenueData(null);
                        setRevenueError(null);
                    }}
                    revenue={revenueData}
                    isLoading={isLoadingRevenue}
                    error={revenueError}
                />

                {/* Toast Notification */}
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}

                {/* Return to Admin Floating Button */}
                {isAdminSession && (
                    <div className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-bottom-4 duration-500">
                        <Button
                            onClick={handleReturnToAdmin}
                            className="h-14 px-6 rounded-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-black shadow-2xl shadow-red-600/40 hover:scale-105 hover:shadow-red-600/60 transition-all duration-300 flex items-center gap-3 border-2 border-white/20"
                        >
                            <ShieldCheck size={24} />
                            <span>العودة للوحة الإدارة</span>
                        </Button>
                    </div>
                )}
            </div>
        </div >
    );
}
