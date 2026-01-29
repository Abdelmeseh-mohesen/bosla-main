import axios from "axios";
import { ApiResponse, Student, ExamScore } from "../types/parent.types";
import { env } from "@/config/env";

const BASE_URL = env.API.SERVER_URL;

export const ParentService = {
    /**
     * Get all students linked to a parent
     * @param parentId - The parent's ID (from user data)
     */
    getMyStudents: async (parentId: number): Promise<ApiResponse<Student[]>> => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        const response = await axios.get<ApiResponse<Student[]>>(
            `${BASE_URL}/MyStudents/${parentId}`,
            {
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        return response.data;
    },

    /**
     * Get exam scores for a specific student in a specific course
     * @param studentId - The student's ID
     * @param courseId - The course's ID
     */
    getStudentExamScores: async (studentId: number, courseId: number): Promise<ApiResponse<ExamScore[]>> => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        const response = await axios.get<ApiResponse<ExamScore[]>>(
            `${BASE_URL}/students/${studentId}/courses/${courseId}/exam-scores`,
            {
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        return response.data;
    },

    /**
     * Get parent ID from stored user data
     */
    getParentId: (): number | null => {
        if (typeof window === 'undefined') return null;

        const userStr = localStorage.getItem('user');
        if (!userStr) return null;

        try {
            const user = JSON.parse(userStr);
            // Try different possible ID fields
            return user.parentId || user.id || user.applicationUserId || null;
        } catch {
            return null;
        }
    }
};
