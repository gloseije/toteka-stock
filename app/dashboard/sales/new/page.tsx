"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CustomerChoice } from "@/components/customer-choice";
import type { CustomerSummary, ProductSummary } from "@/types";
import {
    convertToShopCurrency,
    formatCurrency,
    roundCurrency,
    type Currency,
} from "@/lib/currency";
import { Skeleton } from "@/components/skeleton";

type Product = Omit<ProductSummary, "sellingPrice"> & { sellingPrice: number };
type Customer = CustomerSummary;
interface LineItem {
    key: string;
    productId: string;
    unitPrice: number;
    quantity: number;
}
type PaymentMethod = "CASH" | "MOBILE_MONEY" | "BANK_TRANSFER" | "OTHER";

const paymentMethods: Array<{ value: PaymentMethod; label: string }> = [
    { value: "CASH", label: "Espèces" },
    { value: "MOBILE_MONEY", label: "Mobile Money" },
    { value: "BANK_TRANSFER", label: "Virement" },
    { value: "OTHER", label: "Autre" },
];
const inputClass =
    "w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-purple-600 bg-white";
const emptyLine = (): LineItem => ({
    key: crypto.randomUUID(),
    productId: "",
    unitPrice: 0,
    quantity: 1,
});

function SaleNewForm() {
    const router = useRouter();
    const productId = useSearchParams().get("product");
    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [lines, setLines] = useState<LineItem[]>([emptyLine()]);
    const [customerId, setCustomerId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [shopCurrency, setShopCurrency] = useState<Currency>("CDF");
    const [exchangeRate, setExchangeRate] = useState(22500);

    useEffect(() => {
        const loadFormData = async () => {
            try {
                const [productResponse, customerResponse, shopResponse] = await Promise.all([
                    fetch("/api/products?limit=100"),
                    fetch("/api/customers?limit=100"),
                    fetch("/api/shop"),
                ]);
                if (!productResponse.ok || !customerResponse.ok || !shopResponse.ok) {
                    toast.error("Impossible de charger les produits et clients");
                    return;
                }
                const productData: { products: Product[] } = await productResponse.json();
                const customerData: { customers: Customer[] } = await customerResponse.json();
                const shopData: { shop: { currency: Currency; exchangeRate: number | string } } =
                    await shopResponse.json();
                setProducts(productData.products);
                setCustomers(customerData.customers);
                setShopCurrency(shopData.shop.currency);
                setExchangeRate(Number(shopData.shop.exchangeRate));
            } catch {
                toast.error("Impossible de charger les produits et clients");
            }
        };
        void loadFormData();
    }, []);

    useEffect(() => {
        if (!productId || products.length === 0) return;
        const product = products.find((item) => item.id === productId);
        if (!product) {
            toast.error("Produit introuvable");
            return;
        }

        // Utiliser une micro-tâche pour s'assurer que setLines est appelé après le rendu
        // Cela évite l'erreur react-hooks/set-state-in-effect
        Promise.resolve().then(() => {
            setLines([
                {
                    key: crypto.randomUUID(),
                    productId: product.id,
                    unitPrice: convertToShopCurrency(
                        Number(product.sellingPrice),
                        product.currency,
                        shopCurrency,
                        exchangeRate
                    ),
                    quantity: 1,
                },
            ]);
        });
    }, [productId, products, shopCurrency, exchangeRate]);

    const updateLine = (key: string, change: Partial<LineItem>) =>
        setLines((current) =>
            current.map((line) => (line.key === key ? { ...line, ...change } : line))
        );
    const selectProduct = (key: string, id: string) => {
        const product = products.find((item) => item.id === id);
        updateLine(key, {
            productId: id,
            unitPrice: product
                ? convertToShopCurrency(
                      Number(product.sellingPrice),
                      product.currency,
                      shopCurrency,
                      exchangeRate
                  )
                : 0,
        });
    };
    const total = roundCurrency(
        lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0),
        shopCurrency
    );
    const isValid = lines.every(
        (line) => line.productId && line.quantity > 0 && line.unitPrice >= 0
    );

    const submit = async (event: React.SubmitEvent) => {
        event.preventDefault();
        if (!isValid) return;
        setLoading(true);
        try {
            const response = await fetch("/api/sales", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerId: customerId || null,
                    paymentMethod,
                    note: note || null,
                    items: lines.map(({ productId: id, quantity, unitPrice }) => ({
                        productId: id,
                        quantity,
                        unitPrice,
                    })),
                }),
            });
            const payload: { error?: string } = await response.json();
            if (!response.ok) {
                toast.error(payload.error ?? "Impossible d’enregistrer la vente");
                setLoading(false);
                return;
            }
            toast.success("Vente enregistrée");
            router.push("/dashboard/sales");
            router.refresh();
        } catch (error: unknown) {
            toast.error(
                error instanceof Error ? error.message : "Impossible d’enregistrer la vente"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-5xl bg-white border border-gray-200 rounded p-4 sm:p-8">
            <Link
                href="/dashboard/sales"
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 mb-4"
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                Ventes
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Nouvelle vente</h1>
            <form onSubmit={submit} className="mt-8 flex flex-col gap-7">
                <div className="flex flex-col gap-3">
                    <label className="text-xs font-semibold text-gray-700">Produits *</label>
                    {lines.map((line) => (
                        <div
                            key={line.key}
                            className="flex flex-col gap-2 sm:flex-row sm:items-center"
                        >
                            <select
                                value={line.productId}
                                onChange={(event) => selectProduct(line.key, event.target.value)}
                                className={`${inputClass} sm:flex-1`}
                            >
                                <option value="">Sélectionner un produit</option>
                                {products.map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.name} : stock {product.stock}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                min="0"
                                value={line.unitPrice}
                                readOnly
                                className={`${inputClass} sm:w-28 bg-gray-50 cursor-not-allowed`}
                                aria-label="Prix unitaire"
                            />
                            <input
                                type="number"
                                min="1"
                                value={line.quantity}
                                onChange={(event) =>
                                    updateLine(line.key, { quantity: Number(event.target.value) })
                                }
                                className={`${inputClass} sm:w-20`}
                                aria-label="Quantité"
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setLines((current) =>
                                        current.length > 1
                                            ? current.filter((item) => item.key !== line.key)
                                            : current
                                    )
                                }
                                disabled={lines.length === 1}
                                className="self-end p-2 text-gray-400 hover:text-purple-600 disabled:opacity-30 sm:self-auto"
                                aria-label="Supprimer la ligne"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => setLines((current) => [...current, emptyLine()])}
                        className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 w-fit"
                    >
                        <Plus className="w-4 h-4" />
                        Ajouter un produit
                    </button>
                </div>
                <CustomerChoice
                    customers={customers}
                    customerId={customerId}
                    onCustomerIdChange={setCustomerId}
                    onCustomerCreated={(customer) =>
                        setCustomers((current) =>
                            [...current, customer].sort((a, b) => a.name.localeCompare(b.name))
                        )
                    }
                />
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                        Mode de paiement *
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {paymentMethods.map((method) => (
                            <button
                                key={method.value}
                                type="button"
                                onClick={() => setPaymentMethod(method.value)}
                                className={`px-3 py-2 text-sm rounded border ${paymentMethod === method.value ? "border-purple-600 bg-purple-50 text-purple-700 font-semibold" : "border-gray-200 text-gray-600"}`}
                            >
                                {method.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Note</label>
                    <textarea
                        rows={2}
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        className={inputClass}
                    />
                </div>
                <div className="border-t border-gray-100 pt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div>
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(total, shopCurrency)}
                        </p>
                    </div>
                    <button
                        type="submit"
                        disabled={!isValid || loading}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded hover:bg-purple-700 disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <ShoppingCart className="w-4 h-4" />
                        )}
                        {loading ? "Enregistrement..." : "Enregistrer la vente"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function SaleNewPage() {
    return (
        <div className="flex-1 flex items-start justify-center p-4 sm:p-8">
            <Suspense
                fallback={
                    <div className="w-full max-w-7xl bg-white border border-gray-200 rounded p-6 space-y-6">
                        <Skeleton className="h-8 w-64" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                        <Skeleton className="h-10 w-40" />
                    </div>
                }
            >
                <SaleNewForm />
            </Suspense>
        </div>
    );
}
