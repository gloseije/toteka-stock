import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface Product {
    id: string;
    name: string;
    stock: number;
    sellingPrice: number;
    currency: "CDF" | "USD";
    category?: { name: string } | null;
    images: { key: string; url?: string | null }[];
}

interface ProductsGridProps {
    products: Product[];
}

function stockStatus(stock: number) {
    if (stock === 0) return { label: "Rupture", cls: "bg-red-50 text-red-600" };
    if (stock <= 5) return { label: "Stock bas", cls: "bg-yellow-50 text-yellow-700" };
    return { label: "En stock", cls: "bg-green-50 text-green-700" };
}

export function ProductsGrid({ products }: ProductsGridProps) {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {products.map((p) => {
                const status = stockStatus(p.stock);
                return (
                    <Link
                        key={p.id}
                        href={`/dashboard/products/${p.id}`}
                        className="group flex flex-row items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 transition hover:border-gray-300 hover:shadow-md"
                    >
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-gray-100 bg-gray-50">
                            {p.images[0]?.key ? (
                                <Image
                                    src={p.images[0].url ?? `/api/images/${p.images[0].key}`}
                                    alt={p.name}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    sizes="80px"
                                />
                            ) : (
                                <div className="flex size-full items-center justify-center">
                                    <Package className="size-8 text-gray-200" />
                                </div>
                            )}
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                            <div>
                                <p className="font-semibold text-gray-900 truncate group-hover:text-gray-700">
                                    {p.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {p.category?.name ?? "Sans catégorie"}
                                </p>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-medium text-gray-900">
                                    {formatCurrency(Number(p.sellingPrice), p.currency)}
                                </span>
                                <span
                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.cls}`}
                                >
                                    {status.label}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400">Stock : {p.stock}</p>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
