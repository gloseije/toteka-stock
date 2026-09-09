"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ProductForm, { type ProductValues } from "@/components/product-form";
import { trackProductCreated } from "@/lib/analytics";

export default function ProductNewPage() {
    const router = useRouter();

    const handleSubmit = async (values: ProductValues) => {
        try {
            const res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (res.ok) {
                trackProductCreated();
                router.push("/dashboard/products");
                router.refresh();
            } else {
                alert("Erreur lors de la création du produit");
            }
        } catch (error) {
            console.error(error);
            alert("Erreur serveur");
        }
    };

    return (
        <div className="flex-1 flex items-start justify-center p-4 sm:p-8 min-w-0">
            <div className="w-full max-w-7xl bg-white border border-gray-200 rounded p-4 sm:p-8 flex flex-col gap-6">
                {/* Header */}
                <div>
                    <Link
                        href="/dashboard/products"
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Produits
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900">Nouveau produit</h1>
                </div>

                <ProductForm cancelHref="/dashboard/products" onSubmit={handleSubmit} />
            </div>
        </div>
    );
}
