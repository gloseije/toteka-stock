"use client";

import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/currency";
import { formatDateTime } from "@/lib/date";
import type { Currency } from "@prisma/client";
import { SaleListApi } from "@/types";
import { paymentMethodLabel } from "@/lib/sales-utils";

interface SalesTableProps {
    sales: SaleListApi[];
    currency: Currency;
}

function summarizeLines(sale: SaleListApi): string {
    return sale.items.map((item) => `${item.label} ×${item.quantity}`).join(", ");
}

export function SalesTable({ sales, currency }: SalesTableProps) {
    const router = useRouter();

    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="border-b border-gray-200 bg-purple-50/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                Produits
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                Client
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                Paiement
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                Montant
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                Date
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {sales.map((sale) => {
                            const href = `/dashboard/sales/${sale.id}`;
                            return (
                                <tr
                                    key={sale.id}
                                    className="cursor-pointer whitespace-nowrap transition hover:bg-gray-50/50"
                                    tabIndex={0}
                                    onClick={() => router.push(href)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            router.push(href);
                                        }
                                    }}
                                >
                                    <td className="max-w-56 truncate px-4 py-3 text-gray-900">
                                        {summarizeLines(sale)}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {sale.customer?.name ?? "—"}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {paymentMethodLabel(sale.paymentMethod)}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        {formatCurrency(Number(sale.totalAmount), currency)}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {formatDateTime(sale.soldAt)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
