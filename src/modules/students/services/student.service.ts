import { apiClient } from "@/services/api-client";
import { env } from "@/config/env";
import { Subject, PaginatedResponse, SubjectTeachersResponse, ApiResponse, Exam, SubmitExamRequest, ExamScoreResponse, SubscribeToCourseRequest, UpdateStudentProfileRequest, ExamAccessResponse } from "../types/student.types";

export const StudentService = {
    getSubjects: async (page: number = 1, size: number = 10): Promise<PaginatedResponse<Subject>> => {
        const response = await apiClient.get<PaginatedResponse<Subject>>(`/subjects/paginated?page=${page}&size=${size}`);
        return response.data;
    },
    getTeachersBySubject: async (subjectId: number): Promise<SubjectTeachersResponse> => {
        const response = await apiClient.get<ApiResponse<SubjectTeachersResponse[]>>(`/subjects/${subjectId}/teachers`);
        // The API returns an array, we take the first element (the subject matching our ID)
        const data = response.data.data[0];

        // Helper to normalize URLs
        const normalizeUrl = (url: any) => {
            if (!url || typeof url !== 'string') return url;
            if (url.startsWith('http') || url.startsWith('https') || url.startsWith('blob:')) return url;
            // Handle common cloud providers that might be passed as relative by mistake, though unlikely
            if (url.includes('drive.google.com') || url.includes('youtube.com') || url.includes('youtu.be')) return url;

            const baseUrl = env.API.SERVER_URL;
            return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
        };

        if (data && data.teachers) {
            data.teachers.forEach((teacher) => {
                teacher.photoUrl = normalizeUrl(teacher.photoUrl);
                if (teacher.courses) {
                    teacher.courses.forEach((course) => {
                        course.courseImageUrl = normalizeUrl(course.courseImageUrl);
                        if (course.lectures) {
                            course.lectures.forEach((lecture: any) => {
                                // lecture is typed as any because API may return additional fields
                                if (lecture.videoUrl) lecture.videoUrl = normalizeUrl(lecture.videoUrl);
                                if (lecture.materials) {
                                    lecture.materials.forEach((material: any) => {
                                        if (material.fileUrl) material.fileUrl = normalizeUrl(material.fileUrl);
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }

        return data;
    },
    getExamByLecture: async (lectureId: number): Promise<Exam | null> => {
        try {
            const response = await apiClient.get<ApiResponse<any>>(`/lectures/${lectureId}/exam`);
            let data = response.data.data;

            if (!data) return null;
            if (Array.isArray(data)) {
                if (data.length === 0) return null;
                data = data[0];
            }
            if (!data) return null;

            const normalizedExam: Exam = {
                id: data.id || data.Id || data.examId || data.ExamId,
                title: data.title || data.Title,
                lectureId: data.lectureId || data.LectureId,
                lectureName: data.lectureName || data.LectureName || "",
                isFinished: data.isFinished || data.IsFinished || data.IsFinsh || data.isFinsh || false,
                deadline: data.deadline || data.Deadline,
                durationInMinutes: data.durationInMinutes || data.DurationInMinutes,
                questions: (data.questions || data.Questions || []).map((q: any) => ({
                    id: q.id || q.Id,
                    questionType: q.questionType || q.QuestionType,
                    content: q.content || q.Content,
                    answerType: q.answerType || q.AnswerType,
                    score: q.score || q.Score,
                    correctByAssistant: q.correctByAssistant !== undefined ? q.correctByAssistant : q.CorrectByAssistant,
                    correctAnswerImageUrl: q.correctAnswerImageUrl || q.CorrectAnswerImageUrl || null,
                    examId: q.examId || q.ExamId,
                    options: (q.options || q.Options || []).map((o: any) => ({
                        id: o.id || o.Id,
                        content: o.content || o.Content,
                        isCorrect: o.isCorrect !== undefined ? o.isCorrect : o.IsCorrect,
                        questionId: o.questionId || o.QuestionId
                    }))
                }))
            };

            return normalizedExam;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },
    submitExam: async (data: SubmitExamRequest): Promise<ApiResponse<any>> => {
        // Transform to PascalCase for backend compatibility as seen in other endpoints
        const payload = {
            ExamId: data.examId,
            StudentId: data.studentId,
            Answers: data.answers.map((a) => ({
                QuestionId: a.questionId,
                SelectedOptionIds: a.selectedOptionIds || [],
                TextAnswer: a.textAnswer || "",
                ImageAnswerUrl: a.imageAnswerUrl || ""
            }))
        };

        console.log("Submitting Exam Payload (PascalCase):", JSON.stringify(payload, null, 2));

        const response = await apiClient.post<ApiResponse<any>>("/exams/submit", payload);
        return response.data;
    },
    uploadStudentAnswerImage: async (
        examId: number,
        studentId: number,
        questionId: number,
        studentExamResultId: number,
        file: File
    ): Promise<ApiResponse<string>> => {
        const formData = new FormData();
        formData.append("ExamId", examId.toString());
        formData.append("StudentId", studentId.toString());
        formData.append("QuestionId", questionId.toString());
        formData.append("StudentExamResultId", studentExamResultId.toString());
        formData.append("ImageFile", file);

        const response = await apiClient.post<ApiResponse<string>>(
            "/student-answers/image",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data;
    },
    getExamScore: async (examId: number, studentId: number): Promise<ExamScoreResponse> => {
        const response = await apiClient.get<ApiResponse<ExamScoreResponse>>(`/exams/${examId}/students/${studentId}/score`);
        return response.data.data;
    },
    subscribeToCourse: async (data: SubscribeToCourseRequest): Promise<ApiResponse<any>> => {
        // Using PascalCase to match backend conventions seen in other endpoints
        const payload = {
            StudentId: Number(data.studentId),
            CourseId: Number(data.courseId)
        };
        console.log("Subscribing to course:", payload);
        const response = await apiClient.post<ApiResponse<any>>("/course-subscriptions", payload);
        return response.data;
    },

    getSubscribedCourses: async (studentId: number, status: string = 'Approved'): Promise<ApiResponse<any[]>> => {
        const response = await apiClient.get<ApiResponse<any[]>>(`/course-subscriptions/student/${studentId}/status/${status}`);
        return response.data;
    },

    // Notifications Management
    getNotifications: async (userId: string): Promise<ApiResponse<any[]>> => {
        const response = await apiClient.get<ApiResponse<any[]>>(`/Notification/${userId}`);
        return response.data;
    },

    getUnreadNotifications: async (userId: string): Promise<ApiResponse<any[]>> => {
        const response = await apiClient.get<ApiResponse<any[]>>(`/Notification/${userId}/unread`);
        return response.data;
    },

    markNotificationAsRead: async (notificationId: number): Promise<ApiResponse<any>> => {
        const response = await apiClient.put<ApiResponse<any>>(`/Notification/${notificationId}/mark-as-read`);
        return response.data;
    },

    deleteNotification: async (notificationId: number, userId: string): Promise<ApiResponse<any>> => {
        const response = await apiClient.delete<ApiResponse<any>>(`/Notification/${notificationId}`, {
            params: { userId } // Sending userId as query param as per API spec
        });
        return response.data;
    },

    clearAllNotifications: async (userId: string): Promise<ApiResponse<any>> => {
        const response = await apiClient.delete<ApiResponse<any>>(`/Notification/user/${userId}/all`);
        return response.data;
    },

    // Student Profile Management
    getStudentProfile: async (userId: string): Promise<ApiResponse<any>> => {
        const response = await apiClient.get<ApiResponse<any>>(`/students/profile/${userId}`);
        return response.data;
    },

    updateStudentProfile: async (data: UpdateStudentProfileRequest): Promise<ApiResponse<any>> => {
        const formData = new FormData();

        formData.append('StudentId', data.studentId);
        formData.append('StudentPhoneNumber', data.studentPhoneNumber || "");
        formData.append('ParentPhoneNumber', data.parentPhoneNumber || "");
        formData.append('Governorate', data.governorate || "");
        formData.append('City', data.city || "");

        if (data.photoFile) {
            formData.append('StudentProfileImageFile', data.photoFile);
        }

        console.log("=== UPDATE PROFILE REQUEST (FormData) ===");
        console.log("StudentId:", data.studentId);

        const response = await apiClient.put<ApiResponse<any>>("/students/profile", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    },

    // Check if student can access exam (including deadline exceptions)
    checkExamAccess: async (examId: number, studentId: number): Promise<ExamAccessResponse> => {
        try {
            const response = await apiClient.get<ApiResponse<any>>(`/exams/${examId}/students/${studentId}/access`);
            const data = response.data.data;

            return {
                examId: data.examId || data.ExamId || examId,
                studentId: data.studentId || data.StudentId || studentId,
                canAccessExam: data.canAccessExam ?? data.CanAccessExam ?? false,
                deadline: data.deadline || data.Deadline || null,
                extendedDeadline: data.extendedDeadline || data.ExtendedDeadline || null,
                reason: data.reason || data.Reason || null,
                message: data.message || data.Message || ""
            };
        } catch (error: any) {
            // If endpoint fails, return false access by default
            console.error("Error checking exam access:", error);
            return {
                examId,
                studentId,
                canAccessExam: false,
                deadline: null,
                extendedDeadline: null,
                reason: null,
                message: "فشل في التحقق من صلاحية الدخول"
            };
        }
    },
};
