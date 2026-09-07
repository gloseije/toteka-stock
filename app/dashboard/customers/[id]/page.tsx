import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireDashboardContext } from "@/lib/dashboard-guard";
import { formatCurrency } from "@/lib/currency";
import { formatDate, formatDateTimeLong } from "@/lib/date";
import {
    ArrowLeft,
    Pencil,
    Phone,
    MapPin,
    MessageSquare,
    StickyNote,
    Wallet,
    Calendar,
    Package,
    Receipt,
} from "lucide-react";
import { CustomerDeleteButton } from "@/components/customers/customer-delete-button";

async function getCustomer(id: string, shopId: string) {
    return prisma.customer.findFirst({
        where: { id, shopId },
        include: {
            sales: {
                include: {
                    items: {
                        include: {
                            product: { select: { id: true, name: true } },
                        },
                    },
                },
                orderBy: { soldAt: "desc" },
            },
        },
    });
}

export default async function CustomerDetailPage(props: { params: Promise<{ id: string }> }) {
    const { shop } = await requireDashboardContext();
    const customer = await getCustomer((await props.params).id, shop.id);
    if (!customer) notFound();

    const totalSpent = customer.sales.reduce((acc, sale) => acc + Number(sale.totalAmount), 0);
    const salesCount = customer.sales.length;
    const lastSale = customer.sales[0];

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
            {/* Fil d'Ariane */}
            <nav className="flex items-center gap-1 text-sm text-gray-500">
                <Link href="/dashboard" className="hover:text-purple-600 transition">
                    Tableau de bord
                </Link>
                <span>/</span>
                <Link href="/dashboard/customers" className="hover:text-purple-600 transition">
                    Clients
                </Link>
                <span>/</span>
                <span className="text-purple-700 font-medium">{customer.name}</span>
            </nav>

            {/* En-tête */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">{customer.name}</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Client depuis le {formatDate(customer.createdAt, { full: true })}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <CustomerDeleteButton customerId={customer.id} />
                    <Link
                        href={`/dashboard/customers/${customer.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:border-gray-300"
                    >
                        <Pencil className="size-4" />
                        Modifier
                    </Link>
                </div>
            </div>

            {/* Cartes d'info */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Wallet className="size-4" />
                        <span className="font-medium">Total dépensé</span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-purple-700">
                        {formatCurrency(totalSpent, shop.currency)}
                    </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Receipt className="size-4" />
                        <span className="font-medium">Nombre de ventes</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-gray-900">{salesCount}</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="size-4" />
                        <span className="font-medium">Dernier achat</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                        {lastSale ? formatDate(lastSale.soldAt, { full: true }) : "Aucun"}
                    </p>
                </div>
            </div>

            {/* Coordonnées */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Phone className="size-4" />
                        <span className="font-medium">Téléphone</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                        {customer.phone ?? "—"}
                    </p>
                </div>
                {customer.whatsapp && (
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MessageSquare className="size-4" />
                            <span className="font-medium">WhatsApp</span>
                        </div>
                        <p className="mt-1 text-sm font-medium text-gray-900">
                            {customer.whatsapp}
                        </p>
                    </div>
                )}
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="size-4" />
                        <span className="font-medium">Adresse</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                        {customer.address ?? "—"}
                    </p>
                </div>
            </div>

            {/* Historique des ventes */}
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50/80">
                            <tr>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Vente
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Produits
                                </th>
                                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Montant
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {customer.sales.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-5 py-8 text-center text-sm text-gray-500"
                                    >
                                        Aucune vente enregistrée
                                    </td>
                                </tr>
                            ) : (
                                customer.sales.map((sale) => (
                                    <tr key={sale.id} className="transition hover:bg-purple-50/30">
                                        <td className="px-5 py-3">
                                            <Link
                                                href={`/dashboard/sales/${sale.id}`}
                                                className="text-gray-900 hover:text-purple-700 transition font-medium"
                                            >
                                                #
                                                {sale.invoiceNumber ||
                                                    sale.id.slice(-6).toUpperCase()}
                                            </Link>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {sale.items.map((item) => (
                                                    <span
                                                        key={item.id}
                                                        className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
                                                    >
                                                        <Package className="size-3 text-gray-400" />
                                                        {item.product.name} ×{item.quantity}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-right font-semibold text-gray-900">
                                            {formatCurrency(
                                                Number(sale.totalAmount),
                                                sale.items[0]?.currency ?? shop.currency
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-gray-500">
                                            {formatDateTimeLong(sale.soldAt)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Note */}
            <div className="rounded-lg border border-gray-200 bg-white  overflow-hidden">
                <div className="border-b border-gray-100 px-5 py-3 bg-gray-50/50">
                    <h2 className="text-xs font-bold text-gray-500 uppercase flex gap-2">
                        <StickyNote className="size-4" /> Note
                    </h2>
                </div>
                <div className="p-5">
                    <p className="text-sm text-gray-600 italic">
                        {customer.note ? `« ${customer.note} »` : "Aucune note."}
                    </p>
                </div>
            </div>

            {/* Retour */}
            <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
                <Link
                    href="/dashboard/customers"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-600 transition"
                >
                    <ArrowLeft className="size-4" />
                    Retour aux clients
                </Link>
            </div>
        </div>
    );
}
