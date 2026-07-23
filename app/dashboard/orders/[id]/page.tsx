import Link from "next/link";
import { ArrowLeft, RefreshCcw, Pencil, ShoppingCart } from "lucide-react";
import { notFound } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = "PENDING" | "COMPLETED" | "CANCELLED";

interface OrderLine {
    productId: string;
    productName: string;
    unitPrice: number;
    quantity: number;
}

interface Order {
    id: string;
    createdAt: string;
    status: OrderStatus;
    customerName: string | null;
    note: string | null;
    total: number;
    lines: OrderLine[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

async function getOrder(id: string): Promise<Order | null> {
    // TODO: GET /api/orders/:id
    return null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<OrderStatus, { label: string; cls: string }> = {
    PENDING: { label: "En attente", cls: "bg-yellow-50 text-yellow-700" },
    COMPLETED: { label: "Terminée", cls: "bg-green-50 text-green-700" },
    CANCELLED: { label: "Annulée", cls: "bg-red-50 text-red-600" },
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
    const order = await getOrder(params.id);
    if (!order) notFound();

    const status = STATUS_MAP[order.status];

    return (
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl w-full">
            {/* Back */}
            <Link
                href="/dashboard/orders"
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors w-fit"
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                Commandes
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-gray-900">
                            Commande #{order.id.slice(-6).toUpperCase()}
                        </h1>
                        <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded ${status.cls}`}
                        >
                            {status.label}
                        </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Link
                        href={`/dashboard/orders/${order.id}/edit`}
                        className="flex items-center gap-1.5 text-sm font-medium border border-gray-200 text-gray-600 px-3 py-2 rounded hover:border-gray-300 hover:text-gray-900 transition-colors"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                        Modifier
                    </Link>

                    {/* Actions de changement de statut simulées (TODO: implémenter logic) */}
                    <button className="flex items-center gap-1.5 text-sm font-medium border border-gray-200 text-gray-600 px-3 py-2 rounded hover:border-gray-300 hover:text-gray-900 transition-colors">
                        <RefreshCcw className="w-3.5 h-3.5" />
                        Statut
                    </button>

                    <button className="flex items-center gap-1.5 text-sm font-medium bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 transition-colors">
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Convertir en vente
                    </button>
                </div>
            </div>

            {/* Lignes de produits */}
            <div className="bg-white border border-gray-200 rounded overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500">Produits</p>
                </div>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-50">
                            <th className="text-left text-xs text-gray-400 font-medium px-5 py-2.5">
                                Produit
                            </th>
                            <th className="text-right text-xs text-gray-400 font-medium px-5 py-2.5">
                                Qté
                            </th>
                            <th className="text-right text-xs text-gray-400 font-medium px-5 py-2.5">
                                Prix unit.
                            </th>
                            <th className="text-right text-xs text-gray-400 font-medium px-5 py-2.5">
                                Total
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {order.lines.map((line, i) => (
                            <tr key={i}>
                                <td className="px-5 py-3 text-gray-900">
                                    <Link
                                        href={`/dashboard/products/${line.productId}`}
                                        className="hover:text-purple-700 transition-colors"
                                    >
                                        {line.productName}
                                    </Link>
                                </td>
                                <td className="px-5 py-3 text-right text-gray-500">
                                    {line.quantity}
                                </td>
                                <td className="px-5 py-3 text-right text-gray-500">
                                    {line.unitPrice.toLocaleString("fr-FR")} Fc
                                </td>
                                <td className="px-5 py-3 text-right font-medium text-gray-900">
                                    {(line.unitPrice * line.quantity).toLocaleString("fr-FR")} Fc
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="border-t border-gray-100 bg-gray-50">
                            <td
                                colSpan={3}
                                className="px-5 py-3 text-sm font-semibold text-gray-900 text-right"
                            >
                                Total
                            </td>
                            <td className="px-5 py-3 text-right text-sm font-bold text-gray-900">
                                {order.total.toLocaleString("fr-FR")} Fc
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Infos complémentaires */}
            <div className="bg-white border border-gray-200 rounded divide-y divide-gray-100">
                {[
                    ["Client", order.customerName ?? "-"],
                    ["Note", order.note ?? "-"],
                ].map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between px-5 py-3">
                        <span className="text-xs text-gray-400">{key}</span>
                        <span className="text-sm text-gray-900">{val}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
