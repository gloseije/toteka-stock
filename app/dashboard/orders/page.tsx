import Link from "next/link";
import { Plus, Package2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = "PENDING" | "COMPLETED" | "CANCELLED";

interface OrderLine {
    productName: string;
    quantity: number;
}

interface Order {
    id: string;
    createdAt: string;
    status: OrderStatus;
    customerName: string | null;
    total: number;
    lines: OrderLine[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<OrderStatus, { label: string; cls: string }> = {
    PENDING: { label: "En attente", cls: "bg-yellow-50 text-yellow-700" },
    COMPLETED: { label: "Terminée", cls: "bg-green-50 text-green-700" },
    CANCELLED: { label: "Annulée", cls: "bg-red-50 text-red-600" },
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleString("fr-FR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function summarizeLines(lines: OrderLine[]) {
    return lines.map((l) => `${l.productName} ×${l.quantity}`).join(", ");
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function OrdersPage() {
    // TODO: récupérer depuis l'API
    const orders: Order[] = [];

    return (
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl w-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Commandes</h1>
                <Link
                    href="/dashboard/orders/new"
                    className="flex items-center gap-2 text-sm font-semibold bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Nouvelle commande
                </Link>
            </div>

            {/* Table / Empty state */}
            {orders.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded flex flex-col items-center justify-center py-20 gap-3">
                    <Package2 className="w-10 h-10 text-gray-200" />
                    <p className="text-sm font-medium text-gray-500">Aucune commande</p>
                    <p className="text-xs text-gray-400 text-center max-w-xs">
                        Créez votre première commande pour suivre vos réservations clients.
                    </p>
                    <Link
                        href="/dashboard/orders/new"
                        className="mt-2 text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                    >
                        Créer une commande
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
                                    Statut
                                </th>
                                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                                    Produits
                                </th>
                                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                                    Client
                                </th>
                                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">
                                    Montant
                                </th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {orders.map((order) => {
                                const status = STATUS_MAP[order.status];
                                return (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`text-[11px] font-semibold px-2 py-0.5 rounded ${status.cls}`}
                                            >
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-900 max-w-[220px] truncate">
                                            {summarizeLines(order.lines)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {order.customerName ?? "-"}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                                            {order.total.toLocaleString("fr-FR")} Fc
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={`/dashboard/orders/${order.id}`}
                                                className="text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors"
                                            >
                                                Voir
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
