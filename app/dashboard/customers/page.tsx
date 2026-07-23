import Link from "next/link";
import { Plus, Search, Users, Phone, Mail } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Customer {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    totalOrders: number;
    totalSpent: number;
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CustomersPage() {
    // TODO: récupérer les clients depuis l'API
    const customers: Customer[] = [];

    return (
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl w-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Clients</h1>
                <Link
                    href="/dashboard/customers/new"
                    className="flex items-center gap-2 text-sm font-semibold bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Nouveau client
                </Link>
            </div>

            {/* Filtres */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher un client..."
                        className="w-full border border-gray-200 rounded pl-9 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-purple-600 transition-colors bg-white"
                    />
                </div>
            </div>

            {/* Table */}
            {customers.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded flex flex-col items-center justify-center py-20 gap-3">
                    <Users className="w-10 h-10 text-gray-200" />
                    <p className="text-sm font-medium text-gray-500">Aucun client</p>
                    <p className="text-xs text-gray-400">
                        Ajoutez votre premier client pour suivre ses achats.
                    </p>
                    <Link
                        href="/dashboard/customers/new"
                        className="mt-2 text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                    >
                        Ajouter un client
                    </Link>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                                    Client
                                </th>
                                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                                    Contact
                                </th>
                                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">
                                    Commandes
                                </th>
                                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">
                                    Total dépensé
                                </th>
                                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                                    Inscrit le
                                </th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {customers.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        {c.name}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        <div className="flex flex-col gap-0.5">
                                            {c.phone && (
                                                <div className="flex items-center gap-1.5">
                                                    <Phone className="w-3 h-3 text-gray-300" />
                                                    <span>{c.phone}</span>
                                                </div>
                                            )}
                                            {c.email && (
                                                <div className="flex items-center gap-1.5">
                                                    <Mail className="w-3 h-3 text-gray-300" />
                                                    <span>{c.email}</span>
                                                </div>
                                            )}
                                            {!c.phone && !c.email && <span className="text-gray-300">Aucun contact</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-900 font-medium">
                                        {c.totalOrders}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-900 font-medium">
                                        {c.totalSpent.toLocaleString("fr-FR")} Fc
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {formatDate(c.createdAt)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            href={`/dashboard/customers/${c.id}`}
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
