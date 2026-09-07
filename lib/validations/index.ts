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

export const resetPasswordSchema = z
    .object({
        password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
        confirmPassword: z.string().min(8, "La confirmation est requise"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Les mots de passe ne correspondent pas",
        path: ["confirmPassword"],
    });

export const shopSchema = z.object({
    name: z.string().trim().min(2, "Le nom de la boutique est requis"),
    city: z.string().trim().min(2, "La ville est requise"),
    category: z.string().min(1, "La catégorie est requise"),
    currency: z.enum(["CDF", "USD"]).default("CDF"),
    exchangeRate: z.coerce.number().positive().default(22500),
});

export const categorySchema = z.object({
    name: z.string().trim().min(2, "Le nom de la catégorie est requis"),
});

export const createProductSchema = z.object({
    categoryId: z.preprocess(
        (value) => (value === "" ? null : value),
        z.string().optional().nullable()
    ),
    name: z.string().trim().min(2, "Le nom du produit est requis"),
    description: z.string().optional().nullable(),
    sellingPrice: z.coerce.number().min(0, "Le prix doit être positif"),
    currency: z.enum(["CDF", "USD"]).default("CDF"),
    purchasePrice: z.coerce.number().min(0).optional().nullable(),
    stock: z.coerce.number().int().min(0).default(0),
    lowStockAlert: z.coerce.number().int().min(0).default(5),
    unit: z.string().optional().nullable(),
    isPublic: z.boolean().default(true),
    imageUrl: z.string().optional().nullable(),
    imageKey: z.string().optional().nullable(),
});

export const updateProductSchema = createProductSchema.partial();

export const customerSchema = z.object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    phone: z.string().optional().nullable(),
    whatsapp: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    note: z.string().optional().nullable(),
});

export const updateCustomerSchema = customerSchema.partial();

export const saleItemSchema = z.object({
    productId: z.string().min(1, "Produit requis"),
    quantity: z.number().int().min(1, "La quantité doit être au moins 1"),
    unitPrice: z.coerce.number().min(0, "Le prix doit être positif"),
});

export const saleSchema = z.object({
    customerId: z.string().optional().nullable(),
    paymentMethod: z.enum(["CASH", "MOBILE_MONEY", "BANK_TRANSFER", "OTHER"]),
    soldAt: z.coerce.date().optional(),
    note: z.string().optional().nullable(),
    items: z.array(saleItemSchema).min(1, "La vente doit contenir au moins un article"),
});

export const updateSaleSchema = saleSchema.partial();

export const saleStatusSchema = z.object({
    status: z.enum(["COMPLETED", "CANCELLED"]),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ShopInput = z.infer<typeof shopSchema>;
export type ProductInput = z.infer<typeof createProductSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type SaleInput = z.infer<typeof saleSchema>;
