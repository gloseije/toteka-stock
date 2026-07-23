import Link from "next/link";
import { Plus, Search, FileText, Download, ExternalLink } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "CANCELLED";

interface Invoice {
    id: string;
    number: string;
    customerName: string;
    amount: number;
    status: InvoiceStatus;
    dueDate: string;
    createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function getStatusStyles(status: InvoiceStatus) {
    switch (status) {
        case "PAID":
            return "bg-green-50 text-green-700 border-green-100";
        case "SENT":
            return "bg-blue-50 text-blue-700 border-blue-100";
        case "DRAFT":
            return "bg-gray-50 text-gray-600 border-gray-100";
        case "CANCELLED":
            return "bg-red-50 text-red-700 border-red-100";
        default:
            return "bg-gray-50 text-gray-600 border-gray-100";
    }
}

function translateStatus(status: InvoiceStatus) {
    switch (status) {
        case "PAID": return "Payée";
        case "SENT": return "Envoyée";
        case "DRAFT": return "Brouillon";
        case "CANCELLED": return "Annulée";
        default: return status;
    }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function InvoicesPage() {
    // TODO: récupérer les factures depuis l'API
    const invoices: Invoice[] = [];

    return (
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl w-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Factures</h1>
                <Link
                    href="/dashboard/invoices/new"
                    className="flex items-center gap-2 text-sm font-semibold bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Nouvelle facture
                </Link>
            </div>

            {/* Filtres */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher une facture..."
                        className="w-full border border-gray-200 rounded pl-9 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-purple-600 transition-colors bg-white"
                    />
                </div>
            </div>

            {/* Table */}
            {invoices.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded flex flex-col items-center justify-center py-20 gap-3">
                    <FileText className="w-10 h-10 text-gray-200" />
                    <p className="text-sm font-medium text-gray-500">Aucune facture</p>
                    <p className="text-xs text-gray-400">
                        Créez votre première facture pour vos clients.
                    </p>
                    <Link
                        href="/dashboard/invoices/new"
                        className="mt-2 text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                    >
                        Créer une facture
                    </Link>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                                    N° Facture
                                </th>
                                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                                    Client
                                </th>
                                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">
                                    Montant
                                </th>
                                <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">
                                    Statut
                                </th>
                                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                                    Échéance
                                </th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        {inv.number}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {inv.customerName}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-900 font-medium">
                                        {inv.amount.toLocaleString("fr-FR")} Fc
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusStyles(inv.status)}`}>
                                                {translateStatus(inv.status).toUpperCase()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {formatDate(inv.dueDate)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                                                <Download className="w-4 h-4" />
                                            </button>
                                            <Link
                                                href={`/dashboard/invoices/${inv.id}`}
                                                className="p-1.5 text-purple-600 hover:text-purple-700 transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </Link>
                                        </div>
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
