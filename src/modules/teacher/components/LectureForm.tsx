"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Lecture } from "../types/teacher.types";

interface LectureFormProps {
    onSubmit: (values: { title: string }) => void;
    isLoading?: boolean;
    editingLecture?: Lecture | null; // للتعديل
}

export function LectureForm({ onSubmit, isLoading, editingLecture }: LectureFormProps) {
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<{ title: string }>();

    useEffect(() => {
        if (editingLecture) {
            setValue("title", editingLecture.title);
        } else {
            reset();
        }
    }, [editingLecture, setValue, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-right">
            <div className="space-y-2">
                <Label className="text-gray-400 font-bold">عنوان المحاضرة</Label>
                <Input
                    {...register("title", { required: "عنوان المحاضرة مطلوب" })}
                    placeholder="مثال: المحاضرة الأولى - مقدمة"
                    className="h-14 rounded-xl text-lg text-right"
                />
                {errors.title && (
                    <p className="text-red-500 text-sm">{errors.title.message}</p>
                )}
            </div>
            <Button type="submit" className="w-full h-14 text-xl font-black rounded-xl" isLoading={isLoading}>
                {editingLecture ? "تحديث المحاضرة" : "إضافة المحاضرة"}
            </Button>
        </form>
    );
}
