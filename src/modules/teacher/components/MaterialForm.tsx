"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { MaterialType } from "../types/teacher.types";
import { Video, FileText, Upload, Globe, Lock } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface MaterialFormProps {
    onSubmit: (values: any) => void;
    isLoading?: boolean;
    initialData?: any;
}

export function MaterialForm({ onSubmit, isLoading, initialData }: MaterialFormProps) {
    const [type, setType] = useState<MaterialType>(initialData?.type || "video");
    const { register, handleSubmit, watch, formState: { errors } } = useForm<any>({
        defaultValues: initialData ? {
            title: initialData.title,
            videoUrl: initialData.videoUrl || initialData.fileUrl,
            isFree: initialData.isFree?.toString() || "true"
        } : {
            isFree: "true"
        }
    });

    return (
        <form onSubmit={handleSubmit((data) => onSubmit({ ...data, type }))} className="space-y-6 text-right">
            {/* Type Selector */}
            <div className="grid grid-cols-3 gap-4">
                <button
                    type="button"
                    disabled={!!initialData}
                    onClick={() => setType("pdf")}
                    className={cn(
                        "p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all font-bold",
                        type === "pdf" ? "border-brand-red bg-brand-red/10 text-white" : "border-[#22272e] text-gray-500 hover:border-white/10",
                        !!initialData && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <FileText size={28} />
                    <span className="text-sm">ملف PDF</span>
                </button>
                <button
                    type="button"
                    disabled={!!initialData}
                    onClick={() => setType("homework")}
                    className={cn(
                        "p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all font-bold",
                        type === "homework" ? "border-brand-red bg-brand-red/10 text-white" : "border-[#22272e] text-gray-500 hover:border-white/10",
                        !!initialData && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <Upload size={28} />
                    <span className="text-sm">واجب منزلي</span>
                </button>
                <button
                    type="button"
                    disabled={!!initialData}
                    onClick={() => setType("video")}
                    className={cn(
                        "p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all font-bold",
                        type === "video" ? "border-brand-red bg-brand-red/10 text-white" : "border-[#22272e] text-gray-500 hover:border-white/10",
                        !!initialData && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <Video size={28} />
                    <span className="text-sm">فيديو YouTube</span>
                </button>
            </div>

            <div className="space-y-2">
                <Label className="text-gray-400 font-bold">عنوان المادة</Label>
                <Input
                    {...register("title", { required: "العنوان مطلوب" })}
                    placeholder="مثال: شرح قانون نيوتن الأول"
                    className="h-14 rounded-xl text-lg text-right"
                />
            </div>

            {type === "video" ? (
                <div className="space-y-2">
                    <Label className="text-gray-400 font-bold">رابط يوتيوب</Label>
                    <Input
                        {...register("videoUrl", { required: "رابط الفيديو مطلوب" })}
                        placeholder="https://youtube.com/watch?v=..."
                        className="h-14 rounded-xl text-lg text-left dir-ltr"
                    />
                </div>
            ) : (
                <div className="space-y-2">
                    <Label className="text-gray-400 font-bold">{type === "pdf" ? "ملف PDF" : "ملف الواجب"}</Label>
                    <div className="relative h-24 border-2 border-dashed border-[#22272e] rounded-xl flex items-center justify-center group hover:border-brand-red/50 transition-all cursor-pointer">
                        <input
                            type="file"
                            accept={type === "pdf" ? ".pdf" : ".pdf,image/*"}
                            {...register("file", { required: !initialData })}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center text-gray-500 group-hover:text-brand-red">
                            <Upload size={24} />
                            <span className="font-bold mt-1">اضغط لرفع ملف جديد</span>
                        </div>
                    </div>
                    {initialData?.fileUrl && !watch("file")?.[0] && (
                        <p className="text-blue-500 text-xs font-bold mt-1 text-left">يوجد ملف مرفوع بالفعل</p>
                    )}
                    {watch("file")?.[0] && (
                        <p className="text-green-500 text-xs font-bold mt-1 text-left">تم اختيار: {watch("file")[0].name}</p>
                    )}
                </div>
            )}

            <div className="space-y-3">
                <Label className="text-gray-400 font-bold">إعدادات الرؤية</Label>
                <div className="flex gap-4">
                    <label className="flex-1 cursor-pointer">
                        <input type="radio" {...register("isFree")} value="true" className="peer hidden" />
                        <div className="p-4 border-2 border-[#22272e] rounded-xl flex items-center justify-center gap-3 text-gray-500 peer-checked:border-green-500 peer-checked:text-green-500 peer-checked:bg-green-500/5 transition-all font-bold">
                            <Globe size={20} />
                            <span>متاح مجاناً</span>
                        </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                        <input type="radio" {...register("isFree")} value="false" className="peer hidden" />
                        <div className="p-4 border-2 border-[#22272e] rounded-xl flex items-center justify-center gap-3 text-gray-500 peer-checked:border-brand-red peer-checked:text-brand-red peer-checked:bg-brand-red/5 transition-all font-bold">
                            <Lock size={20} />
                            <span>للمشتركين فقط</span>
                        </div>
                    </label>
                </div>
            </div>

            <Button type="submit" className="w-full h-14 text-xl font-black rounded-xl" isLoading={isLoading}>
                {initialData ? "تحديث المادة" : "إضافة المادة"}
            </Button>
        </form>
    );
}
