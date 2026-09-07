"use client";

import React, { useState } from "react";
import Link from "next/link";
//import { useRouter } from "next/navigation";
import ImageUpload from "./image-upload";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductValues {
    name: string;
    categoryId: string;
    sellingPrice: string;
    currency: "CDF" | "USD";
    purchasePrice: string;
    stock: string;
    lowStockAlert: string;
    description: string;
    imageUrl?: string;
    imageKey?: string;
}

interface ProductFormProps {
    defaultValues?: Partial<ProductValues>;
    cancelHref: string;
    onSubmit: (values: ProductValues) => Promise<void>;
}

// ─── Shared classes ───────────────────────────────────────────────────────────

const inputCls =
    "w-full border border-gray-200 rounded px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-purple-600 transition-colors bg-white";

const labelCls = "block text-xs font-semibold text-gray-700 mb-1.5";

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProductForm({ defaultValues, cancelHref, onSubmit }: ProductFormProps) {
    //const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

    const [values, setValues] = useState<ProductValues>({
        name: defaultValues?.name ?? "",
        categoryId: defaultValues?.categoryId ?? "",
        sellingPrice: defaultValues?.sellingPrice ?? "",
        currency: defaultValues?.currency ?? "CDF",
        purchasePrice: defaultValues?.purchasePrice ?? "",
        stock: defaultValues?.stock ?? "",
        lowStockAlert: defaultValues?.lowStockAlert ?? "",
        description: defaultValues?.description ?? "",
        imageUrl: defaultValues?.imageUrl ?? undefined,
        imageKey: defaultValues?.imageKey ?? undefined,
    });

    React.useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch("/api/categories");
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data.categories);
                }
            } catch (error) {
                console.error("Fetch categories error:", error);
            }
        };
        fetchCategories();
    }, []);

    const set =
        (key: keyof ProductValues) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
            setValues((v) => ({ ...v, [key]: e.target.value }));

    const valid = values.name.trim() && values.sellingPrice.trim() && values.stock.trim();

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        if (!valid) return;
        setLoading(true);
        try {
            await onSubmit(values);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-7xl">
            {/* Photo */}
            <div>
                <ImageUpload
                    label="Photo du produit"
                    value={values.imageUrl}
                    onChange={(url, key) =>
                        setValues((v) => ({ ...v, imageUrl: url, imageKey: key }))
                    }
                    onRemove={() =>
                        setValues((v) => ({ ...v, imageUrl: undefined, imageKey: undefined }))
                    }
                />
            </div>

            {/* Infos principales */}
            <div className="flex flex-col gap-5">
                <div>
                    <label className={labelCls}>Nom du produit *</label>
                    <input
                        type="text"
                        placeholder="ex. Savon Omo 500g"
                        value={values.name}
                        onChange={set("name")}
                        className={inputCls}
                        required
                    />
                </div>

                <div>
                    <label className={labelCls}>Catégorie</label>
                    <select
                        value={values.categoryId}
                        onChange={set("categoryId")}
                        className={inputCls}
                    >
                        <option value="">Sans catégorie</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelCls}>Prix de vente *</label>
                        <input
                            type="number"
                            min={0}
                            placeholder="ex. 1 500"
                            value={values.sellingPrice}
                            onChange={set("sellingPrice")}
                            className={inputCls}
                            required
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Devise du produit</label>
                        <select
                            value={values.currency}
                            onChange={set("currency")}
                            className={inputCls}
                        >
                            <option value="CDF">Franc congolais (Fc)</option>
                            <option value="USD">Dollar américain ($)</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>Prix d&apos;achat</label>
                        <input
                            type="number"
                            min={0}
                            placeholder="ex. 900"
                            value={values.purchasePrice}
                            onChange={set("purchasePrice")}
                            className={inputCls}
                        />
                        <p className="text-[11px] text-gray-400 mt-1">
                            Utilisé pour calculer votre marge.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelCls}>Stock *</label>
                        <input
                            type="number"
                            min={0}
                            placeholder="ex. 50"
                            value={values.stock}
                            onChange={set("stock")}
                            className={inputCls}
                            required
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Seuil d&apos;alerte</label>
                        <input
                            type="number"
                            min={0}
                            placeholder="ex. 5"
                            value={values.lowStockAlert}
                            onChange={set("lowStockAlert")}
                            className={inputCls}
                        />
                        <p className="text-[11px] text-gray-400 mt-1">
                            Alerte quand le stock passe en dessous.
                        </p>
                    </div>
                </div>

                <div>
                    <label className={labelCls}>Description</label>
                    <textarea
                        rows={3}
                        placeholder="Décrivez le produit (optionnel)"
                        value={values.description}
                        onChange={set("description")}
                        className={inputCls + " resize-none"}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
                <button
                    type="submit"
                    disabled={!valid || loading}
                    className="text-sm font-semibold bg-purple-600 text-white px-5 py-2.5 rounded hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {loading ? "Enregistrement..." : "Enregistrer"}
                </button>
                <Link
                    href={cancelHref}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-2.5"
                >
                    Annuler
                </Link>
            </div>
        </form>
    );
}
