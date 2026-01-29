import { z } from "zod";

export const LoginSchema = z.object({
    email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
    password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }),
});

export type LoginFormValues = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
    firstName: z.string().min(2, { message: "الاسم الأول مطلوب" }),
    lastName: z.string().min(2, { message: "الاسم الأخير مطلوب" }),
    email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
    password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }),
    role: z.string().min(1, { message: "يرجى اختيار الدور" }),

    // Conditional fields
    parentPhoneNumber: z.string().optional(),
    gradeYear: z.coerce.number().optional(),
    subjectId: z.coerce.number().optional(),
    educationStageIds: z.array(z.number()).optional(),
    teacherId: z.coerce.number().optional(),

    // New fields
    phoneNumber: z.string().optional(),
    facebookUrl: z.string().optional(),
    telegramUrl: z.string().optional(),
    whatsAppNumber: z.string().optional(),
    parentPhoneNumberOfParent: z.string().optional(),
    photoFile: z.any().optional(),
    governorate: z.string().optional(),
    city: z.string().optional(),
}).refine((data) => {
    if (data.role === "Student" && !data.parentPhoneNumber) {
        return false;
    }
    return true;
}, {
    message: "رقم ولي الأمر مطلوب للطالب",
    path: ["parentPhoneNumber"],
}).refine((data) => {
    if (data.role === "Student" && !data.gradeYear) {
        return false;
    }
    return true;
}, {
    message: "يرجى اختيار السنة الدراسية",
    path: ["gradeYear"],
}).refine((data) => {
    if (data.role === "Teacher" && !data.subjectId) {
        return false;
    }
    return true;
}, {
    message: "يرجى اختيار المادة الدراسية",
    path: ["subjectId"],
}).refine((data) => {
    if (data.role === "Teacher" && !data.phoneNumber) {
        return false;
    }
    return true;
}, {
    message: "رقم الهاتف مطلوب للمدرس",
    path: ["phoneNumber"],
});

export type RegisterFormValues = z.infer<typeof RegisterSchema>;
