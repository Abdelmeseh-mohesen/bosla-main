"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TeacherService } from "../services/teacher.service";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
    X,
    Clock,
    CalendarPlus,
    User,
    CheckCircle,
    AlertCircle,
    Loader2,
    FileText
} from "lucide-react";

interface DeadlineExceptionModalProps {
    examId: number;
    studentId: number;
    studentName: string;
    studentEmail: string;
    onClose: () => void;
    onSuccess: () => void;
}

export function DeadlineExceptionModal({
    examId,
    studentId,
    studentName,
    studentEmail,
    onClose,
    onSuccess
}: DeadlineExceptionModalProps) {
    const queryClient = useQueryClient();

    // Form State
    const [extendedDeadline, setExtendedDeadline] = useState("");
    const [allowedAfterDeadline, setAllowedAfterDeadline] = useState(true);
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    // Mutation
    const createExceptionMutation = useMutation({
        mutationFn: TeacherService.createDeadlineException,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["examSubmissions"] });
            onSuccess();
            onClose();
        },
        onError: (err: any) => {
            setError(err?.response?.data?.message || "فشل في إنشاء الاستثناء");
        }
    });

    const handleSubmit = () => {
        setError("");

        if (!extendedDeadline) {
            setError("يرجى تحديد موعد الانتهاء الجديد");
            return;
        }

        if (!reason.trim()) {
            setError("يرجى إدخال سبب الاستثناء");
            return;
        }

        const deadlineDate = new Date(extendedDeadline);
        if (isNaN(deadlineDate.getTime())) {
            setError("موعد غير صالح");
            return;
        }

        createExceptionMutation.mutate({
            examId,
            studentId,
            extendedDeadline: deadlineDate.toISOString(),
            allowedAfterDeadline,
            reason: reason.trim()
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
            <div
                className="absolute inset-0 bg-black/60"
                onClick={onClose}
            />
            <div className="relative z-10 w-full max-w-xl bg-[#0d1117] border border-white/10 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 fade-in duration-300 my-auto max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all"
                    >
                        <X size={24} />
                    </button>
                    <div className="text-right">
                        <h3 className="text-2xl font-black text-white flex items-center gap-3 justify-end">
                            <CalendarPlus className="text-brand-red" size={28} />
                            استثناء موعد الامتحان
                        </h3>
                        <p className="text-gray-400 font-bold text-sm mt-1">السماح للطالب بدخول الامتحان بعد انتهاء الموعد</p>
                    </div>
                </div>

                {/* Student Info Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-red/10 to-purple-500/10 border border-brand-red/20 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="h-14 w-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-red">
                            <User size={28} />
                        </div>
                        <div className="text-right">
                            <p className="text-white font-black text-lg">{studentName}</p>
                            <p className="text-gray-400 text-sm font-bold">{studentEmail}</p>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6 flex items-center gap-3 text-red-400">
                        <AlertCircle size={20} />
                        <p className="font-bold text-sm">{error}</p>
                    </div>
                )}

                {/* Form */}
                <div className="space-y-6">
                    {/* Extended Deadline */}
                    <div className="space-y-3">
                        <Label className="text-gray-400 font-bold flex items-center gap-2 justify-end">
                            <span className="text-brand-red">📅</span>
                            الموعد الجديد للانتهاء
                        </Label>

                        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#161b22] to-[#0d1117] border border-white/10 space-y-4">
                            {/* Date Input */}
                            <div className="space-y-2">
                                <label className="text-xs text-gray-500 font-bold flex items-center gap-2 justify-end">
                                    📆 التاريخ
                                </label>
                                <Input
                                    type="date"
                                    value={extendedDeadline.includes('T') ? extendedDeadline.split('T')[0] : ''}
                                    onChange={(e) => {
                                        const time = extendedDeadline.includes('T') ? extendedDeadline.split('T')[1] : '23:59';
                                        setExtendedDeadline(`${e.target.value}T${time}`);
                                    }}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="h-12 rounded-xl text-center text-lg bg-[#06080a] border-2 border-white/10 focus:border-brand-red text-white font-bold"
                                />
                            </div>

                            {/* Time Input */}
                            <div className="space-y-2">
                                <label className="text-xs text-gray-500 font-bold flex items-center gap-2 justify-end">
                                    🕐 الوقت
                                </label>
                                <Input
                                    type="time"
                                    value={extendedDeadline.includes('T') ? extendedDeadline.split('T')[1] : ''}
                                    onChange={(e) => {
                                        const date = extendedDeadline.includes('T') ? extendedDeadline.split('T')[0] : new Date().toISOString().split('T')[0];
                                        setExtendedDeadline(`${date}T${e.target.value}`);
                                    }}
                                    className="h-12 rounded-xl text-center text-lg bg-[#06080a] border-2 border-white/10 focus:border-brand-red text-white font-bold"
                                />
                            </div>

                            {/* Preview */}
                            {extendedDeadline && extendedDeadline.includes('T') && (
                                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-between">
                                    <div className="text-green-500 font-black">
                                        <Clock size={20} />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-bold">
                                            {(() => {
                                                const [datePart] = extendedDeadline.split('T');
                                                const [year, month, day] = datePart.split('-').map(Number);
                                                const dateObj = new Date(year, month - 1, day);
                                                return dateObj.toLocaleDateString('ar-EG', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long'
                                                });
                                            })()}
                                        </p>
                                        <p className="text-green-400 text-sm font-bold">
                                            {(() => {
                                                const timePart = extendedDeadline.split('T')[1];
                                                const [hours, minutes] = timePart.split(':').map(Number);
                                                const period = hours >= 12 ? 'م' : 'ص';
                                                const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
                                                return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
                                            })()}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Allow After Deadline Toggle */}
                    <div
                        onClick={() => setAllowedAfterDeadline(!allowedAfterDeadline)}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${allowedAfterDeadline
                            ? 'bg-green-500/10 border-green-500/30 hover:border-green-500/50'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className={`w-12 h-7 rounded-full relative transition-all duration-300 ${allowedAfterDeadline ? 'bg-green-500' : 'bg-gray-600'
                                }`}>
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${allowedAfterDeadline ? 'right-1' : 'left-1'
                                    }`} />
                            </div>
                            <div className="text-right">
                                <p className={`font-bold ${allowedAfterDeadline ? 'text-green-500' : 'text-gray-400'}`}>
                                    {allowedAfterDeadline ? 'مسموح بالدخول بعد الموعد' : 'غير مسموح بعد الموعد'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {allowedAfterDeadline ? 'الطالب يستطيع دخول الامتحان حتى الموعد الجديد' : 'الطالب لن يستطيع الدخول'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-3">
                        <Label className="text-gray-400 font-bold flex items-center gap-2 justify-end">
                            <FileText size={16} className="text-brand-red" />
                            سبب الاستثناء
                        </Label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="مثال: مريض، مشكلة تقنية، ظروف طارئة..."
                            rows={3}
                            className="w-full p-4 rounded-xl text-right bg-[#06080a] border-2 border-white/10 focus:border-brand-red text-white font-bold resize-none outline-none transition-all"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                        <Button
                            onClick={handleSubmit}
                            isLoading={createExceptionMutation.isPending}
                            className="flex-1 h-14 rounded-xl text-lg font-black gap-2"
                        >
                            <CheckCircle size={20} />
                            إنشاء الاستثناء
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 h-14 rounded-xl text-lg font-black border-white/10 hover:bg-white/5"
                        >
                            إلغاء
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
