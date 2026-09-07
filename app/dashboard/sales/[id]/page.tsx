import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireDashboardContext } from "@/lib/dashboard-guard";
import { formatCurrency } from "@/lib/currency";
import { formatDateTimeLong } from "@/lib/date";
import type { SaleWithDetails, SerializedSale } from "@/types";
import {
    ArrowLeft,
    Pencil,
    Share2,
    User,
    CreditCard,
    StickyNote,
    Package,
    TrendingUp,
    TrendingDown,
    Wallet,
} from "lucide-react";
import { InvoicePrintButton } from "@/components/invoice-print-button";

async function getSale(id: string): Promise<SaleWithDetails | null> {
    const { shop } = await requireDashboardContext({ id: true });
    return prisma.sale.findFirst({
        where: { id, shopId: shop.id },
        include: { customer: true, items: { include: { product: true } } },
    });
}

export default async function SaleDetailPage(props: { params: Promise<{ id: string }> }) {
    const sale = await getSale((await props.params).id);
    if (!sale) notFound();

    const currency = sale.items[0]?.currency ?? "CDF";

    // Conversion explicite des valeurs Decimal -> number
    const totalAmount = Number(sale.totalAmount);
    const totalCost = Number(sale.totalCost ?? 0);
    const profit = Number(sale.profit ?? 0);
    const isProfitPositive = profit >= 0;

    // Conversion de l'objet sale pour le composant client (Decimal -> number)
    const serializedSale: SerializedSale = {
        ...sale,
        totalAmount,
        totalCost,
        profit,
        items: sale.items.map((item) => ({
            ...item,
            unitPrice: Number(item.unitPrice),
            totalPrice: Number(item.totalPrice),
            totalCost: item.totalCost !== null ? Number(item.totalCost) : null,
            unitCost: item.unitCost !== null ? Number(item.unitCost) : null,
            product: {
                ...item.product,
                sellingPrice: Number(item.product.sellingPrice),
                purchasePrice: Number(item.product.purchasePrice),
            },
        })),
    };

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
            {/* Fil d'Ariane */}
            <nav className="flex items-center gap-1 text-sm text-gray-500">
                <Link href="/dashboard" className="hover:text-purple-600 transition">
                    Tableau de bord
                </Link>
                <span>/</span>
                <Link href="/dashboard/sales" className="hover:text-purple-600 transition">
                    Ventes
                </Link>
                <span>/</span>
                <span className="text-purple-700 font-medium">
                    #{sale.invoiceNumber || sale.id.slice(-6).toUpperCase()}
                </span>
            </nav>

            {/* En-tête */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Vente{" "}
                        <span className="text-purple-600">
                            #{sale.invoiceNumber || sale.id.slice(-6).toUpperCase()}
                        </span>
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">{formatDateTimeLong(sale.soldAt)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        href={`/dashboard/sales/${sale.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:border-gray-300"
                    >
                        <Pencil className="size-4" />
                        Modifier
                    </Link>
                    <InvoicePrintButton sale={serializedSale} />
                    <button className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:border-gray-300">
                        <Share2 className="size-4" />
                        Partager
                    </button>
                </div>
            </div>

            {/* Infos client, paiement, note */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <User className="size-4" />
                        <span className="font-medium">Client</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                        {sale.customer?.name ?? "—"}
                    </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CreditCard className="size-4" />
                        <span className="font-medium">Paiement</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-gray-900">{sale.paymentMethod}</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Wallet className="size-4" />
                        <span className="font-medium">Marge</span>
                    </div>
                    <div className={"mt-1 flex flex-row gap-2"}>
                        {isProfitPositive ? (
                            <TrendingUp className="size-4 inline text-green-600" />
                        ) : (
                            <TrendingDown className="size-4 inline text-red-600" />
                        )}
                        <span
                            className={
                                "text-sm font-medium" +
                                (isProfitPositive ? " text-green-600" : " text-red-600")
                            }
                        >
                            {formatCurrency(profit, currency)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tableau */}
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50/80">
                            <tr>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Produit
                                </th>
                                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Qté
                                </th>
                                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Prix unit.
                                </th>
                                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Total
                                </th>
                                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Coût
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {sale.items.map((item) => {
                                const unitPrice = Number(item.unitPrice);
                                const totalPrice = Number(item.totalPrice);
                                const totalCostItem =
                                    item.totalCost !== null ? Number(item.totalCost) : null;
                                return (
                                    <tr key={item.id} className="transition hover:bg-purple-50/30">
                                        <td className="px-5 py-3">
                                            <Link
                                                href={`/dashboard/products/${item.productId}`}
                                                className="text-gray-900 hover:text-purple-700 transition"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Package className="size-4 text-gray-400" />
                                                    {item.product.name}
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-5 py-3 text-right font-medium">
                                            {item.quantity}
                                        </td>
                                        <td className="px-5 py-3 text-right text-gray-600">
                                            {formatCurrency(unitPrice, item.currency)}
                                        </td>
                                        <td className="px-5 py-3 text-right font-semibold text-gray-900">
                                            {formatCurrency(totalPrice, item.currency)}
                                        </td>
                                        <td className="px-5 py-3 text-right text-gray-600">
                                            {totalCostItem === null
                                                ? "—"
                                                : formatCurrency(totalCostItem, item.currency)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="border-t border-gray-200 bg-gray-50/50">
                            <tr>
                                <td
                                    colSpan={3}
                                    className="px-5 py-3 text-right text-sm font-medium text-gray-700"
                                >
                                    Total
                                </td>
                                <td className="px-5 py-3 text-right text-sm font-bold text-purple-700">
                                    {formatCurrency(totalAmount, currency)}
                                </td>
                                <td className="px-5 py-3 text-right text-sm text-gray-600">
                                    {formatCurrency(totalCost, currency)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white  overflow-hidden">
                <div className="border-b border-gray-100 px-5 py-3 bg-gray-50/50">
                    <h2 className="text-xs font-bold text-gray-500 uppercase flex gap-2">
                        <StickyNote className="size-4" /> Note
                    </h2>
                </div>
                <div className="p-5">
                    <p className="text-sm text-gray-600 italic">
                        {sale.note ? `« ${sale.note} »` : "Aucune note."}
                    </p>
                </div>
            </div>

            {/* Retour */}
            <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
                <Link
                    href="/dashboard/sales"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-600 transition"
                >
                    <ArrowLeft className="size-4" />
                    Retour aux ventes
                </Link>
            </div>
        </div>
    );
}
