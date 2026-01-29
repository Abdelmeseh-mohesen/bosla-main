"use client";

import React from "react";
import {
    Users,
    GraduationCap,
    UserCheck,
    BookOpen,
    FileText,
    TrendingUp,
    TrendingDown,
    Minus
} from "lucide-react";

interface StatCardProps {
    label: string;
    value: number;
    changeMessage: string;
    icon: "users" | "students" | "teachers" | "parents" | "courses" | "exams";
    color: "red" | "blue" | "green" | "purple" | "orange" | "cyan";
    delay?: number;
}

const iconMap = {
    users: Users,
    students: GraduationCap,
    teachers: UserCheck,
    parents: Users,
    courses: BookOpen,
    exams: FileText,
};

const colorConfig = {
    red: {
        bg: "from-rose-500/20 to-rose-600/5",
        border: "border-rose-500/20 hover:border-rose-500/40",
        icon: "bg-gradient-to-br from-rose-500 to-rose-600",
        text: "text-rose-400",
        glow: "shadow-rose-500/20",
        number: "from-rose-400 to-rose-600",
    },
    blue: {
        bg: "from-blue-500/20 to-blue-600/5",
        border: "border-blue-500/20 hover:border-blue-500/40",
        icon: "bg-gradient-to-br from-blue-500 to-blue-600",
        text: "text-blue-400",
        glow: "shadow-blue-500/20",
        number: "from-blue-400 to-blue-600",
    },
    green: {
        bg: "from-emerald-500/20 to-emerald-600/5",
        border: "border-emerald-500/20 hover:border-emerald-500/40",
        icon: "bg-gradient-to-br from-emerald-500 to-emerald-600",
        text: "text-emerald-400",
        glow: "shadow-emerald-500/20",
        number: "from-emerald-400 to-emerald-600",
    },
    purple: {
        bg: "from-violet-500/20 to-violet-600/5",
        border: "border-violet-500/20 hover:border-violet-500/40",
        icon: "bg-gradient-to-br from-violet-500 to-violet-600",
        text: "text-violet-400",
        glow: "shadow-violet-500/20",
        number: "from-violet-400 to-violet-600",
    },
    orange: {
        bg: "from-orange-500/20 to-orange-600/5",
        border: "border-orange-500/20 hover:border-orange-500/40",
        icon: "bg-gradient-to-br from-orange-500 to-orange-600",
        text: "text-orange-400",
        glow: "shadow-orange-500/20",
        number: "from-orange-400 to-orange-600",
    },
    cyan: {
        bg: "from-cyan-500/20 to-cyan-600/5",
        border: "border-cyan-500/20 hover:border-cyan-500/40",
        icon: "bg-gradient-to-br from-cyan-500 to-cyan-600",
        text: "text-cyan-400",
        glow: "shadow-cyan-500/20",
        number: "from-cyan-400 to-cyan-600",
    },
};

// Parse change message to determine trend
const parseChangeMessage = (message: string) => {
    if (!message) return { trend: "neutral", value: "0%" };

    const isPositive = message.includes("+") || message.includes("زيادة") || message.includes("ارتفاع");
    const isNegative = message.includes("-") || message.includes("انخفاض") || message.includes("نقص");

    return {
        trend: isPositive ? "up" : isNegative ? "down" : "neutral",
        value: message
    };
};

export function StatCard({ label, value, changeMessage, icon, color, delay = 0 }: StatCardProps) {
    const IconComponent = iconMap[icon];
    const colors = colorConfig[color];
    const change = parseChangeMessage(changeMessage);

    return (
        <div
            className={`
                relative group overflow-hidden
                p-6 rounded-3xl
                bg-gradient-to-br ${colors.bg}
                border ${colors.border}
                backdrop-blur-xl
                transition-all duration-500 ease-out
                hover:scale-[1.02] hover:-translate-y-1
                hover:shadow-2xl ${colors.glow}
                animate-in fade-in slide-in-from-bottom-4
            `}
            style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
        >
            {/* Background Glow */}
            <div className={`
                absolute -top-20 -right-20 w-40 h-40 
                bg-gradient-to-br ${colors.number} 
                rounded-full blur-[80px] opacity-30
                group-hover:opacity-50 transition-opacity duration-500
            `} />

            {/* Decorative Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-full h-full"
                    style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                        backgroundSize: '20px 20px'
                    }}
                />
            </div>

            <div className="relative z-10 flex items-start justify-between">
                <div className="space-y-4">
                    {/* Label */}
                    <p className="text-gray-400 font-medium text-sm tracking-wide">
                        {label}
                    </p>

                    {/* Value */}
                    <div className="flex items-baseline gap-2">
                        <h3 className={`
                            text-5xl font-black 
                            bg-gradient-to-r ${colors.number} 
                            bg-clip-text text-transparent
                            tabular-nums
                        `}>
                            {value.toLocaleString("ar-EG")}
                        </h3>
                    </div>

                    {/* Change Message */}
                    {changeMessage && (
                        <div className={`
                            flex items-center gap-1.5 
                            text-sm font-bold
                            ${change.trend === "up" ? "text-emerald-400" :
                                change.trend === "down" ? "text-rose-400" : "text-gray-500"}
                        `}>
                            {change.trend === "up" && <TrendingUp size={16} />}
                            {change.trend === "down" && <TrendingDown size={16} />}
                            {change.trend === "neutral" && <Minus size={16} />}
                            <span>{change.value}</span>
                        </div>
                    )}
                </div>

                {/* Icon Container */}
                <div className={`
                    w-16 h-16 rounded-2xl 
                    ${colors.icon}
                    flex items-center justify-center
                    shadow-lg ${colors.glow}
                    group-hover:scale-110 group-hover:rotate-3
                    transition-all duration-500
                `}>
                    <IconComponent size={28} className="text-white" />
                </div>
            </div>

            {/* Bottom Accent Line */}
            <div className={`
                absolute bottom-0 left-0 right-0 h-1
                bg-gradient-to-r ${colors.number}
                opacity-0 group-hover:opacity-100
                transition-opacity duration-500
            `} />
        </div>
    );
}
