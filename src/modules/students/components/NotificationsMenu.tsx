"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2, AlertCircle, Info, Clock, X } from "lucide-react";
import { StudentService } from "../services/student.service";
import { useStudentAuth } from "../hooks/use-student-auth";
import { Notification } from "../types/student.types";

export function NotificationsMenu() {
    const { userId } = useStudentAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (userId) {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 60000);
            return () => clearInterval(interval);
        }
    }, [userId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchUnreadCount = async () => {
        if (!userId) return;
        try {
            const response = await StudentService.getUnreadNotifications(userId);
            if (response.succeeded && Array.isArray(response.data)) {
                setUnreadCount(response.data.length);
            }
        } catch (error) {
            console.error("Failed to fetch unread notification count", error);
        }
    };

    const fetchNotifications = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const response = await StudentService.getNotifications(userId);
            if (response.succeeded && Array.isArray(response.data)) {
                const sorted = response.data.sort((a: any, b: any) =>
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                );
                setNotifications(sorted);
                setUnreadCount(sorted.filter(n => !n.isRead).length);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = () => {
        if (!isOpen) {
            setIsOpen(true);
            fetchNotifications();
        } else {
            setIsOpen(false);
        }
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            const response = await StudentService.markNotificationAsRead(id);
            if (response.succeeded) {
                setNotifications(prev => prev.map(n =>
                    n.id === id ? { ...n, isRead: true } : n
                ));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (!userId) return;
        try {
            const response = await StudentService.deleteNotification(id, userId);
            if (response.succeeded) {
                const isUnread = notifications.find(n => n.id === id)?.isRead === false;
                setNotifications(prev => prev.filter(n => n.id !== id));
                if (isUnread) setUnreadCount(prev => Math.max(0, prev - 1));
                if (selectedNotification?.id === id) setSelectedNotification(null);
            }
        } catch (error) {
            console.error("Failed to delete notification", error);
        }
    };

    const handleClearAll = async () => {
        if (!userId) return;
        if (!confirm("هل أنت متأكد من مسح جميع الإشعارات؟")) return;
        try {
            const response = await StudentService.clearAllNotifications(userId);
            if (response.succeeded) {
                setNotifications([]);
                setUnreadCount(0);
            }
        } catch (error) {
            console.error("Failed to clear notifications", error);
        }
    };

    const handleNotificationClick = (note: Notification) => {
        setSelectedNotification(note);
        setIsOpen(false);
        if (!note.isRead) {
            handleMarkAsRead(note.id);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = (now.getTime() - date.getTime()) / 1000;
        if (diff < 60) return "الآن";
        if (diff < 3600) return `منذ ${Math.floor(diff / 60)} د`;
        if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} س`;
        return date.toLocaleDateString('ar-EG');
    };

    return (
        <>
            <div className="relative" ref={menuRef}>
                {/* Trigger Button */}
                <button
                    onClick={handleToggle}
                    className="relative p-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
                >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-[10px] font-bold bg-brand-red text-white rounded-full border-2 border-[#0d1117]">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div
                        className="absolute top-full mt-2 right-0 w-80 bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl z-[9999] overflow-hidden"
                        dir="rtl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
                            <div className="flex items-center gap-2">
                                <Bell size={16} className="text-brand-red" />
                                <span className="font-bold text-white">الإشعارات</span>
                                {unreadCount > 0 && (
                                    <span className="bg-brand-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            {notifications.length > 0 && (
                                <button
                                    onClick={handleClearAll}
                                    className="text-[10px] text-gray-500 hover:text-red-500"
                                >
                                    مسح الكل
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div
                            className="max-h-72 overflow-y-auto"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#eb353c rgba(0,0,0,0.3)'
                            }}
                        >
                            <style jsx>{`
                                div::-webkit-scrollbar {
                                    width: 6px;
                                }
                                div::-webkit-scrollbar-track {
                                    background: rgba(0, 0, 0, 0.3);
                                    border-radius: 10px;
                                }
                                div::-webkit-scrollbar-thumb {
                                    background: linear-gradient(180deg, #eb353c 0%, #c41e24 100%);
                                    border-radius: 10px;
                                }
                                div::-webkit-scrollbar-thumb:hover {
                                    background: #ff4d54;
                                }
                            `}</style>
                            {loading ? (
                                <div className="py-8 text-center text-gray-500 text-sm">جاري التحميل...</div>
                            ) : notifications.length === 0 ? (
                                <div className="py-8 text-center text-gray-600">
                                    <Bell size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">لا توجد إشعارات</p>
                                </div>
                            ) : (
                                notifications.map((note) => (
                                    <div
                                        key={note.id}
                                        onClick={() => handleNotificationClick(note)}
                                        className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${!note.isRead ? 'bg-brand-red/5' : ''}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${!note.isRead ? 'bg-brand-red text-white' : 'bg-white/10 text-gray-500'}`}>
                                                <Info size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0 overflow-hidden">
                                                <p className={`text-sm truncate ${!note.isRead ? 'font-bold text-white' : 'text-gray-400'}`}>
                                                    {note.title}
                                                </p>
                                                <p className="text-xs text-gray-600 truncate mt-0.5">
                                                    {note.body}
                                                </p>
                                                <span className="text-[10px] text-gray-600 mt-1 block">
                                                    {formatTime(note.timestamp)}
                                                </span>
                                            </div>
                                            {!note.isRead && (
                                                <div className="w-2 h-2 rounded-full bg-brand-red shrink-0 mt-2"></div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedNotification && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" dir="rtl">
                    <div className="absolute inset-0 bg-black/80" onClick={() => setSelectedNotification(null)} />

                    <div className="relative w-full max-w-md bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-5 border-b border-white/10 bg-gradient-to-l from-brand-red/10 to-transparent">
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-brand-red text-white shrink-0">
                                    <Info size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-black text-white leading-tight">
                                        {selectedNotification.title}
                                    </h3>
                                    <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                        <Clock size={10} />
                                        {formatTime(selectedNotification.timestamp)}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setSelectedNotification(null)}
                                    className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5">
                            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {selectedNotification.body}
                            </p>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-white/10 flex justify-between">
                            <button
                                onClick={(e) => {
                                    handleDelete(e, selectedNotification.id);
                                    setSelectedNotification(null);
                                }}
                                className="text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1"
                            >
                                <Trash2 size={14} />
                                حذف
                            </button>
                            <button
                                onClick={() => setSelectedNotification(null)}
                                className="bg-brand-red hover:bg-red-600 text-white px-5 py-1.5 rounded-lg text-sm font-bold"
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
