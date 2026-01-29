export interface ApiResponse<T> {
    statusCode: number;
    meta: string;
    succeeded: boolean;
    message: string;
    errors: any;
    data: T;
}

export interface AuthData {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    token: string;
    isDisable: boolean;
    tokenExpiresIn: number;
    refreshToken: string;
    refreshTokenExpiresIn: string;
    roles: string[];
    applicationUserId: string;
    userId: number;
    teacherId?: number; // للـ Assistant: ID المعلم الذي يتبعه
    photoUrl?: string;
    phoneNumber?: string;
    facebookUrl?: string;
    telegramUrl?: string;
    youTubeChannelUrl?: string;
    whatsAppNumber?: string;
}

export interface EditProfileRequest {
    userId: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    facebookUrl?: string;
    telegramUrl?: string;
    youTubeChannelUrl?: string;
    whatsAppNumber?: string;
    photoFile?: File;
}

export interface LoginRequest {
    email: string;
    password: string;
    deviceId: string;
    deviceName: string;
}

export type LoginResponse = ApiResponse<AuthData>;

export interface EducationStage {
    id: number;
    name: string;
}

export interface Subject {
    id: number;
    name: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    gradeYear?: number;
    parentPhoneNumber?: string;
    subjectId?: number;
    educationStageIds?: number[];
    nationalId: string;
    teacherId?: number;
    phoneNumber?: string;
    facebookUrl?: string;
    telegramUrl?: string;
    whatsAppNumber?: string;
    parentPhoneNumberOfParent?: string;
    photoFile?: any;
}
