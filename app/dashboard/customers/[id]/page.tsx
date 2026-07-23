import Link from "next/link";
import { ArrowLeft, Pencil, Phone, Mail, MapPin, ClipboardList, ShoppingBag } from "lucide-react";
import { notFound } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CustomerOrder {
    id: string;
    createdAt: string;
    status: "PENDING" | "COMPLETED" | "CANCELLED";
    total: number;
}

interface CustomerPurchase {
    id: string;
    createdAt: string;
    productName: string;
    quantity: number;
    total: number;
}

interface Customer {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    note: string | null;
    totalOrders: number;
    totalSpent: number;
    createdAt: string;
    recentOrders: CustomerOrder[];
    recentPurchases: CustomerPurchase[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

async function getCustomer(id: string): Promise<Customer | null> {
    // TODO: GET /api/customers/:id
    return null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string, full = false) {
    return new Date(iso).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: full ? "long" : "short",
        year: "numeric",
    });
}

function statusLabel(status: CustomerOrder["status"]) {
    switch (status) {
        case "COMPLETED":
            return { label: "Terminée", cls: "bg-green-50 text-green-700" };
        case "PENDING":
            return { label: "En attente", cls: "bg-yellow-50 text-yellow-700" };
        case "CANCELLED":
            return { label: "Annulée", cls: "bg-red-50 text-red-600" };
    }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
    const customer = await getCustomer(params.id);
    if (!customer) notFound();

    return (
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl w-full">
            {/* Back */}
            <Link
                href="/dashboard/customers"
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors w-fit"
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                Clients
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{customer.name}</h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        Client depuis le {formatDate(customer.createdAt, true)}
                    </p>
                </div>
                <Link
                    href={`/dashboard/customers/${customer.id}/edit`}
                    className="flex items-center gap-1.5 text-sm font-medium border border-gray-200 text-gray-600 px-3 py-2 rounded hover:border-gray-300 hover:text-gray-900 transition-colors"
                >
                    <Pencil className="w-3.5 h-3.5" />
                    Modifier
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Colonne Gauche : Infos */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white border border-gray-200 rounded divide-y divide-gray-100">
                        <div className="px-5 py-4">
                            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Informations de contact
                            </h2>
                        </div>
                        <div className="px-5 py-4 flex flex-col gap-4">
                            <div className="flex items-start gap-3">
                                <Mail className="w-4 h-4 text-gray-300 mt-0.5" />
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs text-gray-400">Email</span>
                                    <span className="text-sm text-gray-900">
                                        {customer.email ?? "—"}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="w-4 h-4 text-gray-300 mt-0.5" />
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs text-gray-400">Téléphone</span>
                                    <span className="text-sm text-gray-900">
                                        {customer.phone ?? "—"}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-gray-300 mt-0.5" />
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs text-gray-400">Adresse</span>
                                    <span className="text-sm text-gray-900">
                                        {customer.address ?? "—"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded p-5 flex flex-col gap-4">
                        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Note interne
                        </h2>
                        <p className="text-sm text-gray-600 leading-relaxed italic">
                            {customer.note ? `«\u00A0${customer.note}\u00A0»` : "Aucune note."}
                        </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded p-5 grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-400">Total dépensé</span>
                            <span className="text-lg font-bold text-gray-900">
                                {customer.totalSpent.toLocaleString("fr-FR")} Fc
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-400">Commandes</span>
                            <span className="text-lg font-bold text-gray-900">
                                {customer.totalOrders}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Colonne Droite : Historique */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Commandes Récentes */}
                    <div className="bg-white border border-gray-200 rounded overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                            <ClipboardList className="w-4 h-4 text-purple-600" />
                            <h2 className="text-sm font-bold text-gray-900">Commandes récentes</h2>
                        </div>
                        {customer.recentOrders.length === 0 ? (
                            <div className="px-5 py-8 text-center">
                                <p className="text-sm text-gray-400">Aucune commande enregistrée.</p>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <tbody className="divide-y divide-gray-50">
                                    {customer.recentOrders.map((order) => {
                                        const status = statusLabel(order.status);
                                        return (
                                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-5 py-3 text-gray-500">
                                                    {formatDate(order.createdAt)}
                                                </td>
                                                <td className="px-5 py-3 font-medium text-gray-900">
                                                    #{order.id.slice(-6).toUpperCase()}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${status.cls}`}>
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-right font-bold text-gray-900 text-xs">
                                                    {order.total.toLocaleString("fr-FR")} Fc
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <Link
                                                        href={`/dashboard/orders/${order.id}`}
                                                        className="text-xs font-medium text-purple-600 hover:text-purple-700"
                                                    >
                                                        Détails
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Achats Récents */}
                    <div className="bg-white border border-gray-200 rounded overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-purple-600" />
                            <h2 className="text-sm font-bold text-gray-900">Derniers articles achetés</h2>
                        </div>
                        {customer.recentPurchases.length === 0 ? (
                            <div className="px-5 py-8 text-center">
                                <p className="text-sm text-gray-400">Aucun achat enregistré.</p>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <tbody className="divide-y divide-gray-50">
                                    {customer.recentPurchases.map((purchase, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-3 text-gray-500 w-32">
                                                {formatDate(purchase.createdAt)}
                                            </td>
                                            <td className="px-5 py-3 font-medium text-gray-900">
                                                {purchase.productName}
                                            </td>
                                            <td className="px-5 py-3 text-gray-500">
                                                ×{purchase.quantity}
                                            </td>
                                            <td className="px-5 py-3 text-right font-medium text-gray-900">
                                                {purchase.total.toLocaleString("fr-FR")} Fc
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
