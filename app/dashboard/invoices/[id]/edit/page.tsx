"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

// ─── Shared classes ───────────────────────────────────────────────────────────

const inputCls =
    "w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-purple-600 transition-colors bg-white";

const labelCls = "block text-xs font-semibold text-gray-700 mb-1.5";

// ─── Types ────────────────────────────────────────────────────────────────────

interface InvoiceItem {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    price: number;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InvoiceEditPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    const [customerId, setCustomerId] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // TODO: GET /api/invoices/:id et pré-remplir les champs
    }, [params.id]);

    // ── Actions ───────────────────────────────────────────────────────────────

    const addItem = () => {
        const newItem: InvoiceItem = {
            id: Math.random().toString(36).substr(2, 9),
            productId: "",
            productName: "",
            quantity: 1,
            price: 0,
        };
        setItems([...items, newItem]);
    };

    const removeItem = (id: string) => {
        setItems(items.filter((item) => item.id !== id));
    };

    const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
        setItems(
            items.map((item) => {
                if (item.id === id) {
                    return { ...item, [field]: value };
                }
                return item;
            })
        );
    };

    // ── Calculations ──────────────────────────────────────────────────────────

    const total = items.reduce((acc, item) => acc + item.quantity * item.price, 0);

    // ── Validation ─────────────────────────────────────────────────────────────

    const valid =
        customerId &&
        dueDate &&
        items.length > 0 &&
        items.every((i) => i.productId && i.quantity > 0 && i.price > 0);

    // ── Submit ─────────────────────────────────────────────────────────────────

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        if (!valid) return;
        setLoading(true);
        try {
            // TODO: PATCH /api/invoices/:id
            router.push(`/dashboard/invoices/${params.id}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center p-8">
            <div className="w-full max-w-7xl bg-white border border-gray-200 rounded p-8 flex flex-col gap-8">
                {/* Header */}
                <div>
                    <Link
                        href={`/dashboard/invoices/${params.id}`}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Retour au détail
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900">Modifier la facture</h1>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                    {/* Infos générales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-gray-100">
                        <div>
                            <label className={labelCls}>Client *</label>
                            <select
                                value={customerId}
                                onChange={(e) => setCustomerId(e.target.value)}
                                className={inputCls}
                                required
                            >
                                <option value="">Sélectionner un client</option>
                                <option value="1">Jean Dupont</option>
                                <option value="2">Marie Kalala</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Date d'échéance *</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className={inputCls}
                                required
                            />
                        </div>
                    </div>

                    {/* Articles */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-gray-900">Articles</h2>
                            <button
                                type="button"
                                onClick={addItem}
                                className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Ajouter un article
                            </button>
                        </div>

                        {items.length === 0 ? (
                            <div className="border-2 border-dashed border-gray-100 rounded py-10 flex flex-col items-center justify-center gap-2">
                                <p className="text-xs text-gray-400">Aucun article ajouté</p>
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="text-xs font-semibold text-purple-600"
                                >
                                    Cliquer pour ajouter
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-end gap-3 animate-in fade-in slide-in-from-top-1 duration-200"
                                    >
                                        <div className="flex-1">
                                            <label className={labelCls}>Produit</label>
                                            <select
                                                value={item.productId}
                                                onChange={(e) =>
                                                    updateItem(item.id, "productId", e.target.value)
                                                }
                                                className={inputCls}
                                            >
                                                <option value="">Sélectionner</option>
                                                <option value="p1">Produit A</option>
                                                <option value="p2">Produit B</option>
                                            </select>
                                        </div>
                                        <div className="w-24">
                                            <label className={labelCls}>Qté</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    updateItem(
                                                        item.id,
                                                        "quantity",
                                                        parseInt(e.target.value) || 0
                                                    )
                                                }
                                                className={inputCls}
                                            />
                                        </div>
                                        <div className="w-32">
                                            <label className={labelCls}>Prix unit.</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={item.price}
                                                onChange={(e) =>
                                                    updateItem(
                                                        item.id,
                                                        "price",
                                                        parseInt(e.target.value) || 0
                                                    )
                                                }
                                                className={inputCls}
                                            />
                                        </div>
                                        <div className="w-32">
                                            <label className={labelCls}>Total</label>
                                            <div className="bg-gray-50 border border-transparent rounded px-3 py-2 text-sm text-gray-500">
                                                {(item.quantity * item.price).toLocaleString(
                                                    "fr-FR"
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(item.id)}
                                            className="p-2.5 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Résumé */}
                    <div className="bg-gray-50 rounded p-6 flex flex-col items-end gap-1 mt-4">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Total facture
                        </span>
                        <span className="text-2xl font-bold text-gray-900">
                            {total.toLocaleString("fr-FR")} Fc
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="border-t border-gray-100 pt-8 flex items-center justify-end gap-3">
                        <Link
                            href={`/dashboard/invoices/${params.id}`}
                            className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-2"
                        >
                            Annuler
                        </Link>
                        <button
                            type="submit"
                            disabled={!valid || loading}
                            className="text-sm font-semibold bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {loading ? "Enregistrement..." : "Enregistrer les modifications"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
