"use client";

import React, { useState } from "react";
import Link from "next/link";
//import { useRouter } from "next/navigation";
import { ImagePlus } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductValues {
    name: string;
    category: string;
    sellingPrice: string;
    costPrice: string;
    stock: string;
    minStock: string;
    description: string;
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

    const [values, setValues] = useState<ProductValues>({
        name: defaultValues?.name ?? "",
        category: defaultValues?.category ?? "",
        sellingPrice: defaultValues?.sellingPrice ?? "",
        costPrice: defaultValues?.costPrice ?? "",
        stock: defaultValues?.stock ?? "",
        minStock: defaultValues?.minStock ?? "",
        description: defaultValues?.description ?? "",
    });

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
                <label className={labelCls}>Photo du produit</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-gray-200 rounded cursor-pointer hover:border-purple-400 transition-colors gap-2 text-gray-400 hover:text-purple-600">
                    <ImagePlus className="w-6 h-6" />
                    <span className="text-xs">Cliquez pour ajouter une photo</span>
                    <input type="file" accept="image/*" className="hidden" />
                </label>
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
                    <select value={values.category} onChange={set("category")} className={inputCls}>
                        <option value="">Sans catégorie</option>
                        {/* TODO: charger les catégories depuis l'API */}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelCls}>Prix de vente (Fc) *</label>
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
                        <label className={labelCls}>Prix d&apos;achat (Fc)</label>
                        <input
                            type="number"
                            min={0}
                            placeholder="ex. 900"
                            value={values.costPrice}
                            onChange={set("costPrice")}
                            className={inputCls}
                        />
                        <p className="text-[11px] text-gray-400 mt-1">
                            Utilisé pour calculer votre marge.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                            value={values.minStock}
                            onChange={set("minStock")}
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
