"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Course } from "../types/teacher.types";
import { Upload, X, ChevronDown, AlertTriangle } from "lucide-react";
import { AuthService } from "@/modules/auth/services/auth.service";
import { EducationStage } from "@/modules/auth/types/auth.types";

const courseSchema = z.object({
    title: z.string().min(3, "العنوان يجب أن يكون 3 أحرف على الأقل"),
    educationStageId: z.coerce.number().min(1, "الصف الدراسي مطلوب"),
    price: z.coerce.number().min(0, "السعر يجب أن يكون 0 أو أكثر"),
    discountedPrice: z.coerce.number().min(0, "السعر بعد الخصم يجب أن يكون 0 أو أكثر"),
    courseImage: z.any().optional(),
}).refine(data => data.discountedPrice <= data.price, {
    message: "السعر بعد الخصم يجب أن يكون أقل من أو يساوي السعر الأصلي",
    path: ["discountedPrice"]
});

type CourseFormValues = z.infer<typeof courseSchema>;

interface CourseFormProps {
    initialData?: Course;
    onSubmit: (data: CourseFormValues) => void;
    isLoading?: boolean;
}

export function CourseForm({ initialData, onSubmit, isLoading }: CourseFormProps) {
    const [preview, setPreview] = React.useState<string | null>(initialData?.courseImageUrl || null);
    const [imageError, setImageError] = React.useState(false);
    const [stages, setStages] = React.useState<EducationStage[]>([]);
    const [isLoadingStages, setIsLoadingStages] = React.useState(true);

    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<CourseFormValues>({
        resolver: zodResolver(courseSchema) as any,
        defaultValues: initialData ? {
            title: initialData.title,
            educationStageId: initialData.educationStageId || initialData.gradeYear,
            price: initialData.price,
            discountedPrice: initialData.discountedPrice
        } : {
            title: "",
            educationStageId: undefined,
            price: 0,
            discountedPrice: 0
        }
    });

    // Fetch actual stages from API
    React.useEffect(() => {
        AuthService.getEducationStages()
            .then(res => {
                if (res.succeeded) {
                    // console.log("CourseForm: Loaded stages:", res.data); // Removed debug log
                    setStages(res.data);
                }
            })
            .finally(() => setIsLoadingStages(false));
    }, []);

    // Reset form when initialData changes
    React.useEffect(() => {
        if (initialData) {
            reset({
                title: initialData.title,
                educationStageId: initialData.educationStageId || initialData.gradeYear,
                price: initialData.price,
                discountedPrice: initialData.discountedPrice
            });
            setPreview(initialData.courseImageUrl || null);
        }
    }, [initialData, reset]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setValue("courseImage", file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
                setImageError(false); // Reset error on new file
            };
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        setValue("courseImage", undefined);
        setPreview(null);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-right">
            {/* Image Upload Area */}
            <div className="space-y-2">
                <Label className="text-gray-400 font-bold">صورة الغلاف (اختياري)</Label>
                <div className="relative group">
                    {preview ? (
                        <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-brand-red/20 shadow-lg shadow-black/50 bg-[#0d1117]">
                            {!imageError ? (
                                <img
                                    src={preview}
                                    alt="Course Preview"
                                    className="w-full h-full object-cover"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                    <AlertTriangle size={32} className="text-yellow-500/50" />
                                    <span className="text-xs font-bold">تعذر تحميل الصورة الحالية</span>
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={clearImage}
                                className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-brand-red transition-all transform hover:scale-110"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center aspect-video rounded-3xl border-2 border-dashed border-white/5 bg-[#0d1117] hover:border-brand-red/50 hover:bg-brand-red/5 transition-all cursor-pointer group">
                            <div className="p-5 rounded-full bg-brand-red/10 text-brand-red mb-4 group-hover:scale-110 transition-transform">
                                <Upload size={36} />
                            </div>
                            <span className="text-gray-400 font-bold text-lg">اضغط لرفع صورة الكورس</span>
                            <span className="text-gray-500 text-sm mt-1 font-medium">PNG, JPG, WEBP (Max 5MB)</span>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </label>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-gray-400 font-bold">عنوان الكورس</Label>
                <Input
                    {...register("title")}
                    placeholder="مثال: فيزياء الثانوية العامة"
                    className="h-16 rounded-2xl text-lg text-right bg-[#0d1117] border-white/5 focus:border-brand-red text-white"
                />
                {errors.title && <p className="text-brand-red text-sm font-bold mr-1">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
                <Label className="text-gray-400 font-bold">الصف الدراسي</Label>
                <div className="relative group">
                    <select
                        {...register("educationStageId")}
                        className="w-full h-16 bg-[#0d1117] border border-white/5 rounded-2xl px-6 text-right appearance-none text-white focus:border-brand-red outline-none transition-all font-bold text-lg cursor-pointer"
                        disabled={isLoadingStages}
                    >
                        <option value="" className="bg-[#0d1117]">اختر الصف الدراسي...</option>
                        {stages.map(stage => (
                            <option key={stage.id} value={stage.id} className="bg-[#0d1117]">
                                {stage.name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-hover:text-brand-red transition-colors">
                        <ChevronDown size={24} />
                    </div>
                </div>
                {errors.educationStageId && <p className="text-brand-red text-sm font-bold mr-1">{errors.educationStageId.message}</p>}
                {isLoadingStages && <p className="text-gray-500 text-xs mr-1 animate-pulse italic">جاري تحميل الصفوف الدراسية...</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-gray-400 font-bold">السعر الأصلي</Label>
                    <Input
                        type="number"
                        {...register("price")}
                        className="h-16 rounded-2xl text-lg text-right bg-[#0d1117] border-white/5 focus:border-brand-red text-white"
                    />
                    {errors.price && <p className="text-brand-red text-sm font-bold mr-1">{errors.price.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label className="text-gray-400 font-bold">السعر بعد الخصم</Label>
                    <Input
                        type="number"
                        {...register("discountedPrice")}
                        className="h-16 rounded-2xl text-lg text-right bg-[#0d1117] border-white/5 focus:border-brand-red text-white"
                    />
                    {errors.discountedPrice && <p className="text-brand-red text-sm font-bold mr-1">{errors.discountedPrice.message}</p>}
                </div>
            </div>

            <Button
                type="submit"
                className="w-full h-16 text-xl font-black rounded-2xl bg-brand-red hover:bg-red-700 shadow-xl shadow-brand-red/20 transition-all hover:scale-[1.01]"
                isLoading={isLoading}
            >
                {initialData ? "حفظ التعديلات" : "إنشاء كورس جديد"}
            </Button>
        </form>
    );
}
