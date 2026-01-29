export interface Course {
    id: number;
    title: string;
    gradeYear: number;
    teacherId: number;
    courseImageUrl?: string;
    educationStageId?: number;
    educationStageName?: string;
    lectureCount?: number;
    price: number;
    discountedPrice: number;
}

export interface CreateCourseRequest {
    title: string;
    educationStageId: number;
    teacherId: number;
    price: number;
    discountedPrice: number;
    courseImage?: File;
}

export interface EditCourseRequest extends CreateCourseRequest {
    id: number;
}

export interface Lecture {
    id: number;
    title: string;
    courseId: number;
    isVisible?: boolean; // حالة ظهور المحاضرة للطلاب
}

export interface UpdateLectureVisibilityRequest {
    lectureId: number;
    isVisible: boolean;
}

export interface CreateLectureRequest {
    title: string;
    courseId: number;
}

export type MaterialType = "video" | "pdf" | "homework";

export interface Material {
    id: number;
    title: string;
    type: MaterialType;
    lectureId: number;
    videoUrl?: string; // YouTube URL
    fileUrl?: string;  // PDF or Image Link
    isFree: boolean;
    description?: string;
}

export interface CreateMaterialRequest {
    title: string;
    type: MaterialType;
    lectureId: number;
    file?: File;
    videoUrl?: string;
    isFree: boolean;
}

// Exams
export interface ExamOption {
    id: number;
    content: string;
    isCorrect: boolean;
    questionId: number;
}

export interface ExamQuestion {
    id: number;
    questionType: string; // e.g., "Text"
    content: string;
    answerType: string;   // e.g., "MCQ"
    score: number;
    correctByAssistant: boolean;
    examId: number;
    options: ExamOption[];
    correctAnswerPath?: string; // Image path
}

// Exam Types
export type ExamType = 1 | 2; // 1 = exam, 2 = homework

export interface Exam {
    id: number;
    title: string;
    lectureId: number;
    lectureName?: string;
    deadline?: string;
    durationInMinutes?: number;
    type?: ExamType; // 1 = exam, 2 = homework
    isVisible?: boolean; // إظهار/إخفاء الامتحان للطلاب
    isRandomized?: boolean; // ترتيب الأسئلة عشوائي
    questions: ExamQuestion[];
}

export interface CreateExamRequest {
    title: string;
    lectureId: number;
    deadline: string;
    durationInMinutes: number;
    type: ExamType; // 1 = exam, 2 = homework
    isVisible: boolean;
    isRandomized: boolean;
}

// Edit API doesn't accept isVisible - only isRandomized
export interface EditExamRequest {
    id: number;
    title: string;
    lectureId: number;
    deadline: string;
    durationInMinutes: number;
    type: ExamType;
    isRandomized: boolean;
}


export interface CreateQuestionRequest {
    examId: number;
    questionType: string;
    content: string;
    answerType: string;
    score: number;
    correctByAssistant: boolean;
    file?: File;
    correctAnswerFile?: File; // صورة للإجابة الصحيحة (اختياري)
}

export interface EditQuestionRequest extends CreateQuestionRequest {
    id: number;
}


export interface CreateOptionRequest {
    content: string;
    isCorrect: boolean;
    questionId: number;
}

export interface EditOptionRequest extends CreateOptionRequest {
    id: number;
}

export interface ChangeExamVisibilityRequest {
    examId: number;
    isVisible: boolean;
}


export interface TeacherData {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    roles?: string[];
    token: string;
}

// Submissions & Grading
export interface ExamSubmission {
    studentExamResultId: number;
    studentId: number;
    studentName: string;
    studentEmail: string;
    examId: number;
    examTitle: string;
    currentTotalScore: number;
    maxScore: number;
    isFinished: boolean;
    submittedAt: string;
    totalAnswers: number;
    manuallyGradedAnswers: number;
    pendingGradingAnswers: number;
}

export interface GradedAnswer {
    studentAnswerId: number;
    pointsEarned: number;
    isCorrect: boolean;
    feedback: string;
}

export interface GradeExamRequest {
    studentExamResultId: number;
    gradedAnswers: GradedAnswer[];
}

export interface StudentAnswerOption {
    optionId: number;
    optionContent: string;
    isCorrect: boolean;
    isSelected: boolean;
}

export interface StudentAnswerDetail {
    studentAnswerId?: number; // The unique ID for this specific answer record
    questionId: number;
    questionContent: string;
    questionType: string;
    answerType: string;
    maxScore: number;
    pointsEarned: number | null;
    isCorrect: boolean;
    textAnswer: string | null;
    imageAnswerUrl: string | null;
    selectedOptions: any[];
    questionOptions: StudentAnswerOption[];
    feedback?: string;
}

export interface ExamScoreResponse {
    studentExamResultId: number;
    totalScore: number;
    isFinished: boolean;
    submittedAt: string;
    studentAnswers: StudentAnswerDetail[];
}

export interface Assistant {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    teacherId: number;
}

export interface RegisterAssistantRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    teacherId: number;
}

export type SubscriptionStatus = "Pending" | "Approved" | "Rejected";

export interface SubscriptionLectureMaterial {
    id: number;
    type: string;
    fileUrl: string;
    isFree: boolean;
}

export interface SubscriptionLecture {
    id: number;
    title: string;
    materials: SubscriptionLectureMaterial[];
}

export interface CourseSubscription {
    courseSubscriptionId: number;
    studentId: number;
    studentName: string;
    studentEmail: string; // Added for approval endpoint
    courseId: number;
    courseName: string;
    teacherName: string;
    educationStageId: number;
    educationStageName: string;
    status: SubscriptionStatus;
    createdAt: string;
    lectures: SubscriptionLecture[];
}

export interface UpdateSubscriptionStatusRequest {
    id: number;
    status: SubscriptionStatus;
}

// Deadline Exception - استثناء موعد الامتحان
export interface DeadlineExceptionRequest {
    examId: number;
    studentId: number;
    extendedDeadline: string;
    allowedAfterDeadline: boolean;
    reason: string;
}

export interface DeadlineException {
    id: number;
    examId: number;
    studentId: number;
    studentName?: string;
    extendedDeadline: string;
    allowedAfterDeadline: boolean;
    reason: string;
    createdAt?: string;
}

// Course Student Scores
export interface CourseStudentScore {
    studentId: number;
    studentName: string;
    studentEmail: string;
    totalScore: number;
    maxScore: number;
    percentage: number;
    examsTaken: number;
    examsCompleted: number;
}

// Teacher Revenue
export interface RevenueStudent {
    studentId: number;
    studentName: string;
    studentEmail: string;
    paidAmount: number;
    subscriptionDate: string;
}

export interface RevenueCourse {
    courseId: number;
    courseTitle: string;
    coursePrice: number;
    approvedSubscriptions: number;
    courseRevenue: number;
    students: RevenueStudent[];
}



export interface TeacherRevenue {
    teacherId: number;
    teacherName: string;
    courses: RevenueCourse[];
    totalRevenue: number;
    totalApprovedSubscriptions: number;
}
