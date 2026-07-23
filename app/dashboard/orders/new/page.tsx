"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LineItem {
    key: string;
    productId: string;
    productName: string;
    unitPrice: number;
    quantity: number;
}

// ─── Shared classes ───────────────────────────────────────────────────────────

const inputCls =
    "w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-purple-600 transition-colors bg-white";

const labelCls = "block text-xs font-semibold text-gray-700 mb-1.5";

// ─── Empty line factory ───────────────────────────────────────────────────────

function emptyLine(overrides?: Partial<LineItem>): LineItem {
    return {
        key: Math.random().toString(36).slice(2),
        productId: "",
        productName: "",
        unitPrice: 0,
        quantity: 1,
        ...overrides,
    };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function OrderNewForm() {
    const router = useRouter();

    const [lines, setLines] = useState<LineItem[]>([emptyLine()]);
    const [customerName, setCustomerName] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);

    // ── Ligne ──────────────────────────────────────────────────────────────────

    const updateLine = (key: string, patch: Partial<LineItem>) =>
        setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));

    const removeLine = (key: string) => setLines((prev) => prev.filter((l) => l.key !== key));

    const addLine = () => setLines((prev) => [...prev, emptyLine()]);

    // ── Total ──────────────────────────────────────────────────────────────────

    const total = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

    // ── Validation ─────────────────────────────────────────────────────────────

    const valid = lines.every((l) => l.productName.trim() && l.unitPrice > 0 && l.quantity > 0);

    // ── Submit ─────────────────────────────────────────────────────────────────

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        if (!valid) return;
        setLoading(true);
        try {
            // TODO: POST /api/orders
            router.push("/dashboard/orders");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-7xl bg-white border border-gray-200 rounded p-8 flex flex-col gap-8">
            {/* Header */}
            <div>
                <Link
                    href="/dashboard/orders"
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors mb-4"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Commandes
                </Link>
                <h1 className="text-xl font-bold text-gray-900">Nouvelle commande</h1>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                {/* Produits */}
                <div className="flex flex-col gap-3">
                    <label className={labelCls}>Produits *</label>

                    <div className="flex flex-col gap-2">
                        {lines.map((line) => (
                            <div key={line.key} className="flex items-center gap-2">
                                {/* Produit */}
                                <input
                                    type="text"
                                    placeholder="Nom du produit"
                                    value={line.productName}
                                    onChange={(e) =>
                                        updateLine(line.key, { productName: e.target.value })
                                    }
                                    className={inputCls + " flex-3"}
                                />

                                {/* Prix unitaire */}
                                <div className="relative flex-2">
                                    <input
                                        type="number"
                                        min={0}
                                        placeholder="Prix (Fc)"
                                        value={line.unitPrice || ""}
                                        onChange={(e) =>
                                            updateLine(line.key, {
                                                unitPrice: Number(e.target.value),
                                            })
                                        }
                                        className={inputCls}
                                    />
                                </div>

                                {/* Quantité */}
                                <input
                                    type="number"
                                    min={1}
                                    value={line.quantity}
                                    onChange={(e) =>
                                        updateLine(line.key, {
                                            quantity: Number(e.target.value),
                                        })
                                    }
                                    className={inputCls + " flex-1 text-center"}
                                />

                                {/* Sous-total */}
                                <span className="text-sm text-gray-500 w-24 text-right shrink-0">
                                    {(line.unitPrice * line.quantity).toLocaleString("fr-FR")} Fc
                                </span>

                                {/* Supprimer */}
                                <button
                                    type="button"
                                    onClick={() => removeLine(line.key)}
                                    disabled={lines.length === 1}
                                    className="p-1.5 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-0"
                                    aria-label="Supprimer la ligne"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Légendes colonnes */}
                    <div className="flex items-center gap-2 px-0.5">
                        <span className="flex-3 text-[10px] text-gray-400">Produit</span>
                        <span className="flex-2 text-[10px] text-gray-400">Prix unitaire</span>
                        <span className="flex-1 text-[10px] text-gray-400 text-center">Qté</span>
                        <span className="w-24 text-[10px] text-gray-400 text-right">
                            Sous-total
                        </span>
                        <span className="w-7" />
                    </div>

                    <button
                        type="button"
                        onClick={addLine}
                        className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors w-fit"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Ajouter un produit
                    </button>
                </div>

                {/* Client */}
                <div>
                    <label className={labelCls}>Client</label>
                    <input
                        type="text"
                        placeholder="Nom du client (optionnel)"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className={inputCls}
                    />
                </div>

                {/* Note */}
                <div>
                    <label className={labelCls}>Note</label>
                    <textarea
                        rows={2}
                        placeholder="Remarque sur la commande (optionnel)"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className={inputCls + " resize-none"}
                    />
                </div>

                {/* Total + Actions */}
                <div className="border-t border-gray-100 pt-6 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500">Total estimé</p>
                        <p className="text-2xl font-bold text-gray-900 tracking-tight">
                            {total.toLocaleString("fr-FR")} Fc
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard/orders"
                            className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-2"
                        >
                            Annuler
                        </Link>
                        <button
                            type="submit"
                            disabled={!valid || loading}
                            className="text-sm font-semibold bg-purple-600 text-white px-5 py-2.5 rounded hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {loading ? "Création..." : "Créer la commande"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default function OrderNewPage() {
    return (
        <div className="flex-1 flex items-start justify-center p-8">
            <Suspense fallback={<div className="text-sm text-gray-400">Chargement...</div>}>
                <OrderNewForm />
            </Suspense>
        </div>
    );
}
