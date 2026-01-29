"use client";

import React, { useRef, useState, useEffect } from "react";
import { Modal } from "@/shared/ui/modal";
import { Button } from "@/shared/ui/button";
import { Save, Undo, Eraser, Pen, X, Loader2 } from "lucide-react";

interface ImageEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    onSave: (file: File) => Promise<void>;
}

export function ImageEditorModal({ isOpen, onClose, imageUrl, onSave }: ImageEditorModalProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState("#ef4444"); // Default Red
    const [lineWidth, setLineWidth] = useState(3);
    const [maxLineWidth, setMaxLineWidth] = useState(20);
    const [tool, setTool] = useState<"pen" | "eraser">("pen");
    const [history, setHistory] = useState<ImageData[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Initial Image Load
    useEffect(() => {
        if (isOpen && imageUrl) {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = imageUrl;

            img.onload = () => {
                // Set canvas size to match image (or max limits if needed, but full res is better for quality)
                canvas.width = img.width;
                canvas.height = img.height;

                // Calculate appropriate line width based on resolution
                const baseDimension = Math.max(img.width, img.height);
                const defaultWidth = Math.max(3, Math.floor(baseDimension / 400));
                setLineWidth(defaultWidth);
                setMaxLineWidth(Math.max(20, Math.floor(baseDimension / 50)));

                ctx.drawImage(img, 0, 0);
                setImageLoaded(true);
                // Save initial state
                setHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
            };

            img.onerror = (e) => {
                console.error("Error loading image for editing", e);
                alert("تعذر تحميل الصورة للتعديل. قد يكون هناك مشكلة في المصدر.");
            };
        } else {
            setImageLoaded(false);
            setHistory([]);
        }
    }, [isOpen, imageUrl]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        setIsDrawing(true);

        const { x, y } = getCoordinates(e, canvas);
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { x, y } = getCoordinates(e, canvas);

        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
        ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
        // Or strictly strictly "eraser" should use globalCompositeOperation = 'destination-out' but white is safer for jpgs usually unless transparency is supported.
        // Assuming student answers are white/paper bg, white is effectively erasing. 
        // Real eraser:
        if (tool === 'eraser') {
            // ctx.globalCompositeOperation = 'destination-out'; // This makes it transparent
            // But if we save as JPEG, transparency becomes black. 
            // Better to just paint white if we assume paper.
            ctx.strokeStyle = "#ffffff";
            // If we really want to recover original pixels, that's complex (layers). 
            // Simple paint over is standard for this simple requirement.
        } else {
            ctx.globalCompositeOperation = 'source-over';
        }

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.closePath();

        // Add to history
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory(prev => [...prev.slice(-10), imageData]); // Keep last 10 states
    };

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    };

    const handleUndo = () => {
        if (history.length <= 1) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const newHistory = [...history];
        newHistory.pop(); // Remove current
        const previousState = newHistory[newHistory.length - 1];

        ctx.putImageData(previousState, 0, 0);
        setHistory(newHistory);
    };

    const handleSaveClick = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        setIsSaving(true);
        try {
            canvas.toBlob(async (blob) => {
                if (blob) {
                    const file = new File([blob], "edited-answer.jpg", { type: "image/jpeg" });
                    await onSave(file);
                    onClose();
                }
            }, "image/jpeg", 0.9);
        } catch (error) {
            console.error("Save failed", error);
        } finally {
            setIsSaving(false);
        }
    };

    /* Colors Palette */
    const colors = [
        { hex: "#ef4444", name: "Red" }, // Red
        { hex: "#22c55e", name: "Green" }, // Green
        { hex: "#3b82f6", name: "Blue" }, // Blue
        { hex: "#000000", name: "Black" }, // Black
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="w-full h-full max-w-6xl max-h-[90vh] bg-[#0d1117] rounded-3xl border border-white/10 flex flex-col overflow-hidden relative">
                {/* Header & Tools */}
                <div className="h-16 border-b border-white/10 bg-white/5 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <h3 className="text-white font-bold hidden md:block">محرر الإجابة</h3>
                        <div className="h-6 w-[1px] bg-white/10 hidden md:block" />

                        {/* Tools */}
                        <div className="flex items-center bg-black/40 rounded-lg p-1 border border-white/10">
                            <button
                                onClick={() => setTool('pen')}
                                className={`p-2 rounded-md transition-all ${tool === 'pen' ? 'bg-white/10 text-brand-red' : 'text-gray-400 hover:text-white'}`}
                                title="قلم"
                            >
                                <Pen size={18} />
                            </button>
                            <button
                                onClick={() => setTool('eraser')}
                                className={`p-2 rounded-md transition-all ${tool === 'eraser' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                                title="ممحاة (أبيض)"
                            >
                                <Eraser size={18} />
                            </button>
                        </div>

                        {/* Undo */}
                        <button
                            onClick={handleUndo}
                            disabled={history.length <= 1}
                            className={`p-2 rounded-md transition-all ${history.length <= 1 ? 'text-gray-600' : 'text-gray-400 hover:text-white bg-white/5'}`}
                            title="تراجع"
                        >
                            <Undo size={18} />
                        </button>

                        {/* Colors */}
                        <div className="flex items-center gap-2 mr-2">
                            {colors.map(c => (
                                <button
                                    key={c.hex}
                                    onClick={() => {
                                        setColor(c.hex);
                                        setTool('pen');
                                    }}
                                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c.hex && tool === 'pen' ? 'border-white scale-110' : 'border-transparent'}`}
                                    style={{ backgroundColor: c.hex }}
                                />
                            ))}
                        </div>

                        {/* Line Width */}
                        <input
                            type="range"
                            min="1"
                            max={maxLineWidth}
                            value={lineWidth}
                            onChange={(e) => setLineWidth(Number(e.target.value))}
                            className="w-20 hidden sm:block accent-brand-red"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
                            إلغاء
                        </Button>
                        <Button
                            onClick={handleSaveClick}
                            disabled={isSaving || !imageLoaded}
                            className="bg-brand-red hover:bg-brand-red/90 text-white gap-2 font-bold min-w-[100px]"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            حفظ
                        </Button>
                    </div>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-[#0a0c10] cursor-crosshair relative touch-none">
                    {!imageLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 gap-2">
                            <Loader2 className="animate-spin" size={24} />
                            <span>جاري تحميل الصورة...</span>
                        </div>
                    )}
                    <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="max-w-full max-h-full shadow-2xl border border-white/5"
                    />
                </div>
            </div>
        </div>
    );
}

// Helpers
function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}
