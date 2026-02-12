"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { TeacherService } from "@/modules/teacher/services/teacher.service";
import { useTeacherAuth } from "@/modules/teacher/hooks/use-teacher-auth";
import { LectureList } from "@/modules/teacher/components/LectureList";
import { LectureForm } from "@/modules/teacher/components/LectureForm";
import { MaterialForm } from "@/modules/teacher/components/MaterialForm";
import { ContentViewer } from "@/modules/teacher/components/ContentViewer";
import { ExamManager } from "@/modules/teacher/components/ExamManager";
import { Modal } from "@/shared/ui/modal";
import { Button } from "@/shared/ui/button";
import { ArrowLeft, Plus, BookOpen, Layers, ClipboardList } from "lucide-react";
import { Course, Lecture, Material } from "@/modules/teacher/types/teacher.types";

export default function CourseDetailsPage() {
    const params = useParams();
    console.log("CourseDetailsPage params:", params);
    const router = useRouter();
    const queryClient = useQueryClient();
    const courseId = Number(params.courseId);
    const { teacherId, isAssistant } = useTeacherAuth();

    const [modals, setModals] = useState({
        lecture: false,
        editLecture: false,
        material: false,
        editMaterial: false,
        viewer: false
    });
    const [activeLectureId, setActiveLectureId] = useState<number | null>(null);
    const [activeMaterial, setActiveMaterial] = useState<Material | null>(null);
    const [editingLecture, setEditingLecture] = useState<Lecture | null>(null); // المحاضرة المحددة للتعديل

    // Fetch Course Info
    const { data: coursesResponse } = useQuery({
        queryKey: ["teacherCourses", teacherId],
        queryFn: () => TeacherService.getCourses(teacherId!),
        enabled: !!teacherId,
    });
    const course = coursesResponse?.data?.find(c => c.id === courseId);

    // Fetch Lectures to get real-time counts
    const { data: lecturesResponse } = useQuery({
        queryKey: ["lectures", courseId],
        queryFn: () => TeacherService.getLectures(courseId),
    });
    const lectures = Array.isArray(lecturesResponse?.data) ? lecturesResponse.data : [];

    // Optional: Fetch all materials to show total count
    const { data: allMaterialsResponse } = useQuery({
        queryKey: ["materials"],
        queryFn: () => TeacherService.getAllMaterials(),
    });
    const totalMaterials = Array.isArray(allMaterialsResponse?.data)
        ? allMaterialsResponse.data.filter(m => lectures.some(l => l.id === m.lectureId)).length
        : 0;

    const lectureMutation = useMutation({
        mutationFn: TeacherService.createLecture,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lectures", courseId] });
            setModals(prev => ({ ...prev, lecture: false }));
        }
    });

    const editLectureMutation = useMutation({
        mutationFn: TeacherService.editLecture,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lectures", courseId] });
            setModals(prev => ({ ...prev, editLecture: false }));
            setEditingLecture(null);
        }
    });

    const materialMutation = useMutation({
        mutationFn: TeacherService.createMaterial,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["materials"] });
            setModals(prev => ({ ...prev, material: false }));
        }
    });

    const editMaterialMutation = useMutation({
        mutationFn: TeacherService.editMaterial,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["materials", activeMaterial?.lectureId] });
            setModals(prev => ({ ...prev, editMaterial: false }));
        }
    });

    const handleAddLecture = (values: { title: string }) => {
        lectureMutation.mutate({ ...values, courseId });
    };

    const handleEditLecture = (values: { title: string }) => {
        if (!editingLecture) return;
        editLectureMutation.mutate({
            id: editingLecture.id,
            title: values.title,
            courseId: editingLecture.courseId
        });
    };

    const handleAddMaterial = (values: any) => {
        if (!activeLectureId) return;

        const payload = { ...values, lectureId: activeLectureId };
        const type = values.type?.toLowerCase();

        if ((type === "pdf" || type === "homework") && values.file && values.file.length > 0) {
            payload.file = values.file[0];
        }

        materialMutation.mutate(payload);
    };

    const handleEditMaterial = (values: any) => {
        if (!activeMaterial) return;

        const payload = { ...values, id: activeMaterial.id, lectureId: activeMaterial.lectureId };
        const type = values.type?.toLowerCase();

        if ((type === "pdf" || type === "homework") && values.file && values.file.length > 0) {
            payload.file = values.file[0];
        }

        editMaterialMutation.mutate(payload);
    };

    if (!teacherId || !course) {
        return <div className="min-h-screen flex items-center justify-center text-white">جاري تحميل بيانات الكورس...</div>;
    }

    return (
        <div className="min-h-screen bg-[#06080a] text-white p-4 md:p-10 font-arabic">
            <div className="max-w-6xl mx-auto space-y-10">

                {/* Navigation Header */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-[#0d1117]/80 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-xl gap-6">
                    <Button
                        variant="outline"
                        onClick={() => router.push("/dashboard/teacher")}
                        className="rounded-2xl border-white/10 hover:bg-white/5 p-4 order-2 md:order-1"
                    >
                        <ArrowLeft size={24} />
                    </Button>

                    <div className="text-right flex-1 order-1 md:order-2">
                        <div className="flex items-center justify-end gap-3 mb-2">
                            <span className="bg-brand-red/10 text-brand-red px-3 py-1 rounded-lg text-sm font-black">
                                {course.gradeYear === 1 ? "أولى ثانوي" : course.gradeYear === 2 ? "ثانية ثانوي" : "ثالثة ثانوي"}
                            </span>
                            <BookOpen className="text-gray-500" size={20} />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white">{course.title}</h1>
                    </div>
                </div>

                {/* Content Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Left Sidebar: Stats & Actions */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="glass-card p-8 rounded-[2rem] space-y-6">
                            <h2 className="text-xl font-black text-right border-b border-white/5 pb-4">إدارة المحتوى</h2>

                            {!isAssistant && (
                                <Button
                                    onClick={() => setModals(prev => ({ ...prev, lecture: true }))}
                                    className="w-full h-16 rounded-2xl text-lg font-black shadow-xl shadow-brand-red/20 group justify-between px-6"
                                >
                                    <Plus size={24} className="group-hover:rotate-90 transition-transform" />
                                    <span>إضافة محاضرة جديدة</span>
                                </Button>
                            )}

                            <div className="pt-4 space-y-4">
                                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                                    <span className="text-2xl font-black">{lectures.length}</span>
                                    <span className="text-gray-400 font-bold">إجمالي المحاضرات</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                                    <span className="text-2xl font-black">{totalMaterials}</span>
                                    <span className="text-gray-400 font-bold">إجمالي المواد</span>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-6 rounded-[2rem] bg-gradient-to-br from-brand-red/10 to-transparent border-brand-red/20">
                            <h3 className="text-lg font-black text-white text-right mb-2">نصيحة تقنية</h3>
                            <p className="text-sm text-gray-400 text-right leading-relaxed font-bold">
                                يمكنك ترتيب المحاضرات حسب تاريخ الإضافة. تأكد من رفع ملفات PDF بجودة عالية لضمان أفضل تجربة قراءة للطالب.
                            </p>
                        </div>
                    </div>

                    {/* Right: Lectures List */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center justify-end gap-3 mb-4">
                            <h2 className="text-2xl font-black text-white">قائمة المحاضرات</h2>
                            <Layers className="text-brand-red" size={28} />
                        </div>

                        <LectureList
                            courseId={courseId}
                            onAddMaterial={(lid) => {
                                setActiveLectureId(lid);
                                setModals(prev => ({ ...prev, material: true }));
                            }}
                            onEditMaterial={(m) => {
                                setActiveMaterial(m);
                                setModals(prev => ({ ...prev, editMaterial: true }));
                            }}
                            onViewMaterial={(m) => {
                                setActiveMaterial(m);
                                setModals(prev => ({ ...prev, viewer: true }));
                            }}
                            onManageExam={(lid, name) => {
                                router.push(`/dashboard/teacher/courses/${courseId}/exams/${lid}?name=${encodeURIComponent(name)}`);
                            }}
                            onEditLecture={(lecture) => {
                                setEditingLecture(lecture);
                                setModals(prev => ({ ...prev, editLecture: true }));
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Modals */}
            <Modal
                isOpen={modals.lecture}
                onClose={() => setModals(prev => ({ ...prev, lecture: false }))}
                title="إضافة محاضرة جديدة"
            >
                <LectureForm
                    onSubmit={handleAddLecture}
                    isLoading={lectureMutation.isPending}
                />
            </Modal>

            {/* Edit Lecture Modal */}
            <Modal
                isOpen={modals.editLecture}
                onClose={() => {
                    setModals(prev => ({ ...prev, editLecture: false }));
                    setEditingLecture(null);
                }}
                title="تعديل المحاضرة"
            >
                <LectureForm
                    onSubmit={handleEditLecture}
                    isLoading={editLectureMutation.isPending}
                    editingLecture={editingLecture}
                />
            </Modal>

            <Modal
                isOpen={modals.material}
                onClose={() => setModals(prev => ({ ...prev, material: false }))}
                title="إضافة مادة تعليمية"
                className="max-w-2xl"
            >
                <MaterialForm
                    onSubmit={handleAddMaterial}
                    isLoading={materialMutation.isPending}
                />
            </Modal>

            <Modal
                isOpen={modals.editMaterial}
                onClose={() => setModals(prev => ({ ...prev, editMaterial: false }))}
                title="تعديل المادة التعليمية"
                className="max-w-2xl"
            >
                {activeMaterial && (
                    <MaterialForm
                        initialData={activeMaterial}
                        onSubmit={handleEditMaterial}
                        isLoading={editMaterialMutation.isPending}
                    />
                )}
            </Modal>

            <Modal
                isOpen={modals.viewer}
                onClose={() => setModals(prev => ({ ...prev, viewer: false }))}
                title={activeMaterial?.title || "عرض المادة"}
                className="max-w-4xl"
            >
                {activeMaterial && <ContentViewer material={activeMaterial} />}
            </Modal>

        </div>
    );
}
