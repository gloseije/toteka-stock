import Link from "next/link";
import { TrendingUp, ShoppingCart, ClipboardList, AlertTriangle } from "lucide-react";
import React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface KpiCard {
    label: string;
    value: string;
    Icon: React.ElementType;
    hint?: string;
}

// ─── KPI config ───────────────────────────────────────────────────────────────

const kpis: KpiCard[] = [
    {
        label: "CA du jour",
        value: "0 Fc",
        Icon: TrendingUp,
    },
    {
        label: "Ventes du jour",
        value: "0",
        Icon: ShoppingCart,
    },
    {
        label: "Commandes en cours",
        value: "0",
        Icon: ClipboardList,
    },
    {
        label: "Produits en rupture",
        value: "0",
        Icon: AlertTriangle,
    },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
    // TODO: remplacer par des appels API réels

    return (
        <div className="flex flex-col flex-1 p-4 sm:p-6 lg:p-8 gap-6 sm:gap-8 max-w-7xl w-full mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                    Tableau de bord
                </h1>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map(({ label, value, Icon, hint }) => (
                    <div
                        key={label}
                        className="bg-white border border-purple-100 rounded p-5 flex flex-col gap-3"
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-gray-500">{label}</p>
                            <div className="w-7 h-7 bg-purple-50 rounded flex items-center justify-center text-purple-600">
                                <Icon className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
                        {hint && <p className="text-xs text-gray-400">{hint}</p>}
                    </div>
                ))}
            </div>

            {/* Deux colonnes */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Ventes récentes */}
                <div className="bg-white border border-purple-100 rounded">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-purple-50">
                        <p className="text-sm font-semibold text-gray-900">Ventes récentes</p>
                        <Link
                            href="/dashboard/sales"
                            className="text-xs text-purple-600 hover:text-purple-700 transition-colors"
                        >
                            Voir tout
                        </Link>
                    </div>
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <ShoppingCart className="w-8 h-8 text-gray-200 mb-3" />
                        <p className="text-sm font-medium text-gray-500">
                            Aucune vente aujourd&apos;hui
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Enregistrez votre première vente pour la voir apparaître ici.
                        </p>
                        <Link
                            href="/dashboard/sales/new"
                            className="mt-4 text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                        >
                            Enregistrer une vente
                        </Link>
                    </div>
                </div>

                {/* Commandes en cours */}
                <div className="bg-white border border-purple-100 rounded">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-purple-50">
                        <p className="text-sm font-semibold text-gray-900">Commandes en cours</p>
                        <Link
                            href="/dashboard/orders"
                            className="text-xs text-purple-600 hover:text-purple-700 transition-colors"
                        >
                            Voir tout
                        </Link>
                    </div>
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <ClipboardList className="w-8 h-8 text-gray-200 mb-3" />
                        <p className="text-sm font-medium text-gray-500">
                            Aucune commande en cours
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Les commandes WhatsApp en attente de traitement apparaîtront ici.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stock critique */}
            <div className="bg-white border border-purple-100 rounded">
                <div className="flex items-center justify-between px-5 py-4 border-b border-purple-50">
                    <p className="text-sm font-semibold text-gray-900">Stock critique</p>
                    <Link
                        href="/dashboard/products"
                        className="text-xs text-purple-600 hover:text-purple-700 transition-colors"
                    >
                        Gérer les produits
                    </Link>
                </div>
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <AlertTriangle className="w-8 h-8 text-gray-200 mb-3" />
                    <p className="text-sm font-medium text-gray-500">Aucun produit en rupture</p>
                    <p className="text-xs text-gray-400 mt-1">
                        Les produits dont le stock est bas ou épuisé apparaîtront ici.
                    </p>
                </div>
            </div>
        </div>
    );
}
