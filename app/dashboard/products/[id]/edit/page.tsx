"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ProductForm, { type ProductValues } from "@/components/product-form";
import { Product, ProductImage } from "@/types";
import { Skeleton } from "@/components/skeleton";

type ProductWithImages = Product & { images: ProductImage[] };

export default function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [product, setProduct] = useState<ProductWithImages | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setProduct(data.product);
                }
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleSubmit = async (values: ProductValues) => {
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            if (res.ok) {
                router.push(`/dashboard/products/${id}`);
                router.refresh();
            } else {
                alert("Erreur lors de la mise à jour");
            }
        } catch (error) {
            console.error("Submit error:", error);
            alert("Erreur serveur");
        }
    };

    if (loading) {
        return (
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-64" />
                <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                    <Skeleton className="h-10 w-40" />
                </div>
            </div>
        );
    }
    if (!product) return <div className="p-8">Produit non trouvé</div>;

    const defaultValues: ProductValues = {
        name: product.name,
        categoryId: product.categoryId || "",
        sellingPrice: String(product.sellingPrice),
        currency: product.currency ?? "CDF",
        purchasePrice: product.purchasePrice ? String(product.purchasePrice) : "",
        stock: String(product.stock),
        lowStockAlert: product.lowStockAlert ? String(product.lowStockAlert) : "",
        description: product.description || "",
        imageUrl: product.images?.[0]?.url,
        imageKey: product.images?.[0]?.key,
    };

    // Si on est en local et qu'on a une clé mais que l'URL n'est pas déjà un proxy
    if (
        defaultValues.imageKey &&
        defaultValues.imageUrl &&
        !defaultValues.imageUrl.startsWith("/api/images")
    ) {
        // On pourrait forcer l'URL du proxy ici si nécessaire, mais le composant ImageUpload
        // devrait idéalement gérer ça ou l'API devrait renvoyer l'URL correcte.
    }

    return (
        <div className="flex-1 flex items-start justify-center p-4 sm:p-8 min-w-0">
            <div className="w-full max-w-7xl bg-white border border-gray-200 rounded p-4 sm:p-8 flex flex-col gap-6">
                {/* Header */}
                <div>
                    <Link
                        href={`/dashboard/products/${id}`}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Retour au produit
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900">Modifier le produit</h1>
                </div>

                <ProductForm
                    cancelHref={`/dashboard/products/${id}`}
                    onSubmit={handleSubmit}
                    defaultValues={defaultValues}
                />
            </div>
        </div>
    );
}
