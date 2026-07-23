import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().trim().email("Format d'email invalide"),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export const loginSchema = z.object({
    email: z.string().trim().email("Format d'email invalide"),
    password: z.string().min(1, "Le mot de passe est requis"),
});

export const forgotPasswordSchema = z.object({
    email: z.string().trim().email("Format d'email invalide"),
});

export const resetPasswordSchema = z.object({
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string().min(8, "La confirmation est requise"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});

export const shopSchema = z.object({
    name: z.string().trim().min(2, "Le nom de la boutique est requis"),
    city: z.string().trim().min(2, "La ville est requise"),
    category: z.string().min(1, "La catégorie est requise"),
});

export const productSchema = z.object({
    name: z.string().trim().min(2, "Le nom du produit est requis"),
    price: z.string().trim().regex(/^\d+$/, "Le prix doit être un nombre positif"),
    stock: z.string().trim().regex(/^\d+$/, "Le stock doit être un nombre positif").optional().or(z.literal("")),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ShopInput = z.infer<typeof shopSchema>;
export type ProductInput = z.infer<typeof productSchema>;
