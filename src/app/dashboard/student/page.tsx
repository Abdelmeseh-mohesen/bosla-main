"use client";

import React, { useState } from "react";
import { SubjectsList } from "@/modules/students/components/SubjectsList";
import { TeachersList } from "@/modules/students/components/TeachersList";
import { TeacherEducationStagesView } from "@/modules/students/components/TeacherEducationStagesView";
import { TeacherCoursesView } from "@/modules/students/components/TeacherCoursesView";
import { CoursePlayer } from "@/modules/students/components/CoursePlayer";
import { ExamViewer } from "@/modules/students/components/ExamViewer";
import { ExamResultReview } from "@/modules/students/components/ExamResultReview";
import { StudentProfile } from "@/modules/students/components/StudentProfile";
import { NotificationsMenu } from "@/modules/students/components/NotificationsMenu";
import { StudentService } from "@/modules/students/services/student.service";

import { Exam, ExamAnswer, ExamScoreResponse } from "@/modules/students/types/student.types";
import { useStudentAuth } from "@/modules/students/hooks/use-student-auth";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";
import { LogOut, Loader2, Sparkles, User } from "lucide-react";

export default function StudentDashboardPage() {
    const { user, logout, studentId, userId } = useStudentAuth();
    const [view, setView] = useState<'subjects' | 'teachers' | 'teacher-stages' | 'teacher-courses' | 'course-player' | 'student-profile'>('subjects');
    const [selectedSubject, setSelectedSubject] = useState<{ id: number, name: string } | null>(null);
    const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
    const [selectedStage, setSelectedStage] = useState<{ id: number, name: string } | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
    const [selectedScore, setSelectedScore] = useState<ExamScoreResponse | null>(null);
    const [currentLectureId, setCurrentLectureId] = useState<number | null>(null); // لحفظ lectureId للمرجعية
    const [isFetchingExam, setIsFetchingExam] = useState(false);
    const [isSubmittingExam, setIsSubmittingExam] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);


    const handleLogout = async () => {
        setIsLoggingOut(true);
        await logout();
    };

    // State for numeric student ID required for exam submission
    const [numericStudentId, setNumericStudentId] = useState<number | null>(null);

    // Effect to resolve the numeric student ID
    React.useEffect(() => {
        const resolveStudentId = async () => {
            // 1. Try to get it from the user object directly (if stored in local storage)
            if (user?.studentId && typeof user.studentId === 'number') {
                console.log("Resolved Numeric Student ID from User Object:", user.studentId);
                setNumericStudentId(user.studentId);
                return;
            }

            // 2. If not found, fetch the profile using the GUID (userId)
            if (userId) { // Using GUID
                try {
                    console.log("Fetching profile to resolve Numeric Student ID for GUID:", userId);
                    const profileResponse = await StudentService.getStudentProfile(userId);
                    const profileData = profileResponse.data;

                    if (profileData && profileData.studentId) {
                        console.log("Resolved Numeric Student ID from API:", profileData.studentId);
                        setNumericStudentId(profileData.studentId);
                    } else {
                        console.error("Could not find studentId in profile data:", profileData);
                    }
                } catch (error) {
                    console.error("Failed to fetch student profile for ID resolution:", error);
                }
            } else if (studentId && typeof studentId === 'number') {
                // If the hook already resolved the numeric ID
                setNumericStudentId(studentId);
            }
        };

        if (user || userId || studentId) {
            resolveStudentId();
        }
    }, [user, userId, studentId]);



    const handleStartExam = async (examId: number, existingExamData?: any) => {
        setIsFetchingExam(true);
        console.log("Starting exam check for exam ID:", examId);
        try {
            // استخدام البيانات الموجودة إذا توفرت، وإلا جلبها من الـ API
            const exam = existingExamData || await StudentService.getExamById(examId);

            if (exam) {
                console.log("Exam Data Received:", {
                    id: exam.id,
                    isFinished: (exam as any).isFinished
                });

                if (!studentId) {
                    alert("خطأ في بيانات الطالب، يرجى إعادة تسجيل الدخول.");
                    return;
                }

                // 1. Check exam access (Source of Truth)
                // This determines if the student *can* take/retake the exam right now
                console.log("Checking exam access for student:", studentId);
                const accessCheck = await StudentService.checkExamAccess(examId, Number(studentId));
                console.log("Exam Access Check Result:", accessCheck);

                // 2. Check previous submission status (for UI decision)
                let existingScore = null;
                let isScoreFinished = false;
                try {
                    existingScore = await StudentService.getExamScore(examId, Number(studentId));
                    const rawScoreFinished = existingScore ? ((existingScore as any).isFinished || (existingScore as any).IsFinished || (existingScore as any).IsFinsh || (existingScore as any).isFinsh) : false;
                    isScoreFinished = rawScoreFinished === true || rawScoreFinished === "true" || rawScoreFinished === 1;
                } catch (e) {
                    console.log("No existing score found or error fetching score.");
                }

                // --- LOGIC FLOW ---

                // Case A: Student IS ALLOWED to access (New attempt or Retake Exception)
                if (accessCheck.canAccessExam) {
                    if (isScoreFinished) {
                        // User has finished before.
                        // Only allow retake if there is a specific exception (extendedDeadline is present)
                        if (accessCheck.extendedDeadline) {
                            // Exception Case: Allow retake
                            if (confirm(`لقد أتممت هذا الامتحان مسبقاً. هل تود إعادته الآن؟\n(ملاحظة: لديك استثناء يسمح لك بالإعادة)`)) {
                                console.log("User chose to retake exam (Exception flow)");
                                setSelectedExam(exam);
                                setSelectedScore(null);
                            } else {
                                console.log("User chose to view results instead of retaking");
                                setSelectedScore(existingScore);
                                setCurrentLectureId((exam as any).lectureId || null);
                                setSelectedExam(null);
                            }
                        } else {
                            // Standard Case: Exam is open but student finished and has NO exception -> View Results
                            console.log("Exam is still open but student finished and has no exception. Showing results.");
                            setSelectedScore(existingScore);
                            setCurrentLectureId((exam as any).lectureId || null);
                            setSelectedExam(null);
                        }
                    } else {
                        // Normal case: First attempt or continuing unfinished attempt
                        console.log("Entering exam (Normal flow)");
                        setSelectedExam(exam);
                        setSelectedScore(null);
                    }
                    return;
                }

                // Case B: Student DENIED access
                // If they have finished before, show results. If not, show error.
                if (isScoreFinished) {
                    console.log("Access denied but exam finished -> Showing results.");
                    setSelectedScore(existingScore);
                    setCurrentLectureId((exam as any).lectureId || null);
                    setSelectedExam(null);
                    return;
                }

                // Case C: Denied and No Results -> Show Access Error
                console.log("Access denied and no previous results.");
                let message = accessCheck.message || "لا يمكنك الدخول لهذا الامتحان حالياً";

                if (accessCheck.deadline) {
                    const deadlineDate = new Date(accessCheck.deadline);
                    const now = new Date();
                    if (now > deadlineDate) {
                        message = `عذراً، انتهى وقت الامتحان في ${deadlineDate.toLocaleDateString('ar-EG', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}`;
                    }
                }
                alert(message);

            } else {
                alert("لا يوجد امتحان متاح أو حدث خطأ في التحميل");
            }
        } catch (error) {
            console.error("Error fetching exam", error);
            alert("حدث خطأ أثناء تحميل الامتحان، تأكد من جودة الاتصال بالإنترنت.");
        } finally {
            setIsFetchingExam(false);
        }
    };

    const handleExamSubmit = async (answers: ExamAnswer[]) => {
        if (!selectedExam || !numericStudentId) {
            console.error("Missing exam or numericStudentId", { selectedExam, numericStudentId });
            alert("خطأ: لم يتم التعرف على هوية الطالب الرقمية. يرجى تحديث الصفحة والمحاولة مرة أخرى.");
            return;
        }

        console.log("=== STARTING EXAM SUBMISSION ===");
        console.log("Exam ID:", selectedExam.id);
        console.log("Numeric Student ID:", numericStudentId);
        console.log("Answers count:", answers.length);
        console.log("Answers:", JSON.stringify(answers, null, 2));

        setIsSubmittingExam(true);
        try {
            // 1. Submit main exam data (JSON)
            console.log("Step 1: Submitting exam answers...");
            const response = await StudentService.submitExam({
                examId: selectedExam.id,
                studentId: numericStudentId,
                answers
            });
            console.log("Step 1 Complete - Response:", response);

            // 2. Fetch score to get studentExamResultId
            console.log("Step 2: Fetching exam score...");
            const score = await StudentService.getExamScore(selectedExam.id, numericStudentId);
            console.log("Step 2 Complete - Score:", score);
            const studentExamResultId = score.studentExamResultId;

            // 3. Upload any image answers if present
            const answersWithFiles = answers.filter(a => a.file);
            console.log("Step 3: Image answers to upload:", answersWithFiles.length);

            if (answersWithFiles.length > 0 && studentExamResultId) {
                console.log("Uploading image answers...");
                await Promise.all(
                    answersWithFiles.map(ans =>
                        StudentService.uploadStudentAnswerImage(
                            selectedExam.id,
                            numericStudentId,
                            ans.questionId,
                            studentExamResultId,
                            ans.file!
                        )
                    )
                );
                console.log("Image uploads complete");

                // Re-fetch score to get updated status if needed
                const updatedScore = await StudentService.getExamScore(selectedExam.id, numericStudentId);
                setSelectedScore(updatedScore);
            } else {
                setSelectedScore(score);
                setCurrentLectureId(selectedExam.lectureId); // حفظ lectureId
            }

            console.log("=== EXAM SUBMISSION COMPLETE ===");
            setSelectedExam(null);
        } catch (error: any) {
            console.error("=== EXAM SUBMISSION ERROR ===");
            console.error("Error object:", error);
            console.error("Error response:", error?.response);
            console.error("Error response data:", error?.response?.data);
            console.error("Error message:", error?.message);

            let errorMessage = "خطأ غير معروف";

            if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.response?.data?.errors) {
                const errors = error.response.data.errors;
                if (Array.isArray(errors)) {
                    errorMessage = errors.join("\n");
                } else if (typeof errors === 'object') {
                    // Handle ValidationProblemDetails format: { "Field": ["Error"] }
                    errorMessage = Object.entries(errors)
                        .map(([key, msgs]) => `${key}: ${(msgs as any[]).join(", ")}`)
                        .join("\n");
                } else {
                    errorMessage = String(errors);
                }
            } else if (error?.message) {
                errorMessage = error.message;
            }

            alert(`حدث خطأ أثناء تسليم الامتحان:\n${errorMessage}`);
        } finally {
            setIsSubmittingExam(false);
        }
    };


    const handleSelectSubject = (id: number, name: string) => {
        setSelectedSubject({ id, name });
        setView('teachers');
    };

    const handleSelectTeacher = (teacher: any) => {
        setSelectedTeacher(teacher);
        setView('teacher-stages');
    };

    const handleSelectStage = (stageId: number, stageName: string) => {
        setSelectedStage({ id: stageId, name: stageName });
        setView('teacher-courses');
    };

    const handleSelectCourse = (course: any) => {
        setSelectedCourse(course);
        setView('course-player');
    };

    return (
        <div className="min-h-screen bg-[#06080a] relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-brand-red/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="relative z-10 container mx-auto px-4 md:px-8 py-6 md:py-10">
                {/* Header - Premium Design */}
                {view !== 'teacher-courses' && view !== 'course-player' && (
                    <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700 relative z-50">
                        <div className="bg-gradient-to-l from-[#0d1117] to-[#0d1117]/80 rounded-[2rem] border border-white/5 p-6 md:p-8 backdrop-blur-xl">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                {/* User Info */}
                                <div className="flex items-center gap-5 order-2 md:order-1">
                                    <div className="relative">
                                        {/* Avatar with photo or fallback */}
                                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-brand-red to-red-700 flex items-center justify-center text-white shadow-xl shadow-brand-red/20 overflow-hidden">
                                            {user?.photoUrl ? (
                                                <img
                                                    src={user.photoUrl}
                                                    alt={user.firstName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User size={32} />
                                            )}
                                        </div>
                                        {/* Online indicator */}
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#0d1117]" />
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="bg-brand-red/10 text-brand-red text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Sparkles size={10} />
                                                طالب مميز
                                            </span>
                                        </div>
                                        <h1 className="text-2xl md:text-3xl font-black text-white">
                                            مرحباً، <span className="text-brand-red">{user?.firstName || 'طالب'}</span>
                                        </h1>
                                        <p className="text-gray-500 font-bold text-sm mt-1">{user?.email || 'جاهز لاكتشاف دروس جديدة اليوم؟'}</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 order-1 md:order-2 w-full md:w-auto justify-end">
                                    <NotificationsMenu />
                                    <Button
                                        variant="outline"
                                        onClick={() => setView('student-profile')}
                                        className="h-12 px-5 rounded-xl border-white/10 hover:bg-brand-red/10 hover:border-brand-red/20 hover:text-brand-red font-bold text-gray-400 transition-all duration-300 flex items-center gap-2 group"
                                    >
                                        <User size={18} className="group-hover:scale-110 transition-transform" />
                                        <span className="hidden sm:inline">الملف الشخصي</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsLogoutModalOpen(true)}
                                        className="h-12 px-5 rounded-xl border-white/10 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500 font-bold text-gray-400 transition-all duration-300 flex items-center gap-2 group"
                                    >
                                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                                        <span className="hidden sm:inline">تسجيل الخروج</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Dynamic Content */}
                <div className="relative">
                    {view === 'subjects' && (
                        <SubjectsList onSelectSubject={handleSelectSubject} />
                    )}

                    {view === 'teachers' && selectedSubject && (
                        <TeachersList
                            subjectId={selectedSubject.id}
                            subjectName={selectedSubject.name}
                            onBack={() => setView('subjects')}
                            onSelectTeacher={handleSelectTeacher}
                        />
                    )}

                    {view === 'teacher-stages' && selectedTeacher && (
                        <TeacherEducationStagesView
                            teacher={selectedTeacher}
                            onBack={() => setView('teachers')}
                            onSelectStage={handleSelectStage}
                        />
                    )}

                    {view === 'teacher-courses' && selectedTeacher && selectedStage && (
                        <TeacherCoursesView
                            teacher={selectedTeacher}
                            stageId={selectedStage.id}
                            stageName={selectedStage.name}
                            onBack={() => setView('teacher-stages')}
                            onSelectCourse={handleSelectCourse}
                        />
                    )}

                    {view === 'course-player' && selectedCourse && (
                        <CoursePlayer
                            course={selectedCourse}
                            onBack={() => setView('teacher-courses')}
                            onStartExam={handleStartExam}
                            studentName={user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Student'}
                            studentId={numericStudentId || undefined}
                        />
                    )}

                    {view === 'student-profile' && userId && (
                        <StudentProfile
                            userId={userId} // Passing GUID
                            onBack={() => setView('subjects')}
                        />
                    )}

                    {/* Full Screen Overlays */}
                    {selectedExam && (
                        <ExamViewer
                            exam={selectedExam}
                            onClose={() => setSelectedExam(null)}
                            onSubmit={handleExamSubmit}
                        />
                    )}

                    {/* Detailed Result Review */}
                    {selectedScore && (
                        <ExamResultReview
                            result={selectedScore}
                            lectureId={currentLectureId || undefined}
                            onClose={() => {
                                setSelectedScore(null);
                                setCurrentLectureId(null);
                            }}
                        />
                    )}

                    {/* Loading Overlays */}
                    {(isFetchingExam || isSubmittingExam) && (
                        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center">
                            <div className="text-center space-y-4">
                                <Loader2 className="h-16 w-16 text-brand-red animate-spin mx-auto" />
                                <p className="text-xl font-black text-white">
                                    {isFetchingExam ? 'جاري تحضير أسئلة الامتحان...' : 'جاري تسليم إجاباتك، ثوانٍ قليلة...'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            <Modal
                isOpen={isLogoutModalOpen}
                onClose={() => !isLoggingOut && setIsLogoutModalOpen(false)}
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
                            سيتم إنهاء جلستك الحالية على جميع الأجهزة. يمكنك العودة في أي وقت!
                        </p>
                    </div>
                    <div className="flex gap-4 pt-2">
                        <Button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white h-12 rounded-xl text-lg font-bold shadow-lg shadow-red-500/20"
                        >
                            {isLoggingOut ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                "نعم، تسجيل الخروج"
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setIsLogoutModalOpen(false)}
                            disabled={isLoggingOut}
                            className="flex-1 border-white/10 hover:bg-white/5 h-12 rounded-xl text-lg font-bold"
                        >
                            البقاء
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
