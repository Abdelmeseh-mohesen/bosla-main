"use client";

import * as React from "react";
import { cn } from "@/shared/utils/cn";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, icon, ...props }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false);
        const isPasswordField = type === "password";

        const inputType = isPasswordField
            ? (showPassword ? "text" : "password")
            : type;

        return (
            <div className="relative w-full group">
                <input
                    type={inputType}
                    className={cn(
                        "input-field w-full h-14 px-4 rounded-xl text-right",
                        icon && "pr-12",
                        isPasswordField && "pl-12", // Add padding for eye icon on left
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {/* Right icon (main icon) */}
                {icon && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-red transition-colors duration-200">
                        {icon}
                    </div>
                )}
                {/* Password toggle icon (left side) */}
                {isPasswordField && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors duration-200 focus:outline-none"
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <EyeOff size={18} />
                        ) : (
                            <Eye size={18} />
                        )}
                    </button>
                )}
            </div>
        );
    }
);
Input.displayName = "Input";

export { Input };
