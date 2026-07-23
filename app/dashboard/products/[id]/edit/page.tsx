"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ProductForm, { type ProductValues } from "@/components/product-form";

// TODO: récupérer le produit côté client ou via un Server Component parent
// et passer les valeurs en prop. Pour l'instant, defaultValues est vide.

export default function ProductEditPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    const handleSubmit = async (values: ProductValues) => {
        // TODO: PATCH /api/products/:id
        console.log("update product", params.id, values);
        router.push(`/dashboard/products/${params.id}`);
    };

    return (
        <div className="flex-1 flex items-start justify-center p-8">
            <div className="w-full max-w-7xl bg-white border border-gray-200 rounded p-8 flex flex-col gap-6">
                {/* Header */}
                <div>
                    <Link
                        href={`/dashboard/products/${params.id}`}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Retour au produit
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900">Modifier le produit</h1>
                </div>

                <ProductForm
                    cancelHref={`/dashboard/products/${params.id}`}
                    onSubmit={handleSubmit}
                    // TODO: passer defaultValues depuis l'API
                />
            </div>
        </div>
    );
}
