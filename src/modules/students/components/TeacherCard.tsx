"use client";

import React from "react";
import { Teacher } from "../types/student.types";
import { User, GraduationCap, ArrowRight, Facebook, Send, MessageCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { env } from "@/config/env";

interface TeacherCardProps {
    teacher: Teacher;
    onClick?: (id: number) => void;
}

export function TeacherCard({ teacher, onClick }: TeacherCardProps) {
    return (
        <div
            onClick={() => onClick?.(teacher.id)}
            className="group relative flex flex-col items-center p-8 rounded-[3rem] border border-white/5 bg-[#0d1117] transition-all duration-500 hover:border-brand-red/30 hover:shadow-[0_20px_50px_rgba(235,53,60,0.1)] cursor-pointer"
        >
            {/* Avatar Section */}
            <div className="relative mb-6">
                <div className="h-32 w-32 rounded-3xl overflow-hidden border-2 border-white/5 bg-white/5 group-hover:border-brand-red/50 transition-all duration-500 transform group-hover:scale-110 shadow-2xl">
                    {teacher.photoUrl ? (
                        <img
                            src={teacher.photoUrl.startsWith('http') ? teacher.photoUrl : `${env.API.SERVER_URL}${teacher.photoUrl}`}
                            alt={teacher.teacherName}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-brand-red/10 text-brand-red">
                            <User size={48} />
                        </div>
                    )}
                </div>
                {/* Status Dot */}
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-4 border-[#0d1117] animate-pulse" />
            </div>

            {/* Teacher Info */}
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-white group-hover:text-brand-red transition-colors">
                    أ/ {teacher.teacherName}
                </h3>
                <p className="text-brand-red font-bold text-sm tracking-widest uppercase">
                    خبير {teacher.subjectName}
                </p>

                {/* Stages Tags */}
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {teacher.teacherEducationStages.slice(0, 2).map((stage) => (
                        <span key={stage.id} className="text-[10px] font-black px-3 py-1 bg-white/5 border border-white/10 rounded-full text-gray-400">
                            {stage.educationStageName}
                        </span>
                    ))}
                    {teacher.teacherEducationStages.length > 2 && (
                        <span className="text-[10px] font-black px-3 py-1 bg-white/5 border border-white/10 rounded-full text-gray-400">
                            +{teacher.teacherEducationStages.length - 2}
                        </span>
                    )}
                </div>
            </div>

            {/* Social Links (Static for now if empty) */}
            <div className="flex gap-4 mt-8 opacity-40 group-hover:opacity-100 transition-opacity">
                {teacher.facebookUrl && <Facebook size={18} className="text-blue-500 hover:scale-125 transition-transform" />}
                {teacher.telegramUrl && <Send size={18} className="text-sky-500 hover:scale-125 transition-transform" />}
                {teacher.whatsAppNumber && <MessageCircle size={18} className="text-green-500 hover:scale-125 transition-transform" />}
            </div>

            {/* Stats / CTA */}
            <div className="w-full mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-500">عدد الكورسات</p>
                    <p className="text-lg font-black text-white">{teacher.courses?.length || 0}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red group-hover:bg-brand-red group-hover:text-white transition-all transform group-hover:translate-x-2">
                    <ArrowRight size={20} />
                </div>
            </div>

            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-red/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem] pointer-events-none" />
        </div>
    );
}
