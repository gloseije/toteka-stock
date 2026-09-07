"use client";

import Link from "next/link";
import { AlertTriangle, ChevronRight, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import type { Currency } from "@prisma/client";
import { formatCurrency } from "@/lib/currency";
import { SkeletonCard, SkeletonListItem } from "@/components/skeleton";

interface CurrencyAmount {
    currency: Currency;
    amount: number;
}

interface DashboardData {
    salesCount: number;
    customersCount: number;
    lowStockAlerts: Array<{ id: string; name: string; stock: number; lowStockAlert: number }>;
    recentCustomers: Array<{ id: string; name: string; createdAt: string }>;
    recentSales: Array<{
        id: string;
        soldAt: string;
        customer: { name: string } | null;
        totals: CurrencyAmount[];
    }>;
    currencies: CurrencyAmount[];
}

const emptyDashboard: DashboardData = {
    salesCount: 0,
    customersCount: 0,
    lowStockAlerts: [],
    recentCustomers: [],
    recentSales: [],
    currencies: [],
};

function dateLabel(value: string): string {
    const date = new Date(value);
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
    if (date.getFullYear() !== now.getFullYear()) {
        options.year = "numeric";
    }
    return new Intl.DateTimeFormat("fr-FR", options).format(date);
}

function totalLabel(totals: CurrencyAmount[]): ReactNode {
    return (
        <span className="flex flex-col items-end text-right">
            {totals.map((t) => (
                <span key={t.currency} className="text-sm font-medium text-gray-700">
                    {formatCurrency(t.amount, t.currency)}
                </span>
            ))}
        </span>
    );
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData>(emptyDashboard);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const response = await fetch("/api/dashboard");
                if (!response.ok) {
                    setError("Erreur de chargement");
                    setIsLoading(false);
                    return;
                }
                const json = (await response.json()) as DashboardData;
                setData(json);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Erreur inconnue");
                console.error("Erreur dashboard", err);
            } finally {
                setIsLoading(false);
            }
        };
        void loadInitialData();
    }, []);

    const revenue = (currency: Currency) =>
        data.currencies.find((entry) => entry.currency === currency)?.amount ?? 0;

    const kpis = [
        {
            label: "CA du mois",
            value: formatCurrency(revenue("CDF"), "CDF"),
            Icon: TrendingUp,
        },
        {
            label: "Ventes du mois",
            value: String(data.salesCount),
            Icon: ShoppingCart,
        },
        {
            label: "Clients",
            value: String(data.customersCount),
            Icon: Users,
        },
    ];



    const ListItem = ({ href, children }: { href: string; children: ReactNode }) => (
        <Link
            href={href}
            className="group flex items-center justify-between gap-4 border-gray-100 px-4 py-3 transition-colors hover:bg-purple-50/50 sm:px-5 not-last:border-b"
        >
            {children}
            <ChevronRight className="size-4 shrink-0 text-gray-300 transition group-hover:text-purple-600" />
        </Link>
    );

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:gap-8 sm:p-6 lg:p-8">
            <header className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Tableau de bord</h1>
            </header>

            {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    Erreur : {error}
                </div>
            )}

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-3" aria-label="Résumé du mois">
                {isLoading
                    ? Array.from({ length: kpis.length }).map((_, i) => <SkeletonCard key={i} />)
                    : kpis.map(({ label, value, Icon }) => {
                          return (
                              <div key={label} className={`rounded-lg p-4 bg-white border border-gray-200`}>
                                  <div className="flex items-center justify-between">
                                      <p className="text-sm font-medium text-gray-600">{label}</p>
                                      <div className={`rounded-full p-1.5`}>
                                          <Icon
                                              className={`size-4 text-purple-700`}
                                              aria-hidden="true"
                                          />
                                      </div>
                                  </div>
                                  <p className="mt-2 text-xl font-semibold text-gray-900">
                                      {value}
                                  </p>
                              </div>
                          );
                      })}
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <DashboardPanel
                    title={`Ventes récentes (${data.recentSales.length})`}
                    href="/dashboard/sales"
                >
                    {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => <SkeletonListItem key={i} />)
                    ) : data.recentSales.length > 0 ? (
                        data.recentSales.map((sale) => (
                            <ListItem key={sale.id} href={`/dashboard/sales/${sale.id}`}>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-medium text-gray-800 group-hover:text-purple-700">
                                        {sale.customer?.name ?? "Client occasionnel"}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {dateLabel(sale.soldAt)}
                                    </span>
                                </span>
                                <div className="flex shrink-0 items-center gap-2">
                                    {totalLabel(sale.totals)}
                                </div>
                            </ListItem>
                        ))
                    ) : (
                        <EmptyPanel
                            icon={ShoppingCart}
                            message="Aucune vente enregistrée."
                            actionHref="/dashboard/sales/new"
                            action="Enregistrer une vente"
                        />
                    )}
                </DashboardPanel>

                <DashboardPanel
                    title={`Clients récents (${data.recentCustomers.length})`}
                    href="/dashboard/customers"
                >
                    {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => <SkeletonListItem key={i} />)
                    ) : data.recentCustomers.length > 0 ? (
                        data.recentCustomers.map((customer) => (
                            <ListItem
                                key={customer.id}
                                href={`/dashboard/customers/${customer.id}`}
                            >
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-medium text-gray-800 group-hover:text-purple-700">
                                        {customer.name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        Ajouté le {dateLabel(customer.createdAt)}
                                    </span>
                                </span>
                            </ListItem>
                        ))
                    ) : (
                        <EmptyPanel
                            icon={Users}
                            message="Aucun client enregistré."
                            actionHref="/dashboard/customers/new"
                            action="Ajouter un client"
                        />
                    )}
                </DashboardPanel>
            </section>

            <DashboardPanel
                title={`Stock à surveiller (${data.lowStockAlerts.length})`}
                href="/dashboard/products"
            >
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <SkeletonListItem key={i} />)
                ) : data.lowStockAlerts.length > 0 ? (
                    data.lowStockAlerts.map((product) => {
                        const ratio = product.stock / product.lowStockAlert;
                        const stockColor =
                            ratio <= 0.5
                                ? "text-red-600"
                                : ratio <= 0.75
                                  ? "text-orange-500"
                                  : "text-purple-700";
                        return (
                            <ListItem key={product.id} href={`/dashboard/products/${product.id}`}>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-medium text-gray-800 group-hover:text-purple-700">
                                        {product.name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        Seuil : {product.lowStockAlert}
                                    </span>
                                </span>
                                <span className={`text-sm font-medium ${stockColor}`}>
                                    {product.stock} en stock
                                </span>
                            </ListItem>
                        );
                    })
                ) : (
                    <EmptyPanel icon={AlertTriangle} message="Aucun produit à surveiller." />
                )}
            </DashboardPanel>
        </div>
    );
}

function DashboardPanel({
    children,
    href,
    title,
}: {
    children: ReactNode;
    href: string;
    title: string;
}) {
    return (
        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-5">
                <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
                <Link
                    href={href}
                    className="text-xs font-medium text-purple-600 hover:text-purple-700"
                >
                    Voir tout
                </Link>
            </div>
            <div>{children}</div>
        </section>
    );
}

function EmptyPanel({
    action,
    actionHref,
    icon: Icon,
    message,
}: {
    action?: string;
    actionHref?: string;
    icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
    message: string;
}) {
    return (
        <div className="flex min-h-40 flex-col items-center justify-center px-4 py-8 text-center">
            <Icon className="mb-2 size-5 text-gray-400" aria-hidden={true} />
            <p className="text-sm text-gray-500">{message}</p>
            {action && actionHref ? (
                <Link
                    href={actionHref}
                    className="mt-3 text-xs font-medium text-purple-600 hover:text-purple-700"
                >
                    {action}
                </Link>
            ) : null}
        </div>
    );
}
