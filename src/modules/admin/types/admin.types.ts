// Admin API Response Types

export interface ApiResponse<T> {
    statusCode: number;
    meta: string;
    succeeded: boolean;
    message: string;
    errors: string[];
    data: T;
}

// Student Type
export interface Student {
    studentId: number;
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    gradeYear: number;
    parentPhoneNumber: string;
    isDisable: boolean;
}

// Teacher Type
export interface Teacher {
    teacherId: number;
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    phoneNumber: string;
    photoUrl: string;
    subjectId: number;
    subjectName: string;
    isDisable: boolean;
}

// Parent Type
export interface Parent {
    parentId: number;
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    parentPhoneNumber: string;
    childrenCount: number;
}

// All Users Response
export interface AllUsersData {
    students: Student[];
    teachers: Teacher[];
    parents: Parent[];
}

// Statistics Response
export interface StatisticsData {
    totalTeachers: number;
    totalRegisteredUsers: number;
    totalParents: number;
    totalStudents: number;
    totalExams: number;
    totalCourses: number;
    teachersChangeMessage: string;
    registeredUsersChangeMessage: string;
    parentsChangeMessage: string;
    studentsChangeMessage: string;
    examsChangeMessage: string;
    coursesChangeMessage: string;
}

// Dashboard Stats for display
export interface DashboardStat {
    id: string;
    label: string;
    value: number;
    changeMessage: string;
    icon: string;
    color: string;
    gradient: string;
}

// App Info Settings
export interface AppInfoData {
    aboutUs: string;
    supportPhoneNumber: string;
    applicationUrl: string;
    googleIconEnabled: boolean;
    version: string;
    explanationVideoFile?: File | null;
}

export interface UpdateAppInfoRequest {
    AboutUs?: string;
    SupportPhoneNumber?: string;
    ApplicationUrl?: string;
    GoogleIconEnabled?: boolean;
    Version?: string;
    ExplanationVideoFile?: File | null;
}
