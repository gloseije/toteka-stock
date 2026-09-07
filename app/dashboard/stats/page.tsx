"use client";

import { useEffect, useState } from "react";
import { BarChart3, DollarSign, Package, TrendingUp } from "lucide-react";
import { formatCurrency, currencyLabel } from "@/lib/currency";
import { Skeleton } from "@/components/skeleton";

type Currency = "CDF" | "USD";
interface CurrencyTotal {
    currency: Currency;
    revenue: number;
    profit: number;
}
interface TopProduct {
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
    currency: Currency;
}
interface StatsData {
    revenue: number;
    profit: number;
    salesCount: number;
    topProducts: TopProduct[];
    currencies: CurrencyTotal[];
}

const money = (amount: number, currency: Currency) => formatCurrency(amount, currency);

export default function StatsPage() {
    const [from, setFrom] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date.toISOString().slice(0, 10);
    });
    const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
    const [data, setData] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `/api/dashboard/stats?from=${from}&to=${to}&groupBy=day`
                );
                if (!response.ok) {
                    setError("Impossible de charger les statistiques");
                    return;
                }
                setData((await response.json()) as StatsData);
            } catch (cause: unknown) {
                setError(cause instanceof Error ? cause.message : "Erreur serveur");
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [from, to]);

    const currencyItems = data?.currencies ?? [];
    const currencyCards = currencyItems.flatMap((item) => [
        {
            title: `Chiffre d'affaires (${currencyLabel(item.currency)})`,
            value: money(item.revenue, item.currency),
            Icon: DollarSign,
        },
        {
            title: `Bénéfice estimé (${currencyLabel(item.currency)})`,
            value: money(item.profit, item.currency),
            Icon: TrendingUp,
        },
    ]);
    const cards = [
        ...currencyCards,
        { title: "Ventes enregistrées", value: String(data?.salesCount ?? 0), Icon: BarChart3 },
        {
            title: "Produits vendus",
            value: String(data?.topProducts.reduce((sum, item) => sum + item.quantity, 0) ?? 0),
            Icon: Package,
        },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-8 max-w-7xl w-full">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Statistiques</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Analysez vos ventes sur la période choisie.
                    </p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <label className="text-gray-500">
                        Du{" "}
                        <input
                            type="date"
                            value={from}
                            onChange={(event) => setFrom(event.target.value)}
                            className="border border-gray-200 rounded px-2 py-1.5"
                        />
                    </label>
                    <label className="text-gray-500">
                        au{" "}
                        <input
                            type="date"
                            value={to}
                            onChange={(event) => setTo(event.target.value)}
                            className="border border-gray-200 rounded px-2 py-1.5"
                        />
                    </label>
                </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map(({ title, value, Icon }) => (
                    <div
                        key={title}
                        className="bg-white border border-gray-200 rounded p-6 flex flex-col gap-4 min-w-0"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {title}
                            </span>
                            <Icon className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="text-xl font-bold text-gray-900 wrap-break-word">
                            {loading ? <Skeleton className="h-7 w-24" /> : value}
                        </span>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white border border-gray-200 rounded p-6">
                    <h2 className="text-sm font-bold text-gray-900 mb-5">Répartition par devise</h2>
                    {data?.currencies.length ? (
                        data.currencies.map((item) => (
                            <div
                                key={item.currency}
                                className="flex items-center justify-between border-b border-gray-50 py-3 last:border-0"
                            >
                                <span className="text-sm font-semibold text-gray-700">
                                    {currencyLabel(item.currency)}
                                </span>
                                <span className="text-sm font-bold text-gray-900">
                                    {money(item.revenue, item.currency)}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">Aucune vente sur cette période.</p>
                    )}
                </div>
                <div className="bg-white border border-gray-200 rounded p-6">
                    <h2 className="text-sm font-bold text-gray-900 mb-5">
                        Produits les plus vendus
                    </h2>
                    {data?.topProducts.length ? (
                        data.topProducts.map((item) => (
                            <div
                                key={item.productId}
                                className="flex items-center justify-between border-gray-50 py-3 not-last:border-b"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {item.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {item.quantity} unité{item.quantity > 1 ? "s" : ""}
                                    </p>
                                </div>
                                <span className="text-sm font-bold text-gray-900">
                                    {money(item.revenue, item.currency)}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">
                            Aucun produit vendu sur cette période.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
