"use client";

import React from "react";
import { Course } from "../types/teacher.types";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { BookOpen, Play, ArrowRight, Settings2, Trash2, GraduationCap, BarChart3 } from "lucide-react";
import Link from "next/link";

interface CourseCardProps {
    course: Course;
    onEdit?: (course: Course) => void;
    onDelete?: (id: number) => void;
    onViewScores?: (course: Course) => void;
}

export function CourseCard({ course, onEdit, onDelete, onViewScores }: CourseCardProps) {
    const hasDiscount = course.discountedPrice > 0 && course.discountedPrice < course.price;
    const isFree = course.price === 0;
    const [imageError, setImageError] = React.useState(false);

    return (
        <Card className="group relative overflow-hidden rounded-2xl bg-[#0d1117] border border-white/5 hover:border-brand-red/30 transition-all duration-300">
            {/* Image Section - Compact */}
            <div className="relative h-36 overflow-hidden">
                {course.courseImageUrl && !imageError ? (
                    <img
                        src={course.courseImageUrl}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                            setImageError(true);
                        }}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1a1f2e] via-[#0d1117] to-brand-red/5 flex flex-col items-center justify-center p-4 text-center group-hover:scale-105 transition-transform duration-500">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-2 shadow-inner border border-white/5">
                            <BookOpen size={24} className="text-white/20 group-hover:text-brand-red/80 transition-colors" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-600 group-hover:text-gray-400 transition-colors">
                            {course.educationStageName || "دورة تعليمية"}
                        </span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-transparent" />

                {/* Badges */}
                <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                    {/* Price/Discount Badge */}
                    <div>
                        {isFree ? (
                            <span className="bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-lg">
                                مجاني
                            </span>
                        ) : hasDiscount ? (
                            <span className="bg-brand-red text-white text-[10px] font-black px-2 py-1 rounded-md shadow-lg animate-pulse">
                                خصم {Math.round(((course.price - course.discountedPrice) / course.price) * 100)}%
                            </span>
                        ) : null}
                    </div>

                    {/* Action Buttons */}
                    {(onEdit || onDelete || onViewScores) && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {onViewScores && (
                                <button
                                    onClick={(e) => { e.preventDefault(); onViewScores(course); }}
                                    className="bg-black/70 backdrop-blur-md text-white p-1.5 rounded-lg hover:bg-emerald-600 transition-all"
                                    title="عرض درجات الطلاب"
                                >
                                    <BarChart3 size={14} />
                                </button>
                            )}
                            {onEdit && (
                                <button
                                    onClick={(e) => { e.preventDefault(); onEdit(course); }}
                                    className="bg-black/70 backdrop-blur-md text-white p-1.5 rounded-lg hover:bg-brand-red transition-all"
                                >
                                    <Settings2 size={14} />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={(e) => { e.preventDefault(); onDelete(course.id); }}
                                    className="bg-black/70 backdrop-blur-md text-white p-1.5 rounded-lg hover:bg-red-600 transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Stage Badge */}
                <div className="absolute bottom-2 right-2">
                    <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                        <GraduationCap size={12} />
                        {course.educationStageName || course.gradeYear}
                    </span>
                </div>
            </div>

            {/* Content - Compact */}
            <div className="p-4 space-y-3">
                <div className="text-right">
                    <h3 className="text-lg font-black text-white group-hover:text-brand-red transition-colors line-clamp-1">
                        {course.title}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                            <BookOpen size={12} />
                            {course.lectureCount || 0} محاضرة
                        </span>
                        <div className="font-bold text-sm">
                            {hasDiscount ? (
                                <div className="flex items-center gap-1.5">
                                    <span className="line-through text-gray-600 text-xs">{course.price}</span>
                                    <span className="text-brand-red">{course.discountedPrice} ج.م</span>
                                </div>
                            ) : (
                                <span className={isFree ? "text-green-500" : "text-white"}>
                                    {isFree ? "مجاني" : `${course.price} ج.م`}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <Link href={`/dashboard/teacher/courses/${course.id}`} className="block">
                    <Button
                        variant="outline"
                        className="w-full h-9 rounded-xl text-sm font-bold border-white/10 hover:bg-white/5 hover:border-brand-red/30 gap-2"
                    >
                        عرض المحتوى
                        <ArrowRight size={14} />
                    </Button>
                </Link>
            </div>

            {/* Hover Accent Line */}
            <div className="absolute top-0 left-0 h-0.5 w-0 bg-brand-red group-hover:w-full transition-all duration-500" />
        </Card>
    );
}

