"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Material } from "../types/teacher.types";
import { AlertCircle, XCircle } from "lucide-react";
import { VideoPlayer } from "./VideoPlayer";

interface ContentViewerProps {
    material: Material;
}

export function ContentViewer({ material }: ContentViewerProps) {
    useEffect(() => {
        // Disable right click
        const handleContextMenu = (e: MouseEvent) => e.preventDefault();

        // Alert on print screen (approximate detection)
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === "PrintScreen") {
                alert("تصوير الشاشة غير مسموح به لحماية المحتوى");
                navigator.clipboard.writeText("");
            }
        };

        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("keyup", handleKeyUp);

        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    if (material.type?.toLowerCase() === "video") {
        const videoUrl = material.videoUrl || material.fileUrl || "";

        return (
            <div className="space-y-4">
                <VideoPlayer url={videoUrl} />
            </div>
        );
    }

    const isImage = material.fileUrl?.match(/\.(jpeg|jpg|gif|png|webp|avif)$/i);

    return (
        <div className="space-y-4">
            <div className="text-center mb-4">
                <h3 className="text-2xl font-black text-white">{material.title}</h3>
                {material.description && <p className="text-gray-400 mt-1">{material.description}</p>}
            </div>

            <div className="relative min-h-[400px] h-fit max-h-[70vh] rounded-2xl overflow-hidden bg-[#1a1c22] border border-white/10 flex items-center justify-center">
                {/* Content Rendering */}
                {material.fileUrl ? (
                    isImage ? (
                        <img
                            src={material.fileUrl}
                            alt={material.title}
                            className="max-w-full max-h-full object-contain"
                        />
                    ) : (
                        <iframe
                            src={`${material.fileUrl}#toolbar=0`}
                            className="w-full h-[600px]"
                        />
                    )
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                        <FileText size={64} />
                        <p className="text-xl font-bold">المحتوى غير متوفر حالياً</p>
                    </div>
                )}
            </div>

            <div className="text-center font-bold text-gray-500 text-sm">
                {material.type?.toLowerCase() === "homework" ? "قم بحل الواجب وإرساله للمدرس" : "تم عرض هذا الملف للاطلاع فقط، التحميل غير متاح حالياً"}
            </div>
        </div>
    );
}



function FileText({ size }: { size: number }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>;
}
