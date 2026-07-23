import Link from "next/link";
import { Plus, Search, Package } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

// TODO: remplacer par les types issus du schéma Prisma / API
interface Product {
    id: string;
    name: string;
    category: string | null;
    sellingPrice: number;
    stock: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stockStatus(stock: number) {
    if (stock === 0) return { label: "Rupture", cls: "bg-red-50 text-red-600" };
    if (stock <= 5) return { label: "Stock bas", cls: "bg-yellow-50 text-yellow-700" };
    return { label: "En stock", cls: "bg-green-50 text-green-700" };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProductsPage() {
    // TODO: récupérer les produits depuis l'API
    const products: Product[] = [];

    return (
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl w-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl sm:text-2xl text-center font-bold text-gray-900">Produits</h1>
                <Link
                    href="/dashboard/products/new"
                    className="flex items-center gap-2 text-sm font-semibold bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Nouveau produit
                </Link>
            </div>

            {/* Filtres */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher un produit..."
                        className="w-full border border-gray-200 rounded pl-9 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-purple-600 transition-colors bg-white"
                    />
                </div>
            </div>

            {/* Table */}
            {products.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded flex flex-col items-center justify-center py-20 gap-3">
                    <Package className="w-10 h-10 text-gray-200" />
                    <p className="text-sm font-medium text-gray-500">Aucun produit</p>
                    <p className="text-xs text-gray-400">
                        Ajoutez votre premier produit pour démarrer votre catalogue.
                    </p>
                    <Link
                        href="/dashboard/products/new"
                        className="mt-2 text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                    >
                        Ajouter un produit
                    </Link>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                                    Produit
                                </th>
                                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                                    Catégorie
                                </th>
                                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">
                                    Prix
                                </th>
                                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">
                                    Stock
                                </th>
                                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                                    Statut
                                </th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {products.map((p) => {
                                const status = stockStatus(p.stock);
                                return (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {p.name}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {p.category ?? "—"}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-900">
                                            {p.sellingPrice.toLocaleString("fr-FR")} Fc
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-900">
                                            {p.stock}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`text-[11px] font-semibold px-2 py-0.5 rounded ${status.cls}`}
                                            >
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={`/dashboard/products/${p.id}`}
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
