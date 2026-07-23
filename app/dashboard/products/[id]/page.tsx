import Link from "next/link";
import { ArrowLeft, Pencil, Share2, ShoppingCart } from "lucide-react";
import { notFound } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
    id: string;
    name: string;
    category: string | null;
    sellingPrice: number;
    costPrice: number | null;
    stock: number;
    minStock: number | null;
    description: string | null;
    createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getProduct(id: string): Promise<Product | null> {
    // TODO: GET /api/products/:id
    return null;
}

function stockStatus(stock: number) {
    if (stock === 0) return { label: "Rupture de stock", cls: "bg-red-50 text-red-600" };
    if (stock <= 5) return { label: "Stock bas", cls: "bg-yellow-50 text-yellow-700" };
    return { label: "En stock", cls: "bg-green-50 text-green-700" };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
    const product = await getProduct(params.id);
    if (!product) notFound();

    const status = stockStatus(product.stock);
    const margin =
        product.costPrice && product.sellingPrice
            ? Math.round(((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100)
            : null;

    return (
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl w-full">
            {/* Back */}
            <Link
                href="/dashboard/products"
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors w-fit"
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                Produits
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>
                    {product.category && (
                        <p className="text-sm text-gray-400 mt-0.5">{product.category}</p>
                    )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Link
                        href={`/dashboard/products/${product.id}/edit`}
                        className="flex items-center gap-1.5 text-sm font-medium border border-gray-200 text-gray-600 px-3 py-2 rounded hover:border-gray-300 hover:text-gray-900 transition-colors"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                        Modifier
                    </Link>
                    <Link
                        href={`/dashboard/sales/new?product=${product.id}`}
                        className="flex items-center gap-1.5 text-sm font-semibold bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 transition-colors"
                    >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Vendre
                    </Link>
                </div>
            </div>

            {/* Fiche */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Infos */}
                <div className="bg-white border border-gray-200 rounded divide-y divide-gray-100">
                    {[
                        ["Prix de vente", `${product.sellingPrice.toLocaleString("fr-FR")} Fc`],
                        [
                            "Prix d'achat",
                            product.costPrice
                                ? `${product.costPrice.toLocaleString("fr-FR")} Fc`
                                : "—",
                        ],
                        ["Marge", margin !== null ? `${margin} %` : "—"],
                        ["Stock", String(product.stock)],
                        ["Seuil d'alerte", product.minStock ? String(product.minStock) : "—"],
                    ].map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between px-4 py-3">
                            <span className="text-xs text-gray-400">{key}</span>
                            <span className="text-sm font-medium text-gray-900">{val}</span>
                        </div>
                    ))}
                    <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-xs text-gray-400">Statut</span>
                        <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded ${status.cls}`}
                        >
                            {status.label}
                        </span>
                    </div>
                </div>

                {/* Description + partage */}
                <div className="flex flex-col gap-4">
                    {product.description && (
                        <div className="bg-white border border-gray-200 rounded p-4">
                            <p className="text-xs font-semibold text-gray-500 mb-2">Description</p>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                {product.description}
                            </p>
                        </div>
                    )}
                    <div className="bg-white border border-gray-200 rounded p-4">
                        <p className="text-xs font-semibold text-gray-500 mb-3">Partager</p>
                        <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                            <Share2 className="w-4 h-4" />
                            Partager sur WhatsApp
                        </button>
                    </div>
                </div>
            </div>

            {/* Ventes récentes de ce produit */}
            <div className="bg-white border border-gray-200 rounded">
                <div className="px-5 py-4 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">Ventes récentes</p>
                </div>
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
                    <ShoppingCart className="w-7 h-7 text-gray-200" />
                    <p className="text-sm text-gray-500">Aucune vente enregistrée</p>
                    <p className="text-xs text-gray-400">
                        Les ventes de ce produit apparaîtront ici.
                    </p>
                </div>
            </div>
        </div>
    );
}
