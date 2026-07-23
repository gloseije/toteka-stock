import Link from "next/link";
import { Plus, ShoppingCart } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SaleLine {
    productName: string;
    quantity: number;
}

interface Sale {
    id: string;
    createdAt: string;
    lines: SaleLine[];
    customerName: string | null;
    total: number;
    paymentMethod: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DATE_FILTERS = ["Aujourd'hui", "Cette semaine", "Ce mois"] as const;

function formatDate(iso: string) {
    return new Date(iso).toLocaleString("fr-FR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function summarizeLines(lines: SaleLine[]) {
    return lines.map((l) => `${l.productName} ×${l.quantity}`).join(", ");
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SalesPage() {
    // TODO: récupérer depuis l'API avec filtre de date
    const sales: Sale[] = [];

    return (
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl w-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Ventes</h1>
                <Link
                    href="/dashboard/sales/new"
                    className="flex items-center gap-2 text-sm font-semibold bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Nouvelle vente
                </Link>
            </div>

            {/* Filtre par période */}
            <div className="flex items-center gap-1">
                {DATE_FILTERS.map((label, i) => (
                    <button
                        key={label}
                        className={`text-sm px-3 py-1.5 rounded transition-colors ${
                            i === 0
                                ? "bg-purple-50 text-purple-700 font-semibold"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Table / Empty state */}
            {sales.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded flex flex-col items-center justify-center py-20 gap-3">
                    <ShoppingCart className="w-10 h-10 text-gray-200" />
                    <p className="text-sm font-medium text-gray-500">Aucune vente</p>
                    <p className="text-xs text-gray-400 text-center max-w-xs">
                        Enregistrez une vente pour qu'elle apparaisse ici.
                    </p>
                    <Link
                        href="/dashboard/sales/new"
                        className="mt-2 text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                    >
                        Enregistrer une vente
                    </Link>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                                    Date
                                </th>
                                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                                    Produits
                                </th>
                                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                                    Client
                                </th>
                                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                                    Paiement
                                </th>
                                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">
                                    Montant
                                </th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {sales.map((sale) => (
                                <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                        {formatDate(sale.createdAt)}
                                    </td>
                                    <td className="px-4 py-3 text-gray-900 max-w-[220px] truncate">
                                        {summarizeLines(sale.lines)}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {sale.customerName ?? "—"}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {sale.paymentMethod}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                                        {sale.total.toLocaleString("fr-FR")} Fc
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            href={`/dashboard/sales/${sale.id}`}
                                            className="text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors"
                                        >
                                            Voir
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
