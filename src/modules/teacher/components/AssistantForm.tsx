"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/shared/ui/button";
import { UserPlus, Mail, Lock, User } from "lucide-react";

const assistantSchema = z.object({
    email: z.string().email("البريد الإلكتروني غير صالح"),
    password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
    firstName: z.string().min(2, "الاسم الأول مطلوب"),
    lastName: z.string().min(2, "اسم العائلة مطلوب"),
});

type AssistantFormValues = z.infer<typeof assistantSchema>;

interface AssistantFormProps {
    onSubmit: (values: AssistantFormValues) => void;
    isLoading?: boolean;
}

export const AssistantForm: React.FC<AssistantFormProps> = ({ onSubmit, isLoading }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AssistantFormValues>({
        resolver: zodResolver(assistantSchema),
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400 mr-1">الاسم الأول</label>
                    <div className="relative group">
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-red transition-colors" size={20} />
                        <input
                            {...register("firstName")}
                            placeholder="محمد"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/50 transition-all font-bold"
                        />
                    </div>
                    {errors.firstName && <p className="text-brand-red text-xs mt-1 font-bold">{errors.firstName.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400 mr-1">اسم العائلة</label>
                    <div className="relative group">
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-red transition-colors" size={20} />
                        <input
                            {...register("lastName")}
                            placeholder="أحمد"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/50 transition-all font-bold"
                        />
                    </div>
                    {errors.lastName && <p className="text-brand-red text-xs mt-1 font-bold">{errors.lastName.message}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 mr-1">البريد الإلكتروني</label>
                <div className="relative group">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-red transition-colors" size={20} />
                    <input
                        {...register("email")}
                        type="email"
                        placeholder="assistant@example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/50 transition-all font-bold"
                    />
                </div>
                {errors.email && <p className="text-brand-red text-xs mt-1 font-bold">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 mr-1">كلمة المرور</label>
                <div className="relative group">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-red transition-colors" size={20} />
                    <input
                        {...register("password")}
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/50 transition-all font-bold"
                    />
                </div>
                {errors.password && <p className="text-brand-red text-xs mt-1 font-bold">{errors.password.message}</p>}
            </div>

            <Button
                type="submit"
                isLoading={isLoading}
                className="w-full h-14 rounded-2xl text-lg font-black bg-brand-red hover:bg-red-700 shadow-xl shadow-brand-red/20 flex items-center justify-center gap-2"
            >
                <UserPlus size={22} />
                تجسيل المساعد
            </Button>
        </form>
    );
};
