"use client";

import React from "react";
import { Subject } from "../types/student.types";
import { BookOpen, ArrowRight, Star } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface SubjectCardProps {
    subject: Subject;
    onClick?: (id: number) => void;
}

export function SubjectCard({ subject, onClick }: SubjectCardProps) {
    return (
        <div
            onClick={() => onClick?.(subject.id)}
            className="group relative w-full h-[280px] cursor-pointer overflow-hidden rounded-[2rem] border border-white/5 bg-[#0d1117] transition-all duration-500 hover:border-brand-red/30 hover:shadow-[0_15px_30px_rgba(235,53,60,0.15)]"
        >
            {/* Background Image - Cinematic Cover */}
            <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                <img
                    src={subject.subjectImageUrl}
                    alt={subject.name}
                    className="h-full w-full object-cover origin-center transition-transform duration-500"
                />

                {/* Advanced Gradient Overlay:
                    - Left side dark: For text readability
                    - Bottom fade: For framing
                    - Image stays bright on top/right
                */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#050709]/95 via-[#050709]/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050709] via-transparent to-transparent opacity-60" />
            </div>

            {/* Content Container - Left Aligned for readability on wide card */}
            <div className="absolute inset-0 flex flex-col justify-center p-8 text-right z-10">
                <div className="relative z-20 flex flex-col h-full justify-between">

                    {/* Top Badge */}
                    <div className="flex justify-end">
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 flex items-center gap-1.5 opacity-0 -translate-y-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 text-white">
                            <Star size={12} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-[10px] font-bold">محتوى مميز</span>
                        </div>
                    </div>

                    {/* Main Info */}
                    <div className="space-y-3 transform transition-transform duration-500 group-hover:-translate-x-2">
                        <div className="flex items-center justify-end gap-4">
                            <h3 className="text-4xl font-black text-white leading-tight drop-shadow-lg">
                                {subject.name}
                            </h3>
                            <div className="w-1.5 h-12 bg-brand-red rounded-full shadow-[0_0_15px_rgba(235,53,60,0.5)]" />
                        </div>

                        <p className="text-gray-300 font-medium text-sm max-w-[80%] mr-auto pl-4 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                            رحلة تعليمية متكاملة تبدأ من هنا
                        </p>
                    </div>

                    {/* Bottom Action */}
                    <div className="flex items-center justify-between pt-4 opacity-70 transition-all duration-500 group-hover:opacity-100">
                        <div className="flex items-center gap-2 text-brand-red font-bold text-sm">
                            <ArrowRight size={18} className="transition-transform group-hover:-translate-x-1" />
                            <span>ابدأ التعلم الآن</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
