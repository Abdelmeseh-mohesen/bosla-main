"use client";

import React from "react";
import { Assistant } from "../types/teacher.types";
import { User, Mail, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface AssistantListProps {
    assistants: Assistant[];
    onDelete?: (id: string) => void;
}

export const AssistantList: React.FC<AssistantListProps> = ({ assistants, onDelete }) => {
    if (assistants.length === 0) {
        return (
            <div className="text-center py-10 glass-card rounded-3xl border-dashed border-2 border-white/5">
                <p className="text-gray-500 font-bold">لا يوجد مساعدين مسجلين حالياً</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {assistants.map((assistant, index) => (
                <div
                    key={assistant.id || `assistant-${index}`}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-red/30 transition-all group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red">
                            <User size={24} />
                        </div>
                        <div className="text-right">
                            <h4 className="text-white font-black">{assistant.firstName} {assistant.lastName}</h4>
                            <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                                <Mail size={14} />
                                <span className="font-bold">{assistant.email}</span>
                            </div>
                        </div>
                    </div>

                    {onDelete && (
                        <Button
                            variant="outline"
                            onClick={() => onDelete(assistant.id)}
                            className="w-10 h-10 p-0 rounded-xl border-white/5 hover:bg-brand-red/10 hover:text-brand-red opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <Trash2 size={18} />
                        </Button>
                    )}
                </div>
            ))}
        </div>
    );
};
