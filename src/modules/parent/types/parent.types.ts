// Parent Module Types

export interface ApiResponse<T> {
    statusCode: number;
    succeeded: boolean;
    message: string;
    data: T;
}

export interface StudentCourse {
    courseId: number;
    courseTitle: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    createdAt: string;
}

export interface Student {
    studentId: number;
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    gradeYear: number;
    courses: StudentCourse[];
}

export interface ExamScore {
    examId: number;
    examTitle: string;
    totalScore: number;
    maxScore: number;
    isFinished: boolean;
    submittedAt: string;
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
}

export interface ParentUser {
    applicationUserId: string;
    firstName: string;
    lastName: string;
    email: string;
    photoUrl?: string;
    roles: string[];
}
