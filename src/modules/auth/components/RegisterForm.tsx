"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, RegisterFormValues } from "../types/auth.schemas";
import { AuthService } from "../services/auth.service";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import Link from "next/link";
import Image from "next/image";
import {
    Mail, Lock, Users, UserPlus, Phone, BookOpen,
    GraduationCap, ChevronDown, MessageCircle, Facebook, Send, Camera, MapPin, Building2, Check
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { env } from "@/config/env";

// Custom Dropdown Component for Governorate
interface CustomDropdownProps {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder: string;
    icon?: React.ReactNode;
}

function CustomDropdown({ value, onChange, options, placeholder, icon }: CustomDropdownProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className="relative">
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full h-10 px-9 rounded-lg text-right text-sm bg-[#12121a] border text-white/80 transition-all duration-200",
                    "flex items-center justify-between",
                    isOpen ? "border-red-500/50 ring-2 ring-red-500/20" : "border-white/5 hover:border-white/10"
                )}
            >
                <span className={value ? "text-white/80" : "text-gray-500"}>
                    {value || placeholder}
                </span>
            </button>

            {/* Icon */}
            {icon && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                    {icon}
                </div>
            )}

            {/* Chevron */}
            <ChevronDown
                size={14}
                className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none transition-transform duration-200",
                    isOpen && "rotate-180"
                )}
            />

            {/* Dropdown Menu - Always opens downward */}
            {isOpen && (
                <div
                    className={cn(
                        "absolute top-full left-0 right-0 mt-1 z-50",
                        "bg-[#12121a]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl",
                        "max-h-48 overflow-y-auto custom-scrollbar",
                        "animate-in fade-in-0 slide-in-from-top-2 duration-200"
                    )}
                >
                    {options.length === 0 ? (
                        <div className="px-3 py-2 text-center text-gray-500 text-xs">
                            جاري التحميل...
                        </div>
                    ) : (
                        options.map((option, index) => (
                            <button
                                key={`option-${index}`}
                                type="button"
                                onClick={() => {
                                    onChange(option);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full px-3 py-2.5 text-right text-sm transition-all duration-150",
                                    "flex items-center justify-between gap-2",
                                    "hover:bg-red-500/10",
                                    value === option
                                        ? "bg-red-500/20 text-red-400"
                                        : "text-gray-300 hover:text-white",
                                    index === 0 && "rounded-t-lg",
                                    index === options.length - 1 && "rounded-b-lg"
                                )}
                            >
                                <span>{option}</span>
                                {value === option && (
                                    <Check size={14} className="text-red-400" />
                                )}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

// Custom Select Dropdown for ID-based options (Education Stages)
interface SelectOption {
    id: number;
    name: string;
}

interface CustomSelectDropdownProps {
    value: number | string;
    onChange: (value: number) => void;
    options: SelectOption[];
    placeholder: string;
    icon?: React.ReactNode;
}

function CustomSelectDropdown({ value, onChange, options, placeholder, icon }: CustomSelectDropdownProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.id === Number(value));

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full h-10 px-9 rounded-lg text-right text-sm bg-[#12121a] border text-white/80 transition-all duration-200",
                    "flex items-center justify-between",
                    isOpen ? "border-red-500/50 ring-2 ring-red-500/20" : "border-white/5 hover:border-white/10"
                )}
            >
                <span className={selectedOption ? "text-white/80" : "text-gray-500"}>
                    {selectedOption?.name || placeholder}
                </span>
            </button>

            {icon && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                    {icon}
                </div>
            )}

            <ChevronDown
                size={14}
                className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none transition-transform duration-200",
                    isOpen && "rotate-180"
                )}
            />

            {isOpen && (
                <div
                    className={cn(
                        "absolute top-full left-0 right-0 mt-1 z-50",
                        "bg-[#12121a]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl",
                        "max-h-48 overflow-y-auto custom-scrollbar",
                        "animate-in fade-in-0 slide-in-from-top-2 duration-200"
                    )}
                >
                    {options.length === 0 ? (
                        <div className="px-3 py-2 text-center text-gray-500 text-xs">
                            جاري التحميل...
                        </div>
                    ) : (
                        options.map((option, index) => (
                            <button
                                key={`select-${option.id}`}
                                type="button"
                                onClick={() => {
                                    onChange(option.id);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full px-3 py-2.5 text-right text-sm transition-all duration-150",
                                    "flex items-center justify-between gap-2",
                                    "hover:bg-red-500/10",
                                    Number(value) === option.id
                                        ? "bg-red-500/20 text-red-400"
                                        : "text-gray-300 hover:text-white",
                                    index === 0 && "rounded-t-lg",
                                    index === options.length - 1 && "rounded-b-lg"
                                )}
                            >
                                <span>{option.name}</span>
                                {Number(value) === option.id && (
                                    <Check size={14} className="text-red-400" />
                                )}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export function RegisterForm() {
    const router = useRouter();
    const [mounted, setMounted] = React.useState(false);
    const [apiError, setApiError] = React.useState<string | null>(null);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const { data: rolesResponse } = useQuery({
        queryKey: ["roles"],
        queryFn: AuthService.getRoles,
        enabled: mounted,
    });

    const { data: stagesResponse } = useQuery({
        queryKey: ["educationStages"],
        queryFn: AuthService.getEducationStages,
        enabled: mounted,
    });

    const { data: subjectsResponse } = useQuery({
        queryKey: ["subjects"],
        queryFn: AuthService.getSubjects,
        enabled: mounted,
    });

    const { data: governoratesResponse } = useQuery({
        queryKey: ["governorates"],
        queryFn: async () => {
            const res = await fetch(`${env.API.SERVER_URL}/governorates`);
            return res.json();
        },
        enabled: mounted,
    });

    const roles = Array.isArray(rolesResponse?.data)
        ? rolesResponse.data.filter((r: any) => {
            const roleName = typeof r === 'string' ? r : r?.name || '';
            const role = roleName.toLowerCase();
            return role !== 'assistant' && role !== 'admin';
        })
        : [];
    const educationStages = Array.isArray(stagesResponse?.data) ? stagesResponse.data : [];
    const subjects = Array.isArray(subjectsResponse?.data) ? subjectsResponse.data : [];
    const governorates: string[] = Array.isArray(governoratesResponse?.data) ? governoratesResponse.data : [];

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(RegisterSchema) as any,
        defaultValues: {
            firstName: "", lastName: "", email: "", password: "",
            role: "", educationStageIds: [],
        },
    });

    const selectedRole = form.watch("role");

    const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

    const { isPending, mutate } = useMutation({
        mutationFn: AuthService.register,
        onSuccess: (response: any) => {
            if (response.succeeded) {
                // Check if account needs admin approval (disabled)
                if (response.meta?.includes?.('disabled') || !response.data?.token) {
                    setSuccessMessage("تم إنشاء حسابك بنجاح! ✅\nيرجى انتظار موافقة الإدارة لتفعيل حسابك.");
                    setApiError(null);
                } else {
                    const user = response.data;
                    if (user.roles?.includes("Teacher")) router.push("/dashboard/teacher");
                    else router.push("/dashboard");
                }
            } else {
                setApiError(response.message || "حدث خطأ ما في إنشاء الحساب");
            }
        },
        onError: (error: any) => {
            setApiError(error.response?.data?.message || "تعذر الاتصال بالسيرفر");
        }
    });

    const onSubmit = (data: RegisterFormValues) => {
        setApiError(null);
        mutate(data as any);
    };

    if (!mounted) return <div className="min-h-screen bg-[#0a0a0f]" />;

    return (
        <div className="min-h-screen w-full bg-[#0a0a0f] relative overflow-hidden flex items-center justify-center px-4 py-8">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-15%] right-[-5%] w-[450px] h-[450px] bg-red-500/10 rounded-full blur-[120px] animate-morph" />
                <div className="absolute bottom-[-15%] left-[-5%] w-[350px] h-[350px] bg-purple-500/8 rounded-full blur-[100px] animate-morph" style={{ animationDelay: '4s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[150px]" />

                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }} />

                {[...Array(10)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-red-500/30 rounded-full animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${8 + Math.random() * 8}s`,
                        }}
                    />
                ))}
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-[520px]">
                {/* Logo & Branding */}
                <div className="text-center mb-6 animate-slide-up">
                    <div className="inline-block relative mb-3">
                        <div className="absolute -inset-4 bg-red-500/30 rounded-full blur-xl animate-glow-pulse" />
                        <Image
                            src="/images/bousla-compass.png"
                            alt="بوصلة"
                            width={80}
                            height={80}
                            className="relative animate-spin-slow drop-shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                            priority
                        />
                    </div>
                    <h1 className="text-xl font-black text-white mb-1">إنشاء حساب جديد</h1>
                    <p className="text-gray-500 text-xs">انضم إلى منصة بوصلة التعليمية</p>
                </div>

                {/* Form Card */}
                <div className="animate-slide-up-delay-1">
                    <div className="relative">
                        <div className="absolute -inset-[1px] bg-gradient-to-r from-red-500/40 via-pink-500/20 to-red-500/40 rounded-2xl opacity-50 blur-sm" />

                        <form onSubmit={form.handleSubmit(onSubmit)} className="relative bg-[#0f0f15]/90 backdrop-blur-xl rounded-2xl p-5 md:p-6 border border-white/5 space-y-4">

                            {apiError && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-2.5 rounded-lg text-center text-xs font-bold animate-scale-in">
                                    {apiError}
                                </div>
                            )}

                            {successMessage && (
                                <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-lg text-center animate-scale-in">
                                    <div className="text-2xl mb-2">🎉</div>
                                    <div className="text-sm font-bold whitespace-pre-line">{successMessage}</div>
                                    <a href="/login" className="inline-block mt-3 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-xs font-bold transition-colors">
                                        الذهاب لتسجيل الدخول
                                    </a>
                                </div>
                            )}

                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="block text-right font-semibold text-gray-400 text-xs mr-1">الاسم الأول</label>
                                    <Input
                                        placeholder="أحمد"
                                        {...form.register("firstName")}
                                        className="h-10 rounded-lg text-sm bg-[#12121a] border-white/5"
                                    />
                                    {form.formState.errors.firstName && <span className="text-red-400 text-[10px]">{form.formState.errors.firstName.message}</span>}
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-right font-semibold text-gray-400 text-xs mr-1">الاسم الأخير</label>
                                    <Input
                                        placeholder="محمد"
                                        {...form.register("lastName")}
                                        className="h-10 rounded-lg text-sm bg-[#12121a] border-white/5"
                                    />
                                    {form.formState.errors.lastName && <span className="text-red-400 text-[10px]">{form.formState.errors.lastName.message}</span>}
                                </div>
                            </div>

                            {/* Email Field */}
                            <div className="space-y-1">
                                <label className="block text-right font-semibold text-gray-400 text-xs mr-1">البريد الإلكتروني</label>
                                <Input
                                    type="email"
                                    placeholder="name@example.com"
                                    icon={<Mail size={16} />}
                                    {...form.register("email")}
                                    className="h-10 rounded-lg text-sm bg-[#12121a] border-white/5 text-left dir-ltr pr-9"
                                />
                            </div>

                            {/* Password & Role */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="block text-right font-semibold text-gray-400 text-xs mr-1">كلمة المرور</label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        icon={<Lock size={16} />}
                                        {...form.register("password")}
                                        className="h-10 rounded-lg text-sm bg-[#12121a] border-white/5 text-left dir-ltr pr-9"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-right font-semibold text-gray-400 text-xs mr-1">أنا...</label>
                                    <div className="relative">
                                        <select
                                            {...form.register("role")}
                                            className="input-field w-full h-10 px-9 rounded-lg text-right appearance-none text-sm bg-[#12121a] border border-white/5 text-white/80"
                                        >
                                            <option value="">اختر دورك</option>
                                            {roles.map((r, i) => (
                                                <option key={`role-${i}`} value={typeof r === 'string' ? r : (r as any).name}>
                                                    {r === "Student" ? "طالب" : r === "Teacher" ? "مدرس" : r === "Parent" ? "ولي أمر" : typeof r === 'string' ? r : (r as any).name}
                                                </option>
                                            ))}
                                        </select>
                                        <Users size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                        <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Student Fields */}
                            {selectedRole === "Student" && (
                                <div className="space-y-3 animate-slide-up">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="block text-right font-semibold text-gray-400 text-xs mr-1">السنة الدراسية</label>
                                            <CustomSelectDropdown
                                                value={form.watch("gradeYear") || ""}
                                                onChange={(val) => form.setValue("gradeYear", val, { shouldValidate: true })}
                                                options={educationStages}
                                                placeholder="اختر السنة"
                                                icon={<GraduationCap size={16} />}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-right font-semibold text-gray-400 text-xs mr-1">رقم ولي الأمر</label>
                                            <Input
                                                placeholder="01xxxxxxxxx"
                                                icon={<Phone size={16} />}
                                                {...form.register("parentPhoneNumber")}
                                                className="h-10 rounded-lg text-sm bg-[#12121a] border-white/5 text-left dir-ltr pr-9"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="block text-right font-semibold text-gray-400 text-xs mr-1">المحافظة</label>
                                            <CustomDropdown
                                                value={form.watch("governorate") || ""}
                                                onChange={(val) => form.setValue("governorate", val, { shouldValidate: true })}
                                                options={governorates}
                                                placeholder="اختر المحافظة"
                                                icon={<MapPin size={16} />}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-right font-semibold text-gray-400 text-xs mr-1">المدينة</label>
                                            <Input
                                                placeholder="أدخل المدينة"
                                                icon={<Building2 size={16} />}
                                                {...form.register("city")}
                                                className="h-10 rounded-lg text-sm bg-[#12121a] border-white/5 pr-9"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Parent Fields */}
                            {selectedRole === "Parent" && (
                                <div className="animate-slide-up">
                                    <div className="space-y-1">
                                        <label className="block text-right font-semibold text-gray-400 text-xs mr-1">رقم الهاتف</label>
                                        <Input
                                            placeholder="01xxxxxxxxx"
                                            icon={<Phone size={16} />}
                                            {...form.register("parentPhoneNumberOfParent")}
                                            className="h-10 rounded-lg text-sm bg-[#12121a] border-white/5 text-left dir-ltr pr-9"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Teacher Fields */}
                            {selectedRole === "Teacher" && (
                                <div className="space-y-3 animate-slide-up">
                                    {/* Subject Selection */}
                                    <div className="space-y-1">
                                        <label className="block text-right font-semibold text-gray-400 text-xs mr-1">المادة الدراسية</label>
                                        <div className="relative">
                                            <select
                                                {...form.register("subjectId")}
                                                className="input-field w-full h-10 px-9 rounded-lg text-right appearance-none text-sm bg-[#12121a] border border-white/5 text-white/80"
                                            >
                                                <option value="">اختر المادة</option>
                                                {subjects.map((s) => (
                                                    <option key={`sub-${s.id}`} value={s.id}>{s.name}</option>
                                                ))}
                                            </select>
                                            <BookOpen size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                            <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Education Stages - Full Width */}
                                    <div className="space-y-1">
                                        <label className="block text-right font-semibold text-gray-400 text-xs mr-1">المراحل الدراسية (اختر مرحلة أو أكثر)</label>
                                        <div className="w-full bg-[#12121a] border border-white/5 rounded-lg p-3">
                                            <div className="flex flex-wrap gap-2 justify-end">
                                                {educationStages.map((stage) => {
                                                    const curr = (form.watch("educationStageIds") || []) as number[];
                                                    const sel = curr.includes(stage.id);
                                                    return (
                                                        <button
                                                            type="button"
                                                            key={`st-${stage.id}`}
                                                            onClick={() => {
                                                                const next = sel ? curr.filter(id => id !== stage.id) : [...curr, stage.id];
                                                                form.setValue("educationStageIds", next, { shouldValidate: true });
                                                            }}
                                                            className={cn(
                                                                "px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200",
                                                                sel
                                                                    ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/40 scale-105"
                                                                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200 border border-white/10 hover:border-red-500/30"
                                                            )}
                                                        >
                                                            {stage.name}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                            {educationStages.length === 0 && (
                                                <div className="text-center py-2">
                                                    <span className="text-gray-500 text-xs">جاري تحميل المراحل...</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="block text-right font-semibold text-gray-400 text-xs mr-1">رقم الهاتف</label>
                                            <Input
                                                placeholder="01xxxxxxxxx"
                                                icon={<Phone size={16} />}
                                                {...form.register("phoneNumber")}
                                                className="h-10 rounded-lg text-sm bg-[#12121a] border-white/5 text-left dir-ltr pr-9"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-right font-semibold text-gray-400 text-xs mr-1">واتساب</label>
                                            <Input
                                                placeholder="01xxxxxxxxx"
                                                icon={<MessageCircle size={16} />}
                                                {...form.register("whatsAppNumber")}
                                                className="h-10 rounded-lg text-sm bg-[#12121a] border-white/5 text-left dir-ltr pr-9"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="block text-right font-semibold text-gray-400 text-xs mr-1">فيسبوك</label>
                                            <Input
                                                placeholder="facebook.com/..."
                                                icon={<Facebook size={16} />}
                                                {...form.register("facebookUrl")}
                                                className="h-10 rounded-lg text-sm bg-[#12121a] border-white/5 text-left dir-ltr pr-9"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-right font-semibold text-gray-400 text-xs mr-1">تيليجرام</label>
                                            <Input
                                                placeholder="t.me/..."
                                                icon={<Send size={16} />}
                                                {...form.register("telegramUrl")}
                                                className="h-10 rounded-lg text-sm bg-[#12121a] border-white/5 text-left dir-ltr pr-9"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="block text-right font-semibold text-gray-400 text-xs mr-1">المحافظة</label>
                                            <CustomDropdown
                                                value={form.watch("governorate") || ""}
                                                onChange={(val) => form.setValue("governorate", val, { shouldValidate: true })}
                                                options={governorates}
                                                placeholder="اختر المحافظة"
                                                icon={<MapPin size={16} />}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-right font-semibold text-gray-400 text-xs mr-1">المدينة</label>
                                            <Input
                                                placeholder="أدخل المدينة"
                                                icon={<Building2 size={16} />}
                                                {...form.register("city")}
                                                className="h-10 rounded-lg text-sm bg-[#12121a] border-white/5 pr-9"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-right font-semibold text-gray-400 text-xs mr-1">الصورة الشخصية</label>
                                        <div className="relative h-16 border border-dashed border-white/10 rounded-lg flex items-center justify-center bg-[#12121a] hover:border-red-500/30 transition-colors cursor-pointer group">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                {...form.register("photoFile")}
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="flex items-center gap-2 text-gray-500 group-hover:text-red-400 transition-colors">
                                                <Camera size={18} />
                                                <span className="text-xs font-semibold">اضغط لرفع الصورة</span>
                                            </div>
                                            {form.watch("photoFile")?.[0] && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                                                    <span className="text-white text-xs font-bold">{form.watch("photoFile")[0].name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full h-11 text-sm font-bold rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-500/20 transition-all hover:shadow-red-500/30 hover:scale-[1.02] mt-2"
                                isLoading={isPending}
                            >
                                <UserPlus size={18} />
                                <span>إنشاء الحساب</span>
                            </Button>

                            <p className="text-center text-gray-600 text-[10px]">
                                بالنقر على إنشاء الحساب، فإنك توافق على شروط الخدمة
                            </p>
                        </form>
                    </div>
                </div>

                {/* Login Link */}
                <div className="text-center mt-5 text-gray-500 text-sm animate-slide-up-delay-2">
                    لديك حساب؟{" "}
                    <Link href="/login" className="text-red-400 font-bold hover:text-red-300 transition-colors">
                        تسجيل الدخول
                    </Link>
                </div>

            </div>

            {/* Footer */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-center">
                <p className="text-gray-600 text-[10px] flex items-center gap-1.5">
                    <span className="text-red-500">✦</span>
                    منصة بوصلة التعليمية
                    <span className="text-red-500">✦</span>
                </p>
            </div>
        </div>
    );
}
