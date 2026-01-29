import * as React from "react";
import { cn } from "@/shared/utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", isLoading, children, ...props }, ref) => {
        const variants = {
            primary: "btn-primary",
            secondary: "bg-gray-700 hover:bg-gray-600 text-white",
            outline: "border border-gray-600 hover:bg-gray-800 text-white",
            ghost: "hover:bg-white/5 text-gray-400 hover:text-white",
        };

        return (
            <button
                ref={ref}
                disabled={isLoading || props.disabled}
                className={cn(
                    "px-6 py-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed",
                    variants[variant],
                    className
                )}
                {...props}
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : null}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";
