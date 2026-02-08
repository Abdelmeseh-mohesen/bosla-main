export interface Subject {
    id: number;
    name: string;
    subjectImageUrl: string;
}

export interface TeacherEducationStage {
    id: number;
    educationStageName: string;
}

// Material types: video, pdf, homework
export interface LectureMaterial {
    id: number;
    title: string;
    type: 'video' | 'pdf' | 'homework' | string;
    fileUrl: string;
    isFree: boolean;
}

export interface Lecture {
    id: number;
    title: string;
    isVisible: boolean;
    materials: LectureMaterial[];
}

export interface TeacherCourse {
    id: number;
    title: string;
    educationStageId: number;
    educationStageName: string;
    courseImageUrl: string | null;
    teacherId?: number;
    teacherName?: string;
    price: number;
    discountedPrice: number;
    lectures: Lecture[];
    subscriptionStatus?: 'Approved' | 'Pending' | 'Rejected' | null;
    isSubscribed?: boolean;
}

export interface SubscribeToCourseRequest {
    studentId: number;
    courseId: number;
}

export interface Teacher {
    id: number;
    teacherName: string;
    teacherEducationStages: TeacherEducationStage[];
    subjectName: string;
    phoneNumber: string;
    facebookUrl: string;
    telegramUrl: string;
    youTubeUrl: string;
    whatsAppNumber: string;
    photoUrl: string | null;
    courses: TeacherCourse[];
}

export interface QuestionOption {
    id: number;
    content: string;
    isCorrect: boolean;
    questionId: number;
}

export interface Question {
    id: number;
    questionType: "Text" | "Image";
    content: string;
    answerType: "MCQ" | "TrueFalse" | "Essay" | "Image";
    score: number;
    correctByAssistant: boolean;
    correctAnswerImageUrl?: string | null; // الإجابة النموذجية للأسئلة الصورية
    examId: number;
    options: QuestionOption[];
}

export interface Exam {
    id: number;
    title: string;
    lectureId: number;
    lectureName: string;
    isFinished: boolean;
    isFinsh?: boolean;
    IsFinished?: boolean;
    IsFinsh?: boolean;
    deadline: string | null;
    durationInMinutes: number;
    examType?: 'exam' | 'homework' | string; // نوع الاختبار
    questions: Question[];
}

export interface ExamAnswer {
    questionId: number;
    selectedOptionIds: number[];
    textAnswer: string;
    imageAnswerUrl?: string;
    file?: File; // Temporary for submission flow
}

export interface SubmitExamRequest {
    examId: number;
    studentId: number;
    answers: ExamAnswer[];
}

export interface Notification {
    id: number; // Changed from notificationId based on API response example
    title: string;
    body: string;
    timestamp: string;
    isRead: boolean;
}

export interface StudentAnswerOption {
    optionId: number;
    optionContent: string;
    isCorrect: boolean;
    isSelected: boolean;
}

export interface StudentAnswerDetail {
    studentAnswerId: number;
    questionId: number;
    questionContent: string;
    questionType: string;
    answerType: string;
    maxScore: number;
    correctByAssistant: boolean;
    pointsEarned: number | null;
    isCorrect: boolean;
    textAnswer: string | null;
    imageAnswerUrl: string | null;
    selectedOptions: any[];
    questionOptions: StudentAnswerOption[];
    feedback?: string; // ملاحظات المدرس
    gradedByName?: string; // اسم المصحح
    correctAnswerImageUrl?: string; // الإجابة النموذجية للأسئلة الصورية
}

export interface ExamScoreResponse {
    examId: number;
    examTitle: string;
    studentExamResultId: number;
    totalScore: number;
    isFinished: boolean;
    isGraded?: boolean; // هل تم التصحيح الكامل
    IsFinsh?: boolean;
    IsFinished?: boolean;
    submittedAt: string;
    studentAnswers: StudentAnswerDetail[];
}

export interface SubjectTeachersResponse {
    id: number;
    name: string;
    subjectImageUrl: string;
    teachers: Teacher[];
}

export interface PaginatedResponse<T> {
    statusCode: number;
    meta: any;
    succeeded: boolean;
    message: string;
    errors: any;
    data: T[];
}

export interface ApiResponse<T> {
    statusCode: number;
    meta: any;
    succeeded: boolean;
    message: string;
    errors: any;
    data: T;
}

// Student Profile Types
export interface StudentProfile {
    studentId: number;  // The Integer ID (e.g. 34) used for updates
    userId: string;     // The GUID (e.g. "ddc...") used for auth
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    gradeYear: number;
    parentPhoneNumber: string;
    studentPhoneNumber?: string;
    governorate?: string;
    city?: string;
    studentProfileImageUrl?: string;
    isProfileComplete: boolean;
    roles: string[];
}

export interface UpdateStudentProfileRequest {
    studentId: string;
    studentPhoneNumber: string;
    parentPhoneNumber: string;
    governorate: string;
    city: string;
    photoFile?: File;
}

// Exam Access Check Response (for deadline exceptions)
export interface ExamAccessResponse {
    examId: number;
    studentId: number;
    canAccessExam: boolean;
    deadline: string | null;
    extendedDeadline: string | null;
    reason: string | null;
    message: string;
}
