"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Plus, Package } from "lucide-react";
import { ProductsGrid } from "@/components/products/products-grid";
import { Pagination } from "@/components/ui/pagination";
import { DataToolbar } from "@/components/ui/data-toolbar";
import { SkeletonGrid } from "@/components/skeleton";

const SORT_OPTIONS = [
    { value: "createdAt:desc", label: "Date : récent → ancien" },
    { value: "createdAt:asc", label: "Date : ancien → récent" },
    { value: "name:asc", label: "Nom : A → Z" },
    { value: "name:desc", label: "Nom : Z → A" },
    { value: "sellingPrice:desc", label: "Prix : élevé → bas" },
    { value: "sellingPrice:asc", label: "Prix : bas → élevé" },
    { value: "stock:asc", label: "Stock : bas → élevé" },
    { value: "stock:desc", label: "Stock : élevé → bas" },
];

interface ProductApi {
    id: string;
    name: string;
    stock: number;
    sellingPrice: number;
    purchasePrice: number | null;
    currency: "CDF" | "USD";
    category: { id: string; name: string } | null;
    images: { key: string; url?: string | null }[];
}

interface ProductsResponse {
    products: ProductApi[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

interface CategoryOption {
    id: string;
    name: string;
}

const FILTER_OPTIONS = [
    { value: "all", label: "Tous les produits" },
    { value: "lowStock", label: "Stock bas" },
    { value: "archived", label: "Archivés" },
];

function ProductsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(
        100,
        Math.max(1, Number.parseInt(searchParams.get("limit") ?? "50", 10) || 50)
    );
    const search = searchParams.get("search") || "";
    const sortValue = searchParams.get("sort") || "createdAt:desc";
    const categoryId = searchParams.get("categoryId") || "";
    const filter = searchParams.get("filter") || "all";

    const [data, setData] = useState<ProductsResponse | null>(null);
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams();
                params.set("page", String(page));
                params.set("limit", String(limit));
                if (search) params.set("search", search);
                if (sortValue) {
                    const [sort, order] = sortValue.split(":");
                    params.set("sort", sort);
                    params.set("order", order);
                }
                if (categoryId) params.set("categoryId", categoryId);
                if (filter === "lowStock") params.set("lowStock", "true");
                if (filter === "archived") params.set("archived", "true");

                const [productsRes, categoriesRes] = await Promise.all([
                    fetch(`/api/products?${params.toString()}`),
                    fetch("/api/categories"),
                ]);

                if (!productsRes.ok) throw new Error("Erreur lors du chargement");
                const json = (await productsRes.json()) as ProductsResponse;
                setData(json);

                if (categoriesRes.ok) {
                    const catData = (await categoriesRes.json()) as { categories: CategoryOption[] };
                    setCategories(catData.categories);
                }
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Erreur");
            } finally {
                setLoading(false);
            }
        };
        void fetchProducts();
    }, [page, limit, search, sortValue, categoryId, filter]);

    const updateParam = (key: string, value: string | null) => {
        const next = new URLSearchParams(searchParams.toString());
        if (value === null || value === "") {
            next.delete(key);
        } else {
            next.set(key, value);
        }
        next.delete("page");
        router.push(`${pathname}?${next.toString()}`);
    };

    const categoryFilterOptions = [
        { value: "", label: "Toutes les catégories" },
        ...categories.map((c) => ({ value: c.id, label: c.name })),
    ];

    const total = data?.meta.total ?? 0;

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
            <nav className="flex items-center gap-1 text-sm text-gray-500">
                <Link href="/dashboard" className="hover:text-purple-600 transition">
                    Tableau de bord
                </Link>
                <span>/</span>
                <span className="font-medium text-purple-700">Produits</span>
            </nav>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
                    <p className="text-sm text-gray-500">
                        {total} produit{total > 1 ? "s" : ""}
                    </p>
                </div>
                <Link
                    href="/dashboard/products/new"
                    className="inline-flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
                >
                    <Plus className="size-4" />
                    Nouveau produit
                </Link>
            </div>

            <DataToolbar
                search={search}
                onSearchChange={(value) => updateParam("search", value)}
                searchPlaceholder="Rechercher un produit..."
                sort={sortValue}
                onSortChange={(value) => updateParam("sort", value)}
                sortOptions={SORT_OPTIONS}
                filter={categoryId}
                onFilterChange={(value) => updateParam("categoryId", value)}
                filterOptions={categoryFilterOptions}
                filterPlaceholder="Catégorie"
            >
                <select
                    value={filter}
                    onChange={(e) => updateParam("filter", e.target.value)}
                    className="flex-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
                >
                    {FILTER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </DataToolbar>

            {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {loading || !data ? (
                <SkeletonGrid count={6} />
            ) : data.products.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white flex flex-col items-center justify-center py-20 gap-3">
                    <Package className="size-12 text-gray-200" />
                    <p className="text-sm font-medium text-gray-500">Aucun produit</p>
                    <p className="text-xs text-gray-400">
                        Ajoutez votre premier produit pour démarrer votre catalogue.
                    </p>
                    <Link
                        href="/dashboard/products/new"
                        className="mt-2 text-xs font-semibold text-purple-600 hover:text-purple-700 transition"
                    >
                        Ajouter un produit
                    </Link>
                </div>
            ) : (
                <>
                    <ProductsGrid products={data.products} />
                    <Pagination
                        page={data.meta.page}
                        pages={data.meta.totalPages}
                        total={total}
                        limit={data.meta.limit}
                        buildHref={(p) => {
                            const next = new URLSearchParams(searchParams.toString());
                            next.set("page", String(p));
                            return `${pathname}?${next.toString()}`;
                        }}
                    />
                </>
            )}
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<SkeletonGrid count={6} />}>
            <ProductsContent />
        </Suspense>
    );
}
