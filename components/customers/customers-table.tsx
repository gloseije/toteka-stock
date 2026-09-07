import Link from "next/link";
import { Phone, MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import type { Currency } from "@prisma/client";

interface Customer {
    id: string;
    name: string;
    phone: string | null;
    whatsapp: string | null;
    address: string | null;
    totalSales: number;
    totalSpent: number;
    createdAt: Date;
}

interface CustomersTableProps {
    customers: Customer[];
    currency: Currency;
}

export function CustomersTable({ customers, currency }: CustomersTableProps) {
    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="border-b border-gray-200 bg-purple-50/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                Client
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                Contact
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                                Achats
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                                Total dépensé
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                Inscrit le
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {customers.map((customer) => (
                            <tr key={customer.id} className="group transition hover:bg-gray-50/50">
                                <td className="px-4 py-3">
                                    <Link
                                        href={`/dashboard/customers/${customer.id}`}
                                        className="block font-medium text-gray-900 transition hover:text-purple-700"
                                    >
                                        {customer.name}
                                    </Link>
                                </td>
                                <td className="px-4 py-3 text-gray-500">
                                    <div className="flex flex-col gap-0.5">
                                        {customer.phone && (
                                            <div className="flex items-center gap-1.5">
                                                <Phone className="size-3 text-gray-300" />
                                                <span>{customer.phone}</span>
                                            </div>
                                        )}
                                        {customer.address && (
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="size-3 text-gray-300" />
                                                <span className="truncate max-w-40">
                                                    {customer.address}
                                                </span>
                                            </div>
                                        )}
                                        {!customer.phone && !customer.address && (
                                            <span className="text-gray-300 italic">
                                                Aucun contact
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right font-medium text-gray-900">
                                    {customer.totalSales}
                                </td>
                                <td className="px-4 py-3 text-right font-medium text-gray-900">
                                    {formatCurrency(customer.totalSpent, currency)}
                                </td>
                                <td className="px-4 py-3 text-gray-500">
                                    {formatDate(customer.createdAt)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
