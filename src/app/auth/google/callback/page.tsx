"use client";

import { useEffect } from "react";

export default function GoogleCallbackPage() {
    useEffect(() => {
        // This page handles the OAuth callback
        // The popup will be detected and closed by the parent window
        // This page just needs to exist to receive the redirect

        // If opened directly (not as popup), redirect to login
        if (!window.opener) {
            window.location.href = "/login";
        }
    }, []);

    return (
        <div className="min-h-screen bg-[#06080a] flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-brand-red border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-white font-bold text-lg">جاري تسجيل الدخول...</p>
            </div>
        </div>
    );
}
