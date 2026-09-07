"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { formatCurrency, roundCurrency, type Currency } from "@/lib/currency";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LineItem {
    key: string;
    productId: string;
    productName: string;
    unitPrice: number;
    quantity: number;
}

type PaymentMethod = "CASH" | "MOBILE_MONEY" | "BANK_TRANSFER" | "OTHER";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAYMENT_METHODS: Array<{ value: PaymentMethod; label: string }> = [
    { value: "CASH", label: "Espèces" },
    { value: "MOBILE_MONEY", label: "Mobile Money" },
    { value: "BANK_TRANSFER", label: "Virement" },
    { value: "OTHER", label: "Autre" },
];

// ─── Shared classes ───────────────────────────────────────────────────────────

const inputCls =
    "w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-purple-600 transition-colors bg-white";

const labelCls = "block text-xs font-semibold text-gray-700 mb-1.5";

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

export default function SaleEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [lines, setLines] = useState<LineItem[]>([emptyLine()]);
    const [customerName, setCustomerName] = useState("");
    const [customerId, setCustomerId] = useState<string | null>(null);
    const [payment, setPayment] = useState<PaymentMethod>("CASH");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [shopCurrency, setShopCurrency] = useState<Currency>("CDF");

    useEffect(() => {
        const loadSale = async () => {
            const response = await fetch(`/api/sales/${id}`);
            if (!response.ok) return;
            const data = await response.json();
            setCustomerId(data.customerId ?? null);
            setCustomerName(data.customer?.name ?? "");
            setPayment(data.paymentMethod ?? "CASH");
            setNote(data.note ?? "");
            setShopCurrency(data.items?.[0]?.currency ?? "CDF");
            setLines(
                data.items.map(
                    (item: {
                        id: string;
                        productId: string;
                        product: { name: string };
                        unitPrice: number;
                        quantity: number;
                    }) => ({
                        key: item.id,
                        productId: item.productId,
                        productName: item.product.name,
                        unitPrice: Number(item.unitPrice),
                        quantity: item.quantity,
                    })
                )
            );
        };
        void loadSale();
    }, [id]);

    // ── Ligne ──────────────────────────────────────────────────────────────────

    const updateLine = (key: string, patch: Partial<LineItem>) =>
        setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));

    const removeLine = (key: string) => setLines((prev) => prev.filter((l) => l.key !== key));

    const addLine = () => setLines((prev) => [...prev, emptyLine()]);

    // ── Total ──────────────────────────────────────────────────────────────────

    const total = roundCurrency(
        lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0),
        shopCurrency
    );

    // ── Validation ─────────────────────────────────────────────────────────────

    const valid = lines.every((l) => l.productName.trim() && l.unitPrice > 0 && l.quantity > 0);

    // ── Submit ─────────────────────────────────────────────────────────────────

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        if (!valid) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/sales/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerId,
                    paymentMethod: payment,
                    note: note || null,
                    items: lines.map(({ productId, quantity, unitPrice }) => ({
                        productId,
                        quantity,
                        unitPrice,
                    })),
                }),
            });
            if (!response.ok) {
                alert("Erreur lors de la modification de la vente.");
                setLoading(false);
                return;
            }
            router.push(`/dashboard/sales/${id}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-start justify-center p-4 sm:p-8 min-w-0">
            <div className="w-full max-w-7xl bg-white border border-gray-200 rounded p-4 sm:p-8 flex flex-col gap-8">
                {/* Header */}
                <div>
                    <Link
                        href={`/dashboard/sales/${id}`}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Retour à la vente
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900">Modifier la vente</h1>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                    {/* Produits */}
                    <div className="flex flex-col gap-3">
                        <label className={labelCls}>Produits *</label>

                        <div className="flex flex-col gap-2">
                            {lines.map((line) => (
                                <div key={line.key} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Nom du produit"
                                        value={line.productName}
                                        onChange={(e) =>
                                            updateLine(line.key, { productName: e.target.value })
                                        }
                                        className={inputCls + " flex-3"}
                                    />
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
                                        className={inputCls + " flex-2"}
                                    />
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
                                    <span className="text-sm text-gray-500 w-24 text-right shrink-0">
                                        {formatCurrency(
                                            roundCurrency(
                                                line.unitPrice * line.quantity,
                                                shopCurrency
                                            ),
                                            shopCurrency
                                        )}
                                    </span>
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

                        <div className="flex items-center gap-2 px-0.5">
                            <span className="flex-3 text-[10px] text-gray-400">Produit</span>
                            <span className="flex-2 text-[10px] text-gray-400">Prix unitaire</span>
                            <span className="flex-1 text-[10px] text-gray-400 text-center">
                                Qté
                            </span>
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

                    {/* Mode de paiement */}
                    <div>
                        <label className={labelCls}>Mode de paiement *</label>
                        <div className="flex flex-wrap gap-2">
                            {PAYMENT_METHODS.map((method) => (
                                <button
                                    key={method.value}
                                    type="button"
                                    onClick={() => setPayment(method.value)}
                                    className={`text-sm px-3 py-1.5 rounded border transition-colors ${
                                        payment === method.value
                                            ? "border-purple-600 bg-purple-50 text-purple-700 font-semibold"
                                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                                    }`}
                                >
                                    {method.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Note */}
                    <div>
                        <label className={labelCls}>Note</label>
                        <textarea
                            rows={2}
                            placeholder="Remarque sur la vente (optionnel)"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className={inputCls + " resize-none"}
                        />
                    </div>

                    {/* Total + Actions */}
                    <div className="border-t border-gray-100 pt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div>
                            <p className="text-xs text-gray-500">Total</p>
                            <p className="text-2xl font-bold text-gray-900 tracking-tight">
                                {formatCurrency(total, shopCurrency)}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href={`/dashboard/sales/${id}`}
                                className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-2"
                            >
                                Annuler
                            </Link>
                            <button
                                type="submit"
                                disabled={!valid || loading}
                                className="text-sm font-semibold bg-purple-600 text-white px-5 py-2.5 rounded hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {loading ? "Enregistrement..." : "Enregistrer les modifications"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
