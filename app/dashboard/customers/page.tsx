"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Plus, Users } from "lucide-react";
import { CustomersTable } from "@/components/customers/customers-table";
import { Pagination } from "@/components/ui/pagination";
import { DataToolbar } from "@/components/ui/data-toolbar";
import { SkeletonTable } from "@/components/skeleton";
import type { Currency } from "@prisma/client";

const SORT_OPTIONS = [
    { value: "name:asc", label: "Nom : A → Z" },
    { value: "name:desc", label: "Nom : Z → A" },
    { value: "createdAt:desc", label: "Inscription : récent → ancien" },
    { value: "createdAt:asc", label: "Inscription : ancien → récent" },
];

interface CustomerApi {
    id: string;
    name: string;
    phone: string | null;
    whatsapp: string | null;
    address: string | null;
    createdAt: string;
    totalSales: number;
    totalSpent: number;
}

interface CustomersResponse {
    customers: CustomerApi[];
    pagination: {
        total: number;
        currentPage: number;
        limit: number;
        pages: number;
    };
}

function CustomersContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(
        100,
        Math.max(1, Number.parseInt(searchParams.get("limit") ?? "20", 10) || 20)
    );
    const search = searchParams.get("search") || "";
    const sortValue = searchParams.get("sort") || "name:asc";

    const [data, setData] = useState<CustomersResponse | null>(null);
    const [currency, setCurrency] = useState<Currency>("CDF");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCustomers = async () => {
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

                const [customersRes, shopRes] = await Promise.all([
                    fetch(`/api/customers?${params.toString()}`),
                    fetch("/api/shop"),
                ]);

                if (!customersRes.ok) throw new Error("Erreur lors du chargement");
                const json = (await customersRes.json()) as CustomersResponse;
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
        void fetchCustomers();
    }, [page, limit, search, sortValue]);

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

    const customersData =
        data?.customers.map((c) => ({
            ...c,
            createdAt: new Date(c.createdAt),
        })) ?? [];

    const total = data?.pagination.total ?? 0;

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
            <nav className="flex items-center gap-1 text-sm text-gray-500">
                <Link href="/dashboard" className="hover:text-purple-600 transition">
                    Tableau de bord
                </Link>
                <span>/</span>
                <span className="text-purple-700 font-medium">Clients</span>
            </nav>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
                    <p className="text-sm text-gray-500">
                        {total} client{total > 1 ? "s" : ""}
                    </p>
                </div>
                <Link
                    href="/dashboard/customers/new"
                    className="inline-flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
                >
                    <Plus className="size-4" />
                    Nouveau client
                </Link>
            </div>

            <DataToolbar
                search={search}
                onSearchChange={(value) => updateParam("search", value)}
                searchPlaceholder="Rechercher un client..."
                sort={sortValue}
                onSortChange={(value) => updateParam("sort", value)}
                sortOptions={SORT_OPTIONS}
            />

            {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {loading || !data ? (
                <SkeletonTable rows={6} />
            ) : customersData.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white flex flex-col items-center justify-center py-20 gap-3">
                    <Users className="size-12 text-gray-200" />
                    <p className="text-sm font-medium text-gray-500">Aucun client</p>
                    <p className="text-xs text-gray-400">
                        Ajoutez votre premier client pour suivre ses achats.
                    </p>
                    <Link
                        href="/dashboard/customers/new"
                        className="mt-2 text-xs font-semibold text-purple-600 hover:text-purple-700 transition"
                    >
                        Ajouter un client
                    </Link>
                </div>
            ) : (
                <>
                    <CustomersTable customers={customersData} currency={currency} />
                    <Pagination
                        page={data.pagination.currentPage}
                        pages={data.pagination.pages}
                        total={total}
                        limit={data.pagination.limit}
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

export default function CustomersPage() {
    return (
        <Suspense fallback={<SkeletonTable rows={6} />}>
            <CustomersContent />
        </Suspense>
    );
}
