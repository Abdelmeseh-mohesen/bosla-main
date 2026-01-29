import { RegisterForm } from "@/modules/auth/components/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Register | Educational Platform",
    description: "Create a new account",
};

export default function RegisterPage() {
    return (
        <>
            <RegisterForm />
        </>
    );
}
