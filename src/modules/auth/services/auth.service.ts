import { apiClient } from "@/services/api-client";
import { env } from "@/config/env";
import axios from "axios";
import { LoginFormValues } from "../types/auth.schemas";
import {
    LoginResponse,
    LoginRequest,
    RegisterRequest,
    EditProfileRequest,
    EducationStage,
    Subject,
    ApiResponse
} from "../types/auth.types";

// Types for Google Sign-In role selection flow
export interface UpdateUserRoleRequest {
    userId: string;
    newRole: "Student" | "Teacher";
}

export interface CreateStudentProfileRequest {
    userId: string;
    studentPhoneNumber?: string;
    parentPhoneNumber: string;
    governorate?: string;
    city?: string;
}

export interface CreateTeacherProfileRequest {
    UserId: string;
    SubjectId: number;
    PhoneNumber?: string;
    FacebookUrl?: string;
    TelegramUrl?: string;
    YouTubeChannelUrl?: string;
    WhatsAppNumber?: string;
    Governorate?: string;
    City?: string;
    PhotoFile?: File;
    EducationStageIds: number[];
}

// Generate or retrieve a unique device ID
const getDeviceId = (): string => {
    if (typeof window === "undefined") return "server";

    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
        // Generate a unique device ID using crypto API or fallback
        deviceId = crypto?.randomUUID?.() || `device-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem("deviceId", deviceId);
    }
    return deviceId;
};

// Get a readable device name from user agent
const getDeviceName = (): string => {
    if (typeof window === "undefined") return "Server";

    const ua = navigator.userAgent;

    // Detect OS
    let os = "Unknown OS";
    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Mac")) os = "MacOS";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
    else if (ua.includes("Linux")) os = "Linux";

    // Detect Browser
    let browser = "Unknown Browser";
    if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
    else if (ua.includes("Edg")) browser = "Edge";
    else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";

    return `${browser} on ${os}`;
};

export const AuthService = {
    login: async (data: LoginFormValues): Promise<LoginResponse> => {
        const loginPayload: LoginRequest = {
            email: data.email,
            password: data.password,
            deviceId: getDeviceId(),
            deviceName: getDeviceName(),
        };

        const response = await apiClient.post<LoginResponse>("/auth/signin", loginPayload);

        if (response.data.succeeded && response.data.data.token) {
            if (typeof window !== "undefined") {
                localStorage.setItem("token", response.data.data.token);
                localStorage.setItem("user", JSON.stringify(response.data.data));
                // حفظ الـ role للتحقق منه لاحقًا
                if (response.data.data.roles && response.data.data.roles.length > 0) {
                    localStorage.setItem("role", response.data.data.roles[0]);
                }
            }
        }

        return response.data;
    },

    register: async (data: any): Promise<LoginResponse> => {
        const formData = new FormData();

        // Map data to FormData
        Object.keys(data).forEach(key => {
            if (data[key] === undefined || data[key] === null || data[key] === "") return;

            // Special handling for file
            if (key === 'photoFile' && data[key] instanceof FileList) {
                if (data[key].length > 0) {
                    formData.append('PhotoFile', data[key][0]);
                }
            } else if (key === 'educationStageIds' && Array.isArray(data[key])) {
                data[key].forEach((id: number) => {
                    formData.append('EducationStageIds', id.toString());
                });
            } else {
                // Determine the correct field name for the API
                let apiField = key.charAt(0).toUpperCase() + key.slice(1);

                // Specific role-based mapping corrections
                if (key === 'parentPhoneNumber') apiField = 'ParentPhoneNumber';
                if (key === 'parentPhoneNumberOfParent') apiField = 'ParentPhoneNumberOfParent';
                if (key === 'whatsAppNumber') apiField = 'WhatsAppNumber';
                if (key === 'facebookUrl') apiField = 'FacebookUrl';
                if (key === 'telegramUrl') apiField = 'TelegramUrl';

                formData.append(apiField, data[key].toString());
            }
        });

        const response = await apiClient.post<LoginResponse>("/auth/signup", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });

        if (response.data.succeeded && response.data.data.token) {
            if (typeof window !== "undefined") {
                localStorage.setItem("token", response.data.data.token);
                localStorage.setItem("user", JSON.stringify(response.data.data));
            }
        }

        return response.data;
    },

    getRoles: async (): Promise<ApiResponse<string[]>> => {
        // This endpoint is at the root of the server
        const response = await axios.get<ApiResponse<string[]>>(`${env.API.SERVER_URL}/GetRoles`);
        return response.data;
    },

    getEducationStages: async (): Promise<ApiResponse<EducationStage[]>> => {
        const response = await apiClient.get<ApiResponse<EducationStage[]>>("/education-stages");
        return response.data;
    },

    getSubjects: async (): Promise<ApiResponse<Subject[]>> => {
        const response = await apiClient.get<ApiResponse<Subject[]>>("/subjects");
        return response.data;
    },

    editProfile: async (data: EditProfileRequest): Promise<ApiResponse<any>> => {
        const formData = new FormData();

        formData.append('UserId', data.userId);
        if (data.firstName) formData.append('FirstName', data.firstName);
        if (data.lastName) formData.append('LastName', data.lastName);
        if (data.phoneNumber) formData.append('PhoneNumber', data.phoneNumber);
        if (data.facebookUrl) formData.append('FacebookUrl', data.facebookUrl);
        if (data.telegramUrl) formData.append('TelegramUrl', data.telegramUrl);
        if (data.youTubeChannelUrl) formData.append('YouTubeChannelUrl', data.youTubeChannelUrl);
        if (data.whatsAppNumber) formData.append('WhatsAppNumber', data.whatsAppNumber);
        if (data.photoFile) formData.append('PhotoFile', data.photoFile);

        const response = await axios.put<ApiResponse<any>>(
            `${env.API.SERVER_URL}/EditUserProfile`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        // Update local storage with new user data if successful
        if (response.data.succeeded && typeof window !== "undefined") {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                const user = JSON.parse(userStr);
                if (data.firstName) user.firstName = data.firstName;
                if (data.lastName) user.lastName = data.lastName;
                if (data.phoneNumber) user.phoneNumber = data.phoneNumber;
                if (response.data.data?.photoUrl) user.photoUrl = response.data.data.photoUrl;
                localStorage.setItem("user", JSON.stringify(user));
            }
        }

        return response.data;
    },

    logoutAllDevices: async (userId: string, token: string): Promise<ApiResponse<any>> => {
        // Using the dedicated logout endpoint (separate from main API)
        const LOGOUT_URL = "https://bosla-education.com/api/logout-all-devices";

        const response = await axios.post<ApiResponse<any>>(
            LOGOUT_URL,
            { userId },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    },

    logout: async () => {
        if (typeof window !== "undefined") {
            try {
                // Get user data and token
                const userStr = localStorage.getItem("user");
                const token = localStorage.getItem("token");

                if (userStr && token) {
                    const user = JSON.parse(userStr);
                    const userId = user.applicationUserId || user.id;

                    if (userId) {
                        // Logout from all devices
                        await AuthService.logoutAllDevices(userId, token);
                    }
                }
            } catch (error) {
                console.error("Error during logout:", error);
            }

            // Always clear local storage and redirect
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
    },

    // Google Sign-In
    signInWithGoogle: async (): Promise<LoginResponse> => {
        const GOOGLE_CLIENT_ID = "319206047716-hq6s7s6vob9iom2dcscslgv73s0hcfoq.apps.googleusercontent.com";
        const REDIRECT_URI = typeof window !== "undefined" ? `${window.location.origin}/auth/google/callback` : "";

        return new Promise((resolve, reject) => {
            // Create OAuth URL
            const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
            authUrl.searchParams.append("client_id", GOOGLE_CLIENT_ID);
            authUrl.searchParams.append("redirect_uri", REDIRECT_URI);
            authUrl.searchParams.append("response_type", "id_token");
            authUrl.searchParams.append("scope", "openid email profile");
            authUrl.searchParams.append("prompt", "select_account");
            authUrl.searchParams.append("nonce", crypto.randomUUID());

            // Open popup
            const width = 500;
            const height = 600;
            const left = window.screenX + (window.outerWidth - width) / 2;
            const top = window.screenY + (window.outerHeight - height) / 2;

            const popup = window.open(
                authUrl.toString(),
                "Google Sign In",
                `width=${width},height=${height},left=${left},top=${top}`
            );

            if (!popup) {
                reject(new Error("تعذر فتح نافذة تسجيل الدخول"));
                return;
            }

            let popupClosed = false;

            // Listen for callback
            const checkPopup = setInterval(async () => {
                // Check if popup is closed - wrapped in try-catch to handle COOP
                try {
                    popupClosed = popup.closed;
                } catch {
                    // If we can't access popup.closed, assume it's still open
                    // This can happen due to Cross-Origin-Opener-Policy
                }

                if (popupClosed) {
                    clearInterval(checkPopup);
                    reject(new Error("تم إغلاق نافذة تسجيل الدخول"));
                    return;
                }

                // Try to check if we're on the callback URL
                try {
                    const popupUrl = popup.location.href;

                    // Check if we're on the callback URL
                    if (popupUrl && popupUrl.includes(REDIRECT_URI)) {
                        clearInterval(checkPopup);

                        // Extract id_token from URL hash
                        const hash = popup.location.hash.substring(1);
                        const params = new URLSearchParams(hash);
                        const idToken = params.get("id_token");

                        try {
                            popup.close();
                        } catch {
                            // Ignore close errors
                        }

                        if (!idToken) {
                            reject(new Error("لم يتم الحصول على رمز المصادقة"));
                            return;
                        }

                        // Get or generate FCM token (for web, use device ID)
                        const fcmToken = localStorage.getItem("fcmToken") || `web-${getDeviceId()}`;
                        localStorage.setItem("fcmToken", fcmToken);

                        // Send tokens to backend
                        try {
                            const response = await apiClient.get<LoginResponse>(
                                `/google/signin?IdToken=${encodeURIComponent(idToken)}&FCMtoken=${encodeURIComponent(fcmToken)}`
                            );

                            if (response.data.succeeded && response.data.data.token) {
                                localStorage.setItem("token", response.data.data.token);
                                localStorage.setItem("user", JSON.stringify(response.data.data));
                                if (response.data.data.roles && response.data.data.roles.length > 0) {
                                    localStorage.setItem("role", response.data.data.roles[0]);
                                }
                            }

                            resolve(response.data);
                        } catch (error: any) {
                            reject(error);
                        }
                    }
                } catch {
                    // Cross-origin error - popup not on our domain yet, this is expected
                    // Silently continue checking
                }
            }, 500);

            // Timeout after 5 minutes
            setTimeout(() => {
                clearInterval(checkPopup);
                try {
                    if (!popup.closed) {
                        popup.close();
                    }
                } catch {
                    // Ignore any errors when closing
                }
                reject(new Error("انتهت مهلة تسجيل الدخول"));
            }, 300000);
        });
    },

    // Get Google Sign-In URL (alternative method - redirect)
    getGoogleSignInUrl: (): string => {
        const GOOGLE_CLIENT_ID = "319206047716-hq6s7s6vob9iom2dcscslgv73s0hcfoq.apps.googleusercontent.com";
        const REDIRECT_URI = typeof window !== "undefined" ? `${window.location.origin}/auth/google/callback` : "";

        const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
        authUrl.searchParams.append("client_id", GOOGLE_CLIENT_ID);
        authUrl.searchParams.append("redirect_uri", REDIRECT_URI);
        authUrl.searchParams.append("response_type", "id_token");
        authUrl.searchParams.append("scope", "openid email profile");
        authUrl.searchParams.append("prompt", "select_account");
        authUrl.searchParams.append("nonce", crypto.randomUUID());

        return authUrl.toString();
    },

    // Update user role after Google Sign-In
    updateUserRole: async (data: UpdateUserRoleRequest): Promise<ApiResponse<any>> => {
        const response = await apiClient.put<ApiResponse<any>>("/users/role", data);

        // Update local storage with new role
        if (response.data.succeeded && typeof window !== "undefined") {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                const user = JSON.parse(userStr);
                user.roles = [data.newRole];
                localStorage.setItem("user", JSON.stringify(user));
                localStorage.setItem("role", data.newRole);
            }
        }

        return response.data;
    },

    // Create student profile after Google Sign-In
    createStudentProfile: async (data: CreateStudentProfileRequest): Promise<ApiResponse<any>> => {
        const response = await apiClient.post<ApiResponse<any>>("/students/create-profile", data);

        // Save studentId to localStorage if successful
        if (response.data.succeeded && response.data.data && typeof window !== "undefined") {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                const user = JSON.parse(userStr);
                if (response.data.data.studentId || response.data.data.id) {
                    user.studentId = response.data.data.studentId || response.data.data.id;
                    localStorage.setItem("user", JSON.stringify(user));
                }
            }
        }

        return response.data;
    },

    // Create teacher profile after Google Sign-In
    createTeacherProfile: async (data: CreateTeacherProfileRequest): Promise<ApiResponse<any>> => {
        const formData = new FormData();

        formData.append("UserId", data.UserId);
        formData.append("SubjectId", data.SubjectId.toString());

        if (data.PhoneNumber) formData.append("PhoneNumber", data.PhoneNumber);
        if (data.FacebookUrl) formData.append("FacebookUrl", data.FacebookUrl);
        if (data.TelegramUrl) formData.append("TelegramUrl", data.TelegramUrl);
        if (data.YouTubeChannelUrl) formData.append("YouTubeChannelUrl", data.YouTubeChannelUrl);
        if (data.WhatsAppNumber) formData.append("WhatsAppNumber", data.WhatsAppNumber);
        if (data.Governorate) formData.append("Governorate", data.Governorate);
        if (data.City) formData.append("City", data.City);
        if (data.PhotoFile) formData.append("PhotoFile", data.PhotoFile);

        data.EducationStageIds.forEach(id => {
            formData.append("EducationStageIds", id.toString());
        });

        const response = await apiClient.post<ApiResponse<any>>("/teachers/create-profile", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });

        // Save teacherId to localStorage if successful
        if (response.data.succeeded && response.data.data && typeof window !== "undefined") {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                const user = JSON.parse(userStr);
                // Save the teacherId from response
                if (response.data.data.teacherId || response.data.data.id) {
                    user.teacherId = response.data.data.teacherId || response.data.data.id;
                    localStorage.setItem("user", JSON.stringify(user));
                }
            }
        }

        return response.data;
    },

    // Update existing teacher profile (for completing missing data)
    updateTeacherProfile: async (data: {
        TeacherId: number;
        PhoneNumber?: string;
        FacebookUrl?: string;
        TelegramUrl?: string;
        YouTubeChannelUrl?: string;
        WhatsAppNumber?: string;
        Governorate?: string;
        City?: string;
        PhotoFile?: File;
        EducationStageIds: number[];
    }): Promise<ApiResponse<any>> => {
        const formData = new FormData();

        formData.append("TeacherId", data.TeacherId.toString());

        if (data.PhoneNumber) formData.append("PhoneNumber", data.PhoneNumber);
        if (data.FacebookUrl) formData.append("FacebookUrl", data.FacebookUrl);
        if (data.TelegramUrl) formData.append("TelegramUrl", data.TelegramUrl);
        if (data.YouTubeChannelUrl) formData.append("YouTubeChannelUrl", data.YouTubeChannelUrl);
        if (data.WhatsAppNumber) formData.append("WhatsAppNumber", data.WhatsAppNumber);
        if (data.Governorate) formData.append("Governorate", data.Governorate);
        if (data.City) formData.append("City", data.City);
        if (data.PhotoFile) formData.append("PhotoFile", data.PhotoFile);

        // Add education stage IDs
        data.EducationStageIds.forEach(id => {
            formData.append("EducationStageIds", id.toString());
        });

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        const response = await axios.put<ApiResponse<any>>(
            `${env.API.FULL_URL}/teachers/profile`,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        return response.data;
    }
};
