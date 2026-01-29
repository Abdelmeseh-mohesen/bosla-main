import { z } from "zod";

const envSchema = z.object({
    NEXT_PUBLIC_API_URL: z.string().url().default("https://bosla-education.com/api/api"),
    NEXT_PUBLIC_API_VERSION: z.string().default("v1"),
});

const _env = envSchema.parse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_API_VERSION: process.env.NEXT_PUBLIC_API_VERSION,
});

// Extract server URL (without /api)
const serverUrl = _env.NEXT_PUBLIC_API_URL.replace("/api", "");

export const env = {
    API: {
        // Base server URL (without /api) - use for endpoints outside /api/v1
        // e.g., http://edu-platform.runasp.net
        SERVER_URL: serverUrl,

        // API base URL (with /api) - use for standard API calls
        // e.g., http://edu-platform.runasp.net/api
        BASE_URL: _env.NEXT_PUBLIC_API_URL,

        // API version
        VERSION: _env.NEXT_PUBLIC_API_VERSION,

        // Full API URL (BASE_URL + VERSION)
        // e.g., http://edu-platform.runasp.net/api/v1
        FULL_URL: `${_env.NEXT_PUBLIC_API_URL}/${_env.NEXT_PUBLIC_API_VERSION}`,
    },
};

// Helper function to build full URL from relative path
export const buildUrl = (path: string): string => {
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${serverUrl}${cleanPath}`;
};

// Helper function to build API URL from relative path
export const buildApiUrl = (path: string): string => {
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${_env.NEXT_PUBLIC_API_URL}/${_env.NEXT_PUBLIC_API_VERSION}${cleanPath}`;
};
