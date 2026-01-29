import { apiClient } from "@/services/api-client";
import { env } from "@/config/env";
import axios from "axios";
import {
    ApiResponse,
    AllUsersData,
    StatisticsData,
    Student,
    Teacher,
    Parent,
    UpdateAppInfoRequest
} from "../types/admin.types";

export class AdminService {
    // Get all users (students, teachers, parents)
    static async getAllUsers(): Promise<ApiResponse<AllUsersData>> {
        console.log('=== Fetching All Users ===');
        const response = await apiClient.get<ApiResponse<AllUsersData>>("/Admin/users");
        console.log('=== All Users Response ===', response.data);
        console.log('Students:', response.data?.data?.students);
        console.log('Teachers:', response.data?.data?.teachers);
        console.log('Parents:', response.data?.data?.parents);
        return response.data;
    }

    // Get all students
    static async getStudents(): Promise<ApiResponse<Student[]>> {
        const response = await apiClient.get<ApiResponse<Student[]>>("/Admin/users/students");
        return response.data;
    }

    // Get all teachers
    static async getTeachers(): Promise<ApiResponse<Teacher[]>> {
        const response = await apiClient.get<ApiResponse<Teacher[]>>("/Admin/users/teachers");
        return response.data;
    }

    // Get all parents
    static async getParents(): Promise<ApiResponse<Parent[]>> {
        const response = await apiClient.get<ApiResponse<Parent[]>>("/Admin/users/parents");
        return response.data;
    }

    // Get statistics
    static async getStatistics(): Promise<ApiResponse<StatisticsData>> {
        const response = await apiClient.get<ApiResponse<StatisticsData>>("/Admin/statistics");
        return response.data;
    }

    // Toggle block/unblock teacher
    static async toggleBlockTeacher(teacherUserId: string): Promise<ApiResponse<any>> {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const response = await axios.post<ApiResponse<any>>(
            `${env.API.SERVER_URL}/ToggleBlockUser`,
            { teacherUserId },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    }

    // Toggle block/unblock student (API uses teacherUserId for all users)
    static async toggleBlockStudent(studentUserId: string): Promise<ApiResponse<any>> {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const response = await axios.post<ApiResponse<any>>(
            `${env.API.SERVER_URL}/ToggleBlockUser`,
            { teacherUserId: studentUserId },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    }

    // Logout user from all devices
    static async logoutUser(userId: string): Promise<ApiResponse<any>> {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const response = await axios.post<ApiResponse<any>>(
            `${env.API.SERVER_URL}/logout-all-devices`,
            { userId },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    }

    // Update Application Info
    static async updateAppInfo(data: UpdateAppInfoRequest): Promise<ApiResponse<string>> {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        const formData = new FormData();

        if (data.AboutUs !== undefined && data.AboutUs !== '') {
            formData.append('AboutUs', data.AboutUs);
        }
        if (data.SupportPhoneNumber !== undefined && data.SupportPhoneNumber !== '') {
            formData.append('SupportPhoneNumber', data.SupportPhoneNumber);
        }
        if (data.ApplicationUrl !== undefined && data.ApplicationUrl !== '') {
            formData.append('ApplicationUrl', data.ApplicationUrl);
        }
        if (data.GoogleIconEnabled !== undefined) {
            formData.append('GoogleIconEnabled', String(data.GoogleIconEnabled));
        }
        if (data.Version !== undefined && data.Version !== '') {
            formData.append('Version', data.Version);
        }
        if (data.ExplanationVideoFile) {
            formData.append('ExplanationVideoFile', data.ExplanationVideoFile);
        }

        console.log('=== Updating App Info ===');
        console.log('Token:', token ? 'Present' : 'Missing');
        console.log('FormData entries:');
        for (const [key, value] of formData.entries()) {
            console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
        }

        try {
            const response = await axios.put<ApiResponse<string>>(
                `${env.API.FULL_URL}/settings/app-info`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            console.log('=== App Info Update Success ===', response.data);
            return response.data;
        } catch (error: any) {
            console.error('=== App Info Update Error ===');
            console.error('Status:', error?.response?.status);
            console.error('Data:', error?.response?.data);
            console.error('Message:', error?.message);
            throw error;
        }
    }
}

