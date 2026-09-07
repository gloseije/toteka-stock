"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Plus, ShoppingCart } from "lucide-react";
import { SalesTable } from "@/components/sales/sales-table";
import { Pagination } from "@/components/ui/pagination";
import { DataToolbar } from "@/components/ui/data-toolbar";
import { SkeletonPage } from "@/components/skeleton";
import type { SaleListApi } from "@/types";
import type { Currency } from "@prisma/client";

const SORT_OPTIONS = [
    { value: "soldAt:desc", label: "Date : récent → ancien" },
    { value: "soldAt:asc", label: "Date : ancien → récent" },
    { value: "totalAmount:desc", label: "Montant : élevé → bas" },
    { value: "totalAmount:asc", label: "Montant : bas → élevé" },
    { value: "customer:asc", label: "Client : A → Z" },
    { value: "customer:desc", label: "Client : Z → A" },
];

const DATE_FILTERS = ["Toutes", "Aujourd'hui", "Cette semaine", "Ce mois"] as const;

interface SalesResponse {
    sales: SaleListApi[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

function SalesContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(
        100,
        Math.max(1, Number.parseInt(searchParams.get("limit") ?? "20", 10) || 20)
    );
    const search = searchParams.get("search") || "";
    const sortValue = searchParams.get("sort") || "soldAt:desc";
    const dateFilter = searchParams.get("date") || "Toutes";

    const [data, setData] = useState<SalesResponse | null>(null);
    const [currency, setCurrency] = useState<Currency>("CDF");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSales = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams();
                params.set("page", String(page));
                params.set("limit", String(limit));
                if (search) params.set("search", search);
                if (sortValue) params.set("sort", sortValue);
                if (dateFilter && dateFilter !== "Toutes") params.set("date", dateFilter);

                const [salesRes, shopRes] = await Promise.all([
                    fetch(`/api/sales?${params.toString()}`),
                    fetch("/api/shop"),
                ]);

                if (!salesRes.ok) throw new Error("Erreur lors du chargement");
                const json = (await salesRes.json()) as SalesResponse;
                setData(json);

                if (shopRes.ok) {
                    const shopData = (await shopRes.json()) as { shop: { currency: Currency } };
                    setCurrency(shopData.shop.currency);
                }
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Erreur");
            } finally {
                setLoading(false);
            }
        };
        void fetchSales();
    }, [page, limit, search, sortValue, dateFilter]);

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

    const total = data?.pagination.total ?? 0;

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
            <nav className="flex items-center gap-1 text-sm text-gray-500">
                <Link href="/dashboard" className="transition hover:text-purple-600">
                    Tableau de bord
                </Link>
                <span>/</span>
                <span className="font-medium text-purple-700">Ventes</span>
            </nav>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Ventes</h1>
                    <p className="text-sm text-gray-500">
                        {total} vente{total > 1 ? "s" : ""}
                    </p>
                </div>
                <Link
                    href="/dashboard/sales/new"
                    className="inline-flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
                >
                    <Plus className="size-4" />
                    Nouvelle vente
                </Link>
            </div>

            <div className="flex flex-col gap-3">
                <DataToolbar
                    search={search}
                    onSearchChange={(value) => updateParam("search", value)}
                    searchPlaceholder="Rechercher une vente, client, produit..."
                    sort={sortValue}
                    onSortChange={(value) => updateParam("sort", value)}
                    sortOptions={SORT_OPTIONS}
                />
                <div className="flex items-center gap-1">
                    {DATE_FILTERS.map((label) => (
                        <button
                            key={label}
                            onClick={() => updateParam("date", label === "Toutes" ? null : label)}
                            className={`rounded px-3 py-1.5 text-sm transition-colors ${
                                dateFilter === label || (label === "Toutes" && !dateFilter)
                                    ? "bg-purple-50 font-semibold text-purple-700"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {loading || !data ? (
                <SkeletonPage />
            ) : data.sales.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white py-20">
                    <ShoppingCart className="size-12 text-gray-200" />
                    <p className="text-sm font-medium text-gray-500">Aucune vente</p>
                    <p className="max-w-xs text-center text-xs text-gray-400">
                        Enregistrez une vente pour qu&apos;elle apparaisse ici.
                    </p>
                    <Link
                        href="/dashboard/sales/new"
                        className="mt-2 text-xs font-semibold text-purple-600 transition hover:text-purple-700"
                    >
                        Enregistrer une vente
                    </Link>
                </div>
            ) : (
                <>
                    <SalesTable sales={data.sales} currency={currency} />
                    <Pagination
                        page={page}
                        pages={data.pagination.pages}
                        total={total}
                        limit={limit}
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

export default function SalesPage() {
    return (
        <Suspense fallback={<SkeletonPage />}>
            <SalesContent />
        </Suspense>
    );
}
