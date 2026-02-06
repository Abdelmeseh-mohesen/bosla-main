import { apiClient } from "@/services/api-client";
import {
    Course,
    CreateCourseRequest,
    EditCourseRequest,
    Lecture,
    CreateLectureRequest,
    Material,
    CreateMaterialRequest,
    Exam,
    CreateExamRequest,
    EditExamRequest,
    CreateQuestionRequest,
    EditQuestionRequest,
    CreateOptionRequest,
    EditOptionRequest,
    ExamQuestion,
    ExamOption,
    ExamSubmission,
    GradeExamRequest,
    ExamScoreResponse,
    RegisterAssistantRequest,
    Assistant,
    CourseSubscription,
    UpdateSubscriptionStatusRequest,
    UpdateLectureVisibilityRequest,
    CourseStudentScore,
    TeacherRevenue,
    RevenueCourse,

    RevenueStudent,
    ChangeExamVisibilityRequest
} from "../types/teacher.types";
import axios from "axios";
import { env } from "@/config/env";
import { ApiResponse } from "@/modules/auth/types/auth.types";
import { SubscriptionStatus } from "../types/teacher.types";

// Helper function to normalize status to proper case
function normalizeStatus(status: string | undefined): SubscriptionStatus {
    if (!status) return "Pending";
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === "approved") return "Approved";
    if (lowerStatus === "rejected") return "Rejected";
    if (lowerStatus === "pending") return "Pending";
    return "Pending"; // Default
}

