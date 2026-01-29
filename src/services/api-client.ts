import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
import { env } from "@/config/env";

// Define standard API error structure if known, otherwise generic.
export interface ApiError {
    message: string;
    code?: string;
    errors?: Record<string, string[]>;
}

class ApiClient {
    private static instance: ApiClient;
    private api: AxiosInstance;

    private constructor() {
        this.api = axios.create({
            baseURL: `${env.API.BASE_URL}/${env.API.VERSION}`,
            headers: {
                "Content-Type": "application/json",
            },
            timeout: 30000,
        });

        this.setupInterceptors();
    }

    public static getInstance(): ApiClient {
        if (!ApiClient.instance) {
            ApiClient.instance = new ApiClient();
        }
        return ApiClient.instance;
    }

    public getAxiosInstance(): AxiosInstance {
        return this.api;
    }

    private setupInterceptors() {
        // Request Interceptor
        this.api.interceptors.request.use(
            (config) => {
                // TODO: Get token from storage (cookie/localStorage) and attach
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response Interceptor
        this.api.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                // Handle global error types (401, 403, 500)
                if (error.response?.status === 401) {
                    // Handle unauthorized (redirect logic or refresh token)
                    console.warn("Unauthorized access");
                }
                return Promise.reject(error);
            }
        );
    }
}

export const apiClient = ApiClient.getInstance().getAxiosInstance();
