"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Pencil, ShoppingCart, Package, Trash2, ChevronRight } from "lucide-react";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getPublicUrl } from "@/lib/storage-actions";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import { ProductWithSales } from "@/types";
import { SkeletonPage } from "@/components/skeleton";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stockStatus(stock: number) {
    if (stock === 0) return { label: "Rupture de stock", cls: "text-red-600 bg-red-50" };
    if (stock <= 5) return { label: "Stock bas", cls: "text-yellow-700 bg-yellow-50" };
    return { label: "En stock", cls: "text-green-700 bg-green-50" };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductDetailPage(props: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [product, setProduct] = useState<ProductWithSales | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            const params = await props.params;
            try {
                const res = await fetch(`/api/products/${params.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setProduct(data.product);
                } else if (res.status === 404) {
                    notFound();
                }
            } catch (error) {
                console.error("Fetch product error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [props.params]);

    const handleDelete = async () => {
        if (!product) return;
        if (!confirm("Voulez-vous vraiment supprimer ce produit ? Cette action est irréversible."))
            return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
            if (res.ok) {
                router.push("/dashboard/products");
                router.refresh();
            } else {
                const data = await res.json();
                alert(data.error || "Erreur lors de la suppression");
            }
        } catch (error) {
            console.error("Delete product error:", error);
            alert("Erreur serveur");
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return <SkeletonPage />;
    }

    if (!product) return null;

    const status = stockStatus(product.stock);
    const margin =
        product.purchasePrice && product.sellingPrice
            ? Math.round(
                  ((Number(product.sellingPrice) - Number(product.purchasePrice)) /
                      Number(product.sellingPrice)) *
                      100
              )
            : null;
    const saleItems = product.saleItems || [];
    const totalSales = saleItems.length;

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
            <nav className="flex items-center gap-1 text-sm text-gray-500">
                <Link href="/dashboard" className="hover:text-gray-700 transition">
                    Tableau de bord
                </Link>
                <span>/</span>
                <Link href="/dashboard/products" className="hover:text-gray-700 transition">
                    Produits
                </Link>
                <span>/</span>
                <span className="font-medium text-gray-900">{product.name}</span>
            </nav>

            {/* En-tête - tout gris, seul bouton "Vendre" est violet */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg border border-gray-200 bg-white overflow-hidden relative shrink-0">
                        {product.images[0]?.key ? (
                            <Image
                                src={getPublicUrl(product.images[0].key)}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="56px"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                <Package className="size-6 text-gray-300" />
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            {product.category && (
                                <>
                                    <span>{product.category.name}</span>
                                    <span className="text-gray-300">•</span>
                                </>
                            )}
                            <span>Réf. {product.id.slice(-6).toUpperCase()}</span>
                            <span className="text-gray-300">•</span>
                            <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${status.cls}`}
                            >
                                {status.label}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {/* Bouton principal en violet */}
                    <Link
                        href={`/dashboard/sales/new?product=${product.id}`}
                        className="inline-flex items-center gap-1.5 rounded-md bg-purple-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-purple-700"
                    >
                        <ShoppingCart className="size-4" />
                        Vendre
                    </Link>
                    <Link
                        href={`/dashboard/products/${product.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:border-gray-300"
                    >
                        <Pencil className="size-4" />
                        Modifier
                    </Link>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                        <Trash2 className="size-4" />
                        Supprimer
                    </button>
                </div>
            </div>

            {/* Section principale : image + informations produit */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Colonne gauche : image */}
                <div className="flex flex-col gap-4">
                    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden aspect-square relative group">
                        {product.images[0]?.key ? (
                            <Image
                                src={getPublicUrl(product.images[0].key)}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, 400px"
                                priority
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 gap-2">
                                <Package className="size-12 text-gray-200" />
                                <span className="text-xs text-gray-400 font-medium">
                                    Aucune image
                                </span>
                            </div>
                        )}
                    </div>
                    {product.images.length > 1 && (
                        <div className="grid grid-cols-4 gap-3">
                            {product.images.slice(1).map((img, idx) => (
                                <div
                                    key={idx}
                                    className="aspect-square relative border border-gray-200 rounded-md overflow-hidden bg-white cursor-pointer hover:border-gray-400 transition"
                                >
                                    <Image
                                        src={getPublicUrl(img.key)}
                                        alt={`${product.name} ${idx + 2}`}
                                        fill
                                        className="object-cover"
                                        sizes="80px"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Colonne droite : informations produit */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Fiche produit */}
                    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                        <div className="border-b border-gray-100 px-5 py-3 bg-gray-50/50">
                            <h2 className="text-xs font-bold text-gray-500 uppercase ">
                                Informations produit
                            </h2>
                        </div>
                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase ">
                                    Prix de vente
                                </p>
                                <p className="text-xl font-bold text-gray-900 mt-1">
                                    {formatCurrency(Number(product.sellingPrice), product.currency)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase ">
                                    Prix d&apos;achat
                                </p>
                                <p className="text-sm font-medium text-gray-900 mt-1">
                                    {product.purchasePrice
                                        ? formatCurrency(
                                              Number(product.purchasePrice),
                                              product.currency
                                          )
                                        : "—"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase ">
                                    Marge brute
                                </p>
                                <p
                                    className={`text-sm font-bold mt-1 ${margin !== null && margin > 0 ? "text-green-600" : "text-gray-900"}`}
                                >
                                    {margin !== null ? `${margin} %` : "—"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase ">
                                    Stock actuel
                                </p>
                                <p
                                    className={`text-sm font-bold mt-1 ${product.stock <= (product.lowStockAlert || 0) ? "text-red-600" : "text-gray-900"}`}
                                >
                                    {product.stock}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase ">
                                    Seuil d&apos;alerte
                                </p>
                                <p className="text-sm font-medium text-gray-900 mt-1">
                                    {product.lowStockAlert || "—"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase ">
                                    Catégorie
                                </p>
                                <p className="text-sm font-medium text-gray-900 mt-1">
                                    {product.category?.name || "—"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {product.description && (
                        <div className="rounded-lg border border-gray-200 bg-white p-5">
                            <h2 className="text-xs font-bold text-gray-500 uppercase  mb-2">
                                Description
                            </h2>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                {product.description}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Historique des ventes */}
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                <div className="border-b border-gray-100 px-5 py-3 bg-gray-50/50 flex items-center justify-between">
                    <h2 className="text-xs font-bold text-gray-500 uppercase ">
                        Ventes récentes
                    </h2>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">
                        {totalSales} vente{totalSales > 1 ? "s" : ""}
                    </span>
                </div>
                {totalSales === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                            <ShoppingCart className="size-6" />
                        </div>
                        <p className="text-sm font-medium text-gray-500">
                            Aucune vente enregistrée
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase ">
                                        Date
                                    </th>
                                    <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase ">
                                        Client
                                    </th>
                                    <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase ">
                                        Quantité
                                    </th>
                                    <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase ">
                                        Montant total
                                    </th>
                                    <th className="px-5 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {saleItems.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="group hover:bg-gray-50/30 transition"
                                    >
                                        <td className="px-5 py-3 text-gray-500">
                                            {formatDate(item.sale.soldAt)}
                                        </td>
                                        <td className="px-5 py-3 font-medium text-gray-900">
                                            {item.sale.customer?.name ?? "Client anonyme"}
                                        </td>
                                        <td className="px-5 py-3 text-right text-gray-600 font-semibold">
                                            {item.quantity}
                                        </td>
                                        <td className="px-5 py-3 text-right font-bold text-gray-900">
                                            {formatCurrency(
                                                Number(item.totalPrice),
                                                product.currency
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <Link
                                                href={`/dashboard/sales/${item.saleId}`}
                                                className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 transition"
                                            >
                                                <span className="text-[10px] font-bold uppercase">
                                                    Voir
                                                </span>
                                                <ChevronRight className="size-4 text-gray-300 transition group-hover:text-gray-500" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Lien retour en bas */}
            <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
                <Link
                    href="/dashboard/products"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition"
                >
                    <ArrowLeft className="size-4" />
                    Retour aux produits
                </Link>
            </div>
        </div>
    );
}