export const TeacherService = {
    // Courses
    getCourses: async (teacherId: number): Promise<ApiResponse<Course[]>> => {
        const response = await apiClient.get<any>(`/courses/teacher/${teacherId}`);

        let courses: any[] = [];
        if (response.data?.data && Array.isArray(response.data.data)) {
            courses = response.data.data;
        } else if (Array.isArray(response.data)) {
            courses = response.data;
        }

        const normalized = courses.map(c => ({
            ...c,
            id: c.id || c.Id,
            title: c.title || c.Title,
            gradeYear: c.gradeYear || c.GradeYear || c.EducationStageId,
            teacherId: c.teacherId || c.TeacherId,
            courseImageUrl: (() => {
                let img = c.courseImageUrl || c.CourseImageUrl;
                if (!img) return null;

                // If relative path, add server URL
                if (typeof img === 'string' && !img.startsWith('http')) {
                    return `${env.API.SERVER_URL}${img.startsWith('/') ? '' : '/'}${img}`;
                }
                return img;
            })(),
            educationStageId: c.educationStageId || c.EducationStageId,
            educationStageName: c.educationStageName || c.EducationStageName,
            price: c.price || c.Price || 0,
            discountedPrice: c.discountedPrice || c.DiscountedPrice || 0
        }));

        return {
            statusCode: 200,
            succeeded: true,
            message: "Success",
            errors: null,
            data: normalized,
            meta: ""
        };
    },

    createCourse: async (data: CreateCourseRequest): Promise<ApiResponse<Course>> => {
        const formData = new FormData();
        // استخدام PascalCase لأن السيرفر غالباً يتوقعها في الـ FormData بناءً على Swagger
        formData.append("Title", data.title);
        formData.append("TeacherId", data.teacherId.toString());
        formData.append("EducationStageId", data.educationStageId.toString());
        formData.append("Price", data.price.toString());
        formData.append("DiscountedPrice", data.discountedPrice.toString());

        if (data.courseImage) {
            formData.append("CourseImageUrl", data.courseImage);
        }

        // Override default 'application/json' by setting Content-Type to undefined
        // This allows the browser to set 'multipart/form-data' with the correct boundary
        const response = await apiClient.post<ApiResponse<any>>("/courses", formData, {
            headers: {
                "Content-Type": undefined
            } as any
        });

        // Normalize the response data
        const c = response.data.data;
        if (c) {
            let img = c.courseImageUrl || c.CourseImageUrl;
            if (img) {
                // Add server URL if relative path
                if (typeof img === 'string' && !img.startsWith('http')) {
                    img = `${env.API.SERVER_URL}${img.startsWith('/') ? '' : '/'}${img}`;
                }
            }

            const normalized: Course = {
                ...c,
                id: c.id || c.Id,
                title: c.title || c.Title,
                gradeYear: c.gradeYear || c.GradeYear || c.EducationStageId,
                teacherId: c.teacherId || c.TeacherId,
                courseImageUrl: img || null,
                educationStageId: c.educationStageId || c.EducationStageId,
                educationStageName: c.educationStageName || c.EducationStageName,
                price: c.price || c.Price || 0,
                discountedPrice: c.discountedPrice || c.DiscountedPrice || 0
            };

            return {
                ...response.data,
                data: normalized
            };
        }

        return response.data;
    },

    editCourse: async (data: EditCourseRequest): Promise<ApiResponse<Course>> => {
        const formData = new FormData();
        formData.append("Id", data.id.toString());
        formData.append("Title", data.title);
        formData.append("TeacherId", data.teacherId.toString());
        formData.append("EducationStageId", data.educationStageId.toString());
        formData.append("Price", data.price.toString());
        formData.append("DiscountedPrice", data.discountedPrice.toString());

        if (data.courseImage) {
            formData.append("CourseImageUrl", data.courseImage);
        }

        const response = await apiClient.put<ApiResponse<any>>("/courses/Edit", formData, {
            headers: {
                "Content-Type": undefined
            } as any
        });

        // Normalize the response data
        const c = response.data.data;
        if (c) {
            let img = c.courseImageUrl || c.CourseImageUrl;
            if (img) {
                // Add server URL if relative path
                if (typeof img === 'string' && !img.startsWith('http')) {
                    img = `${env.API.SERVER_URL}${img.startsWith('/') ? '' : '/'}${img}`;
                }
            }

            const normalized: Course = {
                ...c,
                id: c.id || c.Id,
                title: c.title || c.Title,
                gradeYear: c.gradeYear || c.GradeYear || c.EducationStageId,
                teacherId: c.teacherId || c.TeacherId,
                courseImageUrl: img || null,
                educationStageId: c.educationStageId || c.EducationStageId,
                educationStageName: c.educationStageName || c.EducationStageName,
                price: c.price || c.Price || 0,
                discountedPrice: c.discountedPrice || c.DiscountedPrice || 0
            };

            return {
                ...response.data,
                data: normalized
            };
        }

        return response.data;
    },

    deleteCourse: async (id: number): Promise<ApiResponse<any>> => {
        const response = await apiClient.delete<ApiResponse<any>>(`/courses/${id}`);
        return response.data;
    },

    // Lectures
    getLectures: async (courseId: number): Promise<ApiResponse<Lecture[]>> => {
        const response = await apiClient.get<any>("/lectures");
        let allLectures: any[] = [];

        if (response.data?.data && Array.isArray(response.data.data)) {
            allLectures = response.data.data;
        } else if (Array.isArray(response.data)) {
            allLectures = response.data;
        }

        const normalized = allLectures.map(l => ({
            ...l,
            id: l.id || l.Id,
            title: l.title || l.Title,
            courseId: l.courseId || l.CourseId,
            isVisible: l.isVisible !== undefined ? l.isVisible : (l.IsVisible !== undefined ? l.IsVisible : true)
        }));

        const filtered = normalized.filter((l: Lecture) => l.courseId === courseId);

        return {
            statusCode: 200,
            meta: "",
            succeeded: true,
            message: "",
            errors: null,
            data: filtered
        };
    },

    createLecture: async (data: CreateLectureRequest): Promise<ApiResponse<Lecture>> => {
        const response = await apiClient.post<ApiResponse<Lecture>>("/lectures", data);
        return response.data;
    },

    editLecture: async (data: any): Promise<ApiResponse<Lecture>> => {
        const payload = {
            id: Number(data.id),
            title: data.title,
            courseId: Number(data.courseId)
        };
        const response = await apiClient.put<ApiResponse<Lecture>>("/lectures/Edit", payload);
        return response.data;
    },

    deleteLecture: async (id: number): Promise<ApiResponse<string>> => {
        const response = await apiClient.delete<ApiResponse<string>>(`/lectures/${id}`);
        return response.data;
    },

    updateLectureVisibility: async (data: UpdateLectureVisibilityRequest): Promise<ApiResponse<any>> => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        if (!token) {
            throw new Error("غير مصرح لك، يُرجى تسجيل الدخول مرة أخرى");
        }

        const response = await axios.put<ApiResponse<any>>(
            `${env.API.BASE_URL}/${env.API.VERSION}/lectures/visibility`,
            {
                lectureId: data.lectureId,
                isVisible: data.isVisible
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        return response.data;
    },

    // Materials
    getAllMaterials: async (): Promise<ApiResponse<Material[]>> => {
        const response = await apiClient.get<any>("/lectures/materials");
        let materials: Material[] = [];

        if (response.data?.data && Array.isArray(response.data.data)) {
            materials = response.data.data;
        } else if (Array.isArray(response.data)) {
            materials = response.data;
        }

        materials = materials.map((m: any) => ({
            ...m,
            title: m.title || m.Title || "بدون عنوان",
            isFree: m.isFree === true || m.isFree === "true" || m.IsFree === true || m.IsFree === "true" || m.isFree === 1 || m.IsFree === 1
        }));

        return {
            statusCode: 200,
            meta: "",
            succeeded: true,
            message: "",
            errors: null,
            data: materials
        };
    },

    getMaterials: async (lectureId: number): Promise<ApiResponse<Material[]>> => {
        const response = await apiClient.get<any>("/lectures/materials");
        let allMaterials: Material[] = [];

        if (response.data?.data && Array.isArray(response.data.data)) {
            allMaterials = response.data.data;
        } else if (Array.isArray(response.data)) {
            allMaterials = response.data;
        }

        const filtered = allMaterials
            .filter(m => m.lectureId === lectureId)
            .map((m: any) => ({
                ...m,
                title: m.title || m.Title || "بدون عنوان",
                isFree: m.isFree === true || m.isFree === "true" || m.IsFree === true || m.IsFree === "true" || m.isFree === 1 || m.IsFree === 1
            }));

        return {
            statusCode: 200,
            meta: "",
            succeeded: true,
            message: "",
            errors: null,
            data: filtered
        };
    },

    createMaterial: async (data: CreateMaterialRequest): Promise<ApiResponse<Material>> => {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("type", data.type);
        formData.append("lectureId", data.lectureId.toString());

        const isFreeValue = ((data.isFree as any) === true || (data.isFree as any) === "true") ? "true" : "false";
        formData.append("isFree", isFreeValue);

        if (data.type === "video" && data.videoUrl) {
            formData.append("videoUrl", data.videoUrl);
        } else if ((data.type === "pdf" || data.type === "homework") && data.file) {
            formData.append("file", data.file);
        }

        const response = await apiClient.post<ApiResponse<Material>>(
            "/lectures/materials",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data;
    },

    editMaterial: async (data: any): Promise<ApiResponse<Material>> => {
        const payload = {
            id: Number(data.id),
            title: data.title,
            type: data.type,
            lectureId: Number(data.lectureId),
            isFree: data.isFree === true || data.isFree === "true",
            fileUrl: data.videoUrl || data.fileUrl || ""
        };

        const response = await apiClient.put<ApiResponse<Material>>(
            "/lectures/Edit/materials",
            payload
        );
        return response.data;
    },

    deleteMaterial: async (materialId: number): Promise<ApiResponse<string>> => {
        const response = await apiClient.delete<ApiResponse<string>>(`/lectures/${materialId}/materials`);
        return response.data;
    },

    // Exams
    // جلب كل الامتحانات للمحاضرة (يسمح بأكثر من امتحان)
    getExams: async (lectureId: number): Promise<ApiResponse<Exam[]>> => {
        try {
            const response = await apiClient.get<ApiResponse<any>>(`/lectures/${lectureId}/exam`);
            let data = response.data.data;

            console.log("===== GET EXAMS RESPONSE =====");
            console.log("Raw API response.data:", response.data);
            console.log("Raw exam data:", data);
            console.log("Is data an array?", Array.isArray(data));

            // إذا لم يكن هناك بيانات
            if (!data) {
                console.log("No exams found for this lecture");
                return {
                    statusCode: 200,
                    succeeded: true,
                    message: "No exams found",
                    errors: null,
                    data: [],
                    meta: ""
                };
            }

            // تحويل البيانات إلى array إذا لم تكن كذلك
            const examsArray = Array.isArray(data) ? data : [data];

            if (examsArray.length === 0) {
                return {
                    statusCode: 200,
                    succeeded: true,
                    message: "No exams found",
                    errors: null,
                    data: [],
                    meta: ""
                };
            }

            // تطبيع كل الامتحانات
            const normalizedExams: Exam[] = examsArray.map((examData: any) => ({
                id: examData.id || examData.Id,
                title: examData.title || examData.Title,
                lectureId: examData.lectureId || examData.LectureId,
                lectureName: examData.lectureName || examData.LectureName,
                deadline: examData.deadline || examData.Deadline,
                durationInMinutes: examData.durationInMinutes !== undefined ? examData.durationInMinutes : examData.DurationInMinutes,
                // تحويل النوع من نص إلى رقم: Exam -> 1, Assignment -> 2
                type: (examData.type === 'Assignment' || examData.Type === 'Assignment' || examData.type === 2) ? 2 : 1,
                isVisible: examData.isVisible ?? examData.IsVisible ?? true,
                isRandomized: examData.isRandomized ?? examData.IsRandomized ?? false,
                // ترتيب الأسئلة حسب الـ id لضمان ظهورها بترتيب الإنشاء
                questions: (examData.questions || examData.Questions || []).map((q: any) => {
                    console.log("Raw question data:", q);
                    console.log("All question keys:", Object.keys(q));
                    console.log("Raw options:", q.options || q.Options || q.questionOptions || q.QuestionOptions);
                    return {
                        id: q.id || q.Id,
                        questionType: q.questionType || q.QuestionType,
                        content: q.content || q.Content,
                        answerType: q.answerType || q.AnswerType,
                        score: q.score || q.Score,
                        correctByAssistant: q.correctByAssistant !== undefined ? q.correctByAssistant : q.CorrectByAssistant,
                        correctAnswerPath: q.correctAnswerPath || q.CorrectAnswerPath || q.correctAnswerFile || q.CorrectAnswerFile || q.correctAnswerImage || q.CorrectAnswerImage || q.correctAnswerImageUrl || q.CorrectAnswerImageUrl,
                        examId: q.examId || q.ExamId,
                        options: (q.options || q.Options || q.questionOptions || q.QuestionOptions || []).map((o: any) => ({
                            id: o.id || o.Id,
                            content: o.content || o.Content,
                            isCorrect: o.isCorrect !== undefined ? o.isCorrect : o.IsCorrect,
                            questionId: o.questionId || o.QuestionId
                        }))
                    };
                }).sort((a: any, b: any) => a.id - b.id)
            }));

            console.log("Normalized exams count:", normalizedExams.length);
            console.log("Normalized exams:", JSON.stringify(normalizedExams, null, 2));

            return { ...response.data, data: normalizedExams };
        } catch (error: any) {
            // معالجة حالة 404 - لا يوجد امتحانات
            if (error?.response?.status === 404) {
                console.log("No exams found for this lecture (404)");
                return {
                    statusCode: 200,
                    succeeded: true,
                    message: "No exams found",
                    errors: null,
                    data: [],
                    meta: ""
                };
            }
            throw error;
        }
    },

    // جلب امتحان واحد (للتوافق مع الكود القديم)
    getExam: async (lectureId: number): Promise<ApiResponse<Exam>> => {
        try {
            const response = await apiClient.get<ApiResponse<any>>(`/lectures/${lectureId}/exam`);
            let data = response.data.data;

            console.log("===== GET EXAM RESPONSE =====");
            console.log("Raw API response.data:", response.data);
            console.log("Raw exam data:", data);
            console.log("Is data an array?", Array.isArray(data));

            // إذا لم يكن هناك بيانات أو كانت array فارغة
            if (!data || (Array.isArray(data) && data.length === 0)) {
                console.log("No exam found for this lecture");
                return {
                    statusCode: 200,
                    succeeded: true,
                    message: "No exam found",
                    errors: null,
                    data: null as any,
                    meta: ""
                };
            }

            // إذا كانت البيانات array، نأخذ العنصر الأول
            if (Array.isArray(data)) {
                data = data[0];
                console.log("Extracted first exam from array:", data);
            }

            if (!data) {
                return {
                    statusCode: 200,
                    succeeded: true,
                    message: "No exam found",
                    errors: null,
                    data: null as any,
                    meta: ""
                };
            }

            console.log("Available keys in exam data:", Object.keys(data));

            // Normalize Exam - Check for examId as some APIs use this instead of id
            const normalizedExam: Exam = {
                id: data.id || data.Id || data.examId || data.ExamId,
                title: data.title || data.Title,
                lectureId: data.lectureId || data.LectureId,
                deadline: data.deadline || data.Deadline,
                durationInMinutes: data.durationInMinutes || data.DurationInMinutes,
                type: data.type || data.Type,
                isVisible: data.isVisible ?? data.IsVisible ?? true,
                isRandomized: data.isRandomized ?? data.IsRandomized ?? false,
                // ترتيب الأسئلة حسب الـ id لضمان ظهورها بترتيب الإنشاء
                questions: (data.questions || data.Questions || []).map((q: any) => {
                    // Log for debugging once
                    if (q === (data.questions || data.Questions)[0]) {
                        console.log("Create/Get Exam - First Question Raw:", JSON.stringify(q, null, 2));
                    }
                    return {
                        id: q.id || q.Id,
                        questionType: q.questionType || q.QuestionType,
                        content: q.content || q.Content,
                        answerType: q.answerType || q.AnswerType,
                        score: q.score || q.Score,
                        correctByAssistant: q.correctByAssistant !== undefined ? q.correctByAssistant : q.CorrectByAssistant,
                        correctAnswerPath: q.correctAnswerPath || q.CorrectAnswerPath || q.correctAnswerFile || q.CorrectAnswerFile || q.correctAnswerImage || q.CorrectAnswerImage || q.correctAnswerImageUrl || q.CorrectAnswerImageUrl, // Extended mapping
                        examId: q.examId || q.ExamId,
                        options: (q.options || q.Options || []).map((o: any) => ({
                            id: o.id || o.Id,
                            content: o.content || o.Content,
                            isCorrect: o.isCorrect !== undefined ? o.isCorrect : o.IsCorrect,
                            questionId: o.questionId || o.QuestionId
                        }))
                    };
                }).sort((a: any, b: any) => a.id - b.id)
            };

            console.log("Normalized exam with id:", normalizedExam.id);

            return { ...response.data, data: normalizedExam };
        } catch (error: any) {
            // معالجة حالة 404 - لا يوجد امتحان
            if (error?.response?.status === 404) {
                console.log("No exam found for this lecture (404)");
                return {
                    statusCode: 200,
                    succeeded: true,
                    message: "No exam found",
                    errors: null,
                    data: null as any,
                    meta: ""
                };
            }
            // إعادة رمي الخطأ لأي حالة أخرى
            throw error;
        }
    },

    createExam: async (data: CreateExamRequest): Promise<ApiResponse<Exam>> => {
        console.log("===== CREATE EXAM REQUEST =====");
        console.log("Data being sent:", {
            title: data.title,
            lectureId: data.lectureId,
            deadline: data.deadline,
            durationInMinutes: data.durationInMinutes,
            type: data.type,
            isVisible: data.isVisible,
            isRandomized: data.isRandomized
        });

        try {
            const response = await apiClient.post<ApiResponse<any>>("/exams", {
                title: data.title,
                lectureId: data.lectureId,
                deadline: data.deadline,
                durationInMinutes: data.durationInMinutes,
                type: data.type, // 1 = exam, 2 = homework
                isVisible: data.isVisible,
                isRandomized: data.isRandomized
            });

            console.log("Create Exam Response:", response.data);
            const exam = response.data.data;
            if (!exam) {
                console.log("No exam data in response");
                return response.data;
            }

            const normalizedExam: Exam = {
                id: exam.id || exam.Id,
                title: exam.title || exam.Title,
                lectureId: exam.lectureId || exam.LectureId,
                deadline: exam.deadline || exam.Deadline,
                durationInMinutes: exam.durationInMinutes || exam.DurationInMinutes,
                type: exam.type || exam.Type,
                isVisible: exam.isVisible ?? exam.IsVisible ?? true,
                isRandomized: exam.isRandomized ?? exam.IsRandomized ?? false,
                questions: []
            };
            console.log("Normalized exam:", normalizedExam);
            return { ...response.data, data: normalizedExam };
        } catch (error: any) {
            console.error("Create Exam Error:", error?.response?.data || error?.message || error);
            throw error;
        }
    },

    editExam: async (data: EditExamRequest): Promise<ApiResponse<Exam>> => {
        console.log("===== EDIT EXAM REQUEST =====");
        console.log("Received data object:", data);
        console.log("data.id value:", data.id, "type:", typeof data.id);

        // التأكد من وجود الـ ID
        if (!data.id) {
            console.error("ERROR: Exam ID is missing!");
            throw new Error("Exam ID is required for editing");
        }

        // تحويل الـ type إلى رقم إذا كان string
        let examType: number = 1;
        if (typeof data.type === 'number') {
            examType = data.type;
        } else if (typeof data.type === 'string') {
            // تحويل من string إلى رقم
            if (data.type === 'Exam' || data.type === 'exam' || data.type === '1') {
                examType = 1;
            } else if (data.type === 'Homework' || data.type === 'homework' || data.type === '2') {
                examType = 2;
            } else {
                examType = parseInt(data.type, 10) || 1;
            }
        }

        const requestBody = {
            id: data.id,
            title: data.title,
            lectureId: data.lectureId,
            deadline: data.deadline,
            durationInMinutes: data.durationInMinutes,
            isFree: false, // إضافة هذا الحقل المطلوب من الـ API
            type: examType, // 1 = exam, 2 = homework (must be number)
            isRandomized: data.isRandomized
        };

        console.log("Request body being sent:", JSON.stringify(requestBody, null, 2));

        // الـ API يتوقع camelCase بناءً على Swagger documentation
        const response = await apiClient.put<ApiResponse<any>>("/exams/Edit", requestBody);

        console.log("Edit Exam Response:", response.data);
        const exam = response.data.data;
        if (!exam) return response.data;

        const normalizedExam: Exam = {
            id: exam.id || exam.Id,
            title: exam.title || exam.Title,
            lectureId: exam.lectureId || exam.LectureId,
            deadline: exam.deadline || exam.Deadline,
            durationInMinutes: exam.durationInMinutes || exam.DurationInMinutes,
            type: exam.type || exam.Type,
            isVisible: exam.isVisible ?? exam.IsVisible ?? true,
            isRandomized: exam.isRandomized ?? exam.IsRandomized ?? false,
            questions: []
        };
        return { ...response.data, data: normalizedExam };
    },

    deleteExam: async (examId: number): Promise<ApiResponse<string>> => {
        const response = await apiClient.delete<ApiResponse<string>>(`/exams/${examId}`);
        return response.data;
    },

    changeExamVisibility: async (data: ChangeExamVisibilityRequest): Promise<ApiResponse<any>> => {
        // الـ API يستخدم query parameters وليس body
        // لاحظ: الـ parameter اسمه isVasbilty (خطأ إملائي في الـ API)
        const response = await apiClient.put<ApiResponse<any>>(
            `/exams/change-visiblity?examId=${data.examId}&isVasbilty=${data.isVisible}`
        );
        return response.data;
    },

    editQuestion: async (data: EditQuestionRequest): Promise<ApiResponse<ExamQuestion>> => {
        const formData = new FormData();
        formData.append("Id", data.id.toString());
        formData.append("QuestionType", data.questionType);
        formData.append("Content", data.content || "");
        formData.append("AnswerType", data.answerType);
        formData.append("Score", data.score.toString());
        formData.append("ExamId", data.examId.toString());
        formData.append("CorrectByAssistant", data.correctByAssistant.toString());

        if (data.file) {
            formData.append("File", data.file);
        }

        if (data.correctAnswerFile) {
            formData.append("CorrectAnswerFile", data.correctAnswerFile);
        }

        const response = await apiClient.put<ApiResponse<any>>("/exams/Edit/questions", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        const q = response.data.data;
        if (!q) return response.data;

        const normalizedQuestion: ExamQuestion = {
            id: q.id || q.Id,
            questionType: q.questionType || q.QuestionType,
            content: q.content || q.Content,
            answerType: q.answerType || q.AnswerType,
            score: q.score || q.Score,
            correctByAssistant: q.correctByAssistant !== undefined ? q.correctByAssistant : q.CorrectByAssistant,
            correctAnswerPath: q.correctAnswerPath || q.CorrectAnswerPath || q.correctAnswerFile || q.CorrectAnswerFile || q.correctAnswerImageUrl || q.CorrectAnswerImageUrl,
            examId: q.examId || q.ExamId,
            options: (q.options || q.Options || []).map((o: any) => ({
                id: o.id || o.Id,
                content: o.content || o.Content,
                isCorrect: o.isCorrect !== undefined ? o.isCorrect : o.IsCorrect,
                questionId: o.questionId || o.QuestionId
            }))
        };

        return { ...response.data, data: normalizedQuestion };
    },

    deleteQuestion: async (questionId: number): Promise<ApiResponse<string>> => {
        const response = await apiClient.delete<ApiResponse<string>>(`/exams/${questionId}/questions`);
        return response.data;
    },


    editOption: async (data: EditOptionRequest): Promise<ApiResponse<any>> => {
        const response = await apiClient.put<ApiResponse<any>>("/question-options", {
            id: data.id,
            content: data.content,
            isCorrect: data.isCorrect,
            questionId: data.questionId
        });
        return response.data;
    },

    deleteOption: async (optionId: number): Promise<ApiResponse<string>> => {
        const response = await apiClient.delete<ApiResponse<string>>(`/question-options/${optionId}`);
        return response.data;
    },


    createQuestion: async (data: CreateQuestionRequest): Promise<ApiResponse<ExamQuestion>> => {
        const formData = new FormData();
        formData.append("examId", data.examId.toString());
        formData.append("questionType", data.questionType);
        formData.append("content", data.content || "");
        formData.append("answerType", data.answerType);
        formData.append("score", data.score.toString());
        formData.append("correctByAssistant", data.correctByAssistant.toString());

        if (data.file) {
            formData.append("File", data.file);
        }

        if (data.correctAnswerFile) {
            formData.append("CorrectAnswerFile", data.correctAnswerFile);
        }

        const response = await apiClient.post<ApiResponse<any>>("/exams/questions", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        console.log("===== CREATE QUESTION RESPONSE =====");
        console.log("Full response.data:", JSON.stringify(response.data, null, 2));

        // Try to get question data from various possible locations
        let q = response.data.data;

        // If data is null/undefined, check if the response itself contains the question
        if (!q && response.data) {
            // Maybe the question is directly in response.data (cast to any for checking)
            const resData = response.data as any;
            if (resData.id || resData.Id || resData.questionId || resData.QuestionId) {
                q = resData;
            }
        }

        console.log("Extracted question data:", q);

        if (!q) {
            console.log("No question data found in response");
            return response.data;
        }

        // Extract ID from various possible fields
        const questionId = q.id || q.Id || q.questionId || q.QuestionId;
        console.log("Extracted questionId:", questionId);

        const normalizedQuestion: ExamQuestion = {
            id: questionId,
            questionType: q.questionType || q.QuestionType,
            content: q.content || q.Content,
            answerType: q.answerType || q.AnswerType,
            score: q.score || q.Score,
            correctByAssistant: q.correctByAssistant !== undefined ? q.correctByAssistant : q.CorrectByAssistant,
            correctAnswerPath: q.correctAnswerPath || q.CorrectAnswerPath || q.correctAnswerFile || q.CorrectAnswerFile || q.correctAnswerImageUrl || q.CorrectAnswerImageUrl,
            examId: q.examId || q.ExamId || data.examId,
            options: []
        };

        console.log("Normalized question:", normalizedQuestion);

        return { ...response.data, data: normalizedQuestion };
    },

    createOption: async (data: CreateOptionRequest): Promise<ApiResponse<ExamOption>> => {
        console.log("===== CREATE OPTION =====");
        console.log("Sending data:", data);
        console.log("questionId:", data.questionId);

        const response = await apiClient.post<ApiResponse<any>>("/question-options", {
            content: data.content,
            isCorrect: data.isCorrect,
            questionId: data.questionId
        });

        console.log("Response:", response.data);

        const o = response.data.data;
        if (!o) return response.data;

        const normalizedOption: ExamOption = {
            id: o.id || o.Id,
            content: o.content || o.Content,
            isCorrect: o.isCorrect !== undefined ? o.isCorrect : o.IsCorrect,
            questionId: o.questionId || o.QuestionId
        };

        return { ...response.data, data: normalizedOption };
    },

    getExamSubmissions: async (lectureId: number): Promise<ApiResponse<ExamSubmission[]>> => {
        const response = await apiClient.get<ApiResponse<ExamSubmission[]>>(`/lectures/${lectureId}/exam-submissions`);
        return response.data;
    },

    gradeExam: async (data: GradeExamRequest): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>("/exams/grade", data);
        return response.data;
    },

    getStudentExamResult: async (examId: number, studentId: number): Promise<ApiResponse<ExamScoreResponse>> => {
        const response = await apiClient.get<ApiResponse<any>>(`/exams/${examId}/students/${studentId}/score`);
        const data = response.data.data;
        if (!data) return response.data;

        const normalized: ExamScoreResponse = {
            studentExamResultId: data.studentExamResultId || data.StudentExamResultId,
            totalScore: data.totalScore ?? data.TotalScore ?? 0,
            isFinished: data.isFinished ?? data.IsFinsh ?? data.IsFinished ?? true,
            submittedAt: data.submittedAt || data.SubmittedAt,
            studentAnswers: (data.studentAnswers || data.StudentAnswers || []).map((a: any) => ({
                studentAnswerId: a.studentAnswerId || a.StudentAnswerId || a.id || a.Id,
                questionId: a.questionId || a.QuestionId,
                questionContent: a.questionContent || a.QuestionContent,
                questionType: a.questionType || a.QuestionType,
                answerType: a.answerType || a.AnswerType,
                maxScore: a.maxScore || a.MaxScore,
                pointsEarned: a.pointsEarned ?? a.PointsEarned ?? null,
                isCorrect: a.isCorrect ?? a.IsCorrect ?? false,
                textAnswer: a.textAnswer || a.TextAnswer || null,
                imageAnswerUrl: a.imageAnswerUrl || a.ImageAnswerUrl || null,
                feedback: a.feedback || a.Feedback || "",
                selectedOptions: a.selectedOptions || a.SelectedOptions || [],
                questionOptions: (a.questionOptions || a.QuestionOptions || []).map((o: any) => ({
                    optionId: o.optionId || o.OptionId,
                    optionContent: o.optionContent || o.OptionContent,
                    isCorrect: o.isCorrect ?? o.IsCorrect ?? false,
                    isSelected: o.isSelected ?? o.IsSelected ?? false
                }))
            }))
        };

        return { ...response.data, data: normalized };
    },

    registerAssistant: async (data: RegisterAssistantRequest): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>(`${env.API.SERVER_URL}/RegisterAssistant`, data);
        return response.data;
    },

    getAssistants: async (teacherId: number): Promise<ApiResponse<Assistant[]>> => {
        try {
            const response = await apiClient.get<any>(`${env.API.SERVER_URL}/ByTeacher/${teacherId}`);

            let assistants: any[] = [];
            if (response.data?.data && Array.isArray(response.data.data)) {
                assistants = response.data.data;
            } else if (Array.isArray(response.data)) {
                assistants = response.data;
            }

            const normalized = assistants.map(a => ({
                ...a,
                id: a.id || a.Id || a.userId || a.UserId,
                firstName: a.firstName || a.FirstName,
                lastName: a.lastName || a.LastName,
                email: a.email || a.Email,
                teacherId: a.teacherId || a.TeacherId
            }));

            return {
                ...response.data,
                data: normalized
            };
        } catch (error: any) {
            // معالجة حالة 404 - لا يوجد مساعدين
            if (error?.response?.status === 404) {
                return {
                    statusCode: 200,
                    succeeded: true,
                    message: "No assistants found",
                    errors: null,
                    data: [],
                    meta: ""
                };
            }
            throw error;
        }
    },

    // Subscriptions
    getSubscriptions: async (teacherId: number): Promise<ApiResponse<CourseSubscription[]>> => {
        try {
            const response = await apiClient.get<any>(`/course-subscriptions/teacher/${teacherId}`);

            let subscriptions: any[] = [];
            if (response.data?.data && Array.isArray(response.data.data)) {
                subscriptions = response.data.data;
            } else if (Array.isArray(response.data)) {
                subscriptions = response.data;
            }

            const normalized = subscriptions.map((s, index) => {
                // Debug logging for subscription data normalization
                if (index === 0) {
                    console.log("Raw Subscription (First Item):", s);
                    console.log("Student Email Candidates:", {
                        simple: s.studentEmail,
                        simpleUpper: s.StudentEmail,
                        email: s.email,
                        Email: s.Email,
                        nested: s.student?.email,
                        nestedUpper: s.Student?.Email
                    });
                }

                return {
                    courseSubscriptionId: s.courseSubscriptionId || s.CourseSubscriptionId || s.id || s.Id,
                    studentId: s.studentId || s.StudentId,
                    studentName: s.studentName || s.StudentName,
                    studentEmail: s.studentEmail || s.StudentEmail || s.email || s.Email || s.student?.email || s.Student?.Email || "No Email",
                    courseId: s.courseId || s.CourseId,
                    courseName: s.courseName || s.CourseName,
                    teacherName: s.teacherName || s.TeacherName,
                    educationStageId: s.educationStageId || s.EducationStageId,
                    educationStageName: s.educationStageName || s.EducationStageName,
                    status: normalizeStatus(s.status || s.Status),
                    createdAt: s.createdAt || s.CreatedAt,
                    lectures: (s.lectures || s.Lectures || []).map((l: any) => ({
                        id: l.id || l.Id,
                        title: l.title || l.Title,
                        materials: (l.materials || l.Materials || []).map((m: any) => ({
                            id: m.id || m.Id,
                            type: m.type || m.Type,
                            fileUrl: m.fileUrl || m.FileUrl,
                            isFree: m.isFree === true || m.isFree === "true" || m.IsFree === true || m.IsFree === "true"
                        }))
                    }))
                };
            });

            return {
                statusCode: response.data?.statusCode || 200,
                succeeded: response.data?.succeeded ?? true,
                message: response.data?.message || "",
                errors: null,
                data: normalized,
                meta: ""
            };
        } catch (error: any) {
            // معالجة حالة 404 - لا يوجد اشتراكات
            if (error?.response?.status === 404) {
                return {
                    statusCode: 200,
                    succeeded: true,
                    message: "No subscriptions found",
                    errors: null,
                    data: [],
                    meta: ""
                };
            }
            throw error;
        }
    },

    updateStudentAnswerImage: async (studentAnswerId: number, imageFile: File): Promise<ApiResponse<any>> => {
        const formData = new FormData();
        formData.append("id", studentAnswerId.toString());
        formData.append("ImageFile", imageFile);

        const response = await apiClient.put<ApiResponse<any>>(`/student-answers/${studentAnswerId}/image`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data;
    },

    updateSubscriptionStatus: async (data: UpdateSubscriptionStatusRequest): Promise<ApiResponse<any>> => {
        console.log("===== UPDATE SUBSCRIPTION STATUS =====");
        console.log("Request data:", {
            id: data.id,
            status: data.status
        });

        try {
            const response = await apiClient.put<ApiResponse<any>>("/course-subscriptions/status", {
                id: data.id,
                status: data.status
            });
            console.log("Response:", response.data);
            return response.data;
        } catch (error: any) {
            console.error("Update subscription error:", error?.response?.data || error?.message);
            throw error;
        }
    },

    approveSubscription: async (teacherId: number, courseId: number, studentEmail: string): Promise<ApiResponse<any>> => {
        console.log("Excuting Manual Approval:", { teacherId, courseId, studentEmail });
        const response = await apiClient.post<ApiResponse<any>>(
            `/course-subscriptions/teacher/${teacherId}/course/${courseId}/students/${encodeURIComponent(studentEmail)}/approve`
        );
        return response.data;
    },

    // Course Student Scores
    getCourseStudentScores: async (courseId: number, teacherId: number): Promise<ApiResponse<CourseStudentScore[]>> => {
        const response = await apiClient.get<any>(`/courses/${courseId}/students/${teacherId}/scores`);

        let scores: any[] = [];
        if (response.data?.data && Array.isArray(response.data.data)) {
            scores = response.data.data;
        } else if (Array.isArray(response.data)) {
            scores = response.data;
        }

        const normalized = scores.map((s: any) => ({
            studentId: s.studentId || s.StudentId,
            studentName: s.studentName || s.StudentName,
            studentEmail: s.studentEmail || s.StudentEmail,
            totalScore: s.totalScore ?? s.TotalScore ?? 0,
            maxScore: s.maxScore ?? s.MaxScore ?? 0,
            percentage: s.percentage ?? s.Percentage ?? 0,
            examsTaken: s.examsTaken ?? s.ExamsTaken ?? 0,
            examsCompleted: s.examsCompleted ?? s.ExamsCompleted ?? 0
        }));

        return {
            statusCode: response.data?.statusCode || 200,
            succeeded: response.data?.succeeded ?? true,
            message: response.data?.message || "Success",
            errors: null,
            data: normalized,
            meta: ""
        };
    },

    // Teacher Revenue
    getTeacherRevenue: async (teacherId: number): Promise<ApiResponse<TeacherRevenue>> => {
        const response = await apiClient.get<any>(`/teachers/revenue/${teacherId}`);

        const data = response.data?.data || response.data;
        if (!data) {
            return {
                statusCode: 404,
                succeeded: false,
                message: "لا توجد بيانات إيرادات",
                errors: null,
                data: null as any,
                meta: ""
            };
        }

        // Normalize courses
        const normalizedCourses: RevenueCourse[] = (data.courses || data.Courses || []).map((c: any) => ({
            courseId: c.courseId || c.CourseId,
            courseTitle: c.courseTitle || c.CourseTitle,
            coursePrice: c.coursePrice ?? c.CoursePrice ?? 0,
            approvedSubscriptions: c.approvedSubscriptions ?? c.ApprovedSubscriptions ?? 0,
            courseRevenue: c.courseRevenue ?? c.CourseRevenue ?? 0,
            students: (c.students || c.Students || []).map((s: any) => ({
                studentId: s.studentId || s.StudentId,
                studentName: s.studentName || s.StudentName,
                studentEmail: s.studentEmail || s.StudentEmail,
                paidAmount: s.paidAmount ?? s.PaidAmount ?? 0,
                subscriptionDate: s.subscriptionDate || s.SubscriptionDate
            }))
        }));

        const normalized: TeacherRevenue = {
            teacherId: data.teacherId || data.TeacherId,
            teacherName: data.teacherName || data.TeacherName,
            courses: normalizedCourses,
            totalRevenue: data.totalRevenue ?? data.TotalRevenue ?? 0,
            totalApprovedSubscriptions: data.totalApprovedSubscriptions ?? data.TotalApprovedSubscriptions ?? 0
        };

        return {
            statusCode: response.data?.statusCode || 200,
            succeeded: response.data?.succeeded ?? true,
            message: response.data?.message || "Success",
            errors: null,
            data: normalized,
            meta: ""
        };
    },

    // Deadline Exception - استثناء موعد الامتحان
    createDeadlineException: async (data: {
        examId: number;
        studentId: number;
        extendedDeadline: string;
        allowedAfterDeadline: boolean;
        reason: string;
    }): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>("/exams/deadline-exception", {
            examId: data.examId,
            studentId: data.studentId,
            extendedDeadline: data.extendedDeadline,
            allowedAfterDeadline: data.allowedAfterDeadline,
            reason: data.reason
        });
        return response.data;
    },

    // الحصول على الطلاب المشتركين في كورس معين
    getCourseSubscribedStudents: async (courseId: number): Promise<ApiResponse<any[]>> => {
        const response = await apiClient.get<ApiResponse<any>>(`/course-subscriptions/course/${courseId}/students`);

        let students: any[] = [];
        if (response.data?.data && Array.isArray(response.data.data)) {
            students = response.data.data;
        } else if (Array.isArray(response.data)) {
            students = response.data;
        }

        const normalized = students.map((s: any) => ({
            studentId: s.studentId || s.StudentId || s.id || s.Id,
            studentName: s.studentName || s.StudentName || `${s.firstName || s.FirstName || ''} ${s.lastName || s.LastName || ''}`.trim(),
            studentEmail: s.studentEmail || s.StudentEmail || s.email || s.Email,
            status: s.status || s.Status || 'Approved'
        }));

        return {
            statusCode: response.data?.statusCode || 200,
            succeeded: response.data?.succeeded ?? true,
            message: response.data?.message || "Success",
            errors: null,
            data: normalized,
            meta: ""
        };
    }
};
