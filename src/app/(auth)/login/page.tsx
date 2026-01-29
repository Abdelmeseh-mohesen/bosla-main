import { LoginForm } from "@/modules/auth/components/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login | Educational Platform",
    description: "Sign in to your account",
};

export default function LoginPage() {
    return (
        <>
            <LoginForm />
        </>
    );
}
