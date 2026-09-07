"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Store, Save, Users, Globe, MessageCircle, MapPin } from "lucide-react";
import ImageUpload from "@/components/image-upload";
import { Skeleton } from "@/components/skeleton";

// ─── Shared classes ───────────────────────────────────────────────────────────

const inputCls =
    "w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-purple-600 transition-colors bg-white";

const labelCls = "block text-xs font-semibold text-gray-700 mb-1.5";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ShopSettingsPage() {
    const [name, setName] = useState("Ma Boutique");
    const [slug, setSlug] = useState("ma-boutique");
    const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
    const [whatsapp, setWhatsapp] = useState("+243");
    const [city, setCity] = useState("Kinshasa");
    const [currency, setCurrency] = useState<"CDF" | "USD">("CDF");
    const [exchangeRate, setExchangeRate] = useState("22500");
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    React.useEffect(() => {
        const fetchShop = async () => {
            try {
                const res = await fetch("/api/shop");
                if (res.ok) {
                    const data = await res.json();
                    if (data.shop) {
                        setName(data.shop.name || "");
                        setSlug(data.shop.slug || "");
                        setLogoUrl(data.shop.logoUrl || undefined);
                        setWhatsapp(data.shop.whatsapp || "");
                        setCity(data.shop.city || "");
                        setCurrency(data.shop.currency || "CDF");
                        setExchangeRate(String(data.shop.exchangeRate || 22500));
                    }
                }
            } catch (error) {
                console.error("Erreur lors de la récupération de la boutique", error);
            } finally {
                setPageLoading(false);
            }
        };

        fetchShop();
    }, []);

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/shop", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, slug, logoUrl, whatsapp, city, exchangeRate }),
            });

            if (!res.ok) {
                console.error("Erreur de mise à jour");
                alert("Une erreur est survenue lors de la mise à jour.");
                return;
            }
            alert("Boutique mise à jour avec succès !");
        } catch (error) {
            console.error(error);
            alert("Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
                <Skeleton className="h-8 w-64" />
                <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-32 w-full" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="flex justify-end">
                        <Skeleton className="h-10 w-40" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-8 max-w-7xl w-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Paramètres de la boutique
                    </h1>
                </div>
                <Link
                    href="/dashboard/shop/members"
                    className="flex items-center gap-2 text-xs font-semibold text-purple-600 border border-purple-200 px-4 py-2 rounded hover:bg-purple-50 transition-colors"
                >
                    <Users className="w-3.5 h-3.5" />
                    Gérer l&apos;équipe
                </Link>
            </div>

            <form
                onSubmit={handleSubmit}
                className="bg-white border border-gray-200 rounded overflow-hidden"
            >
                <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
                    {/* Identité */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8 border-b border-gray-50">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-sm font-bold text-gray-900">Identité</h2>
                            <p className="text-xs text-gray-400">
                                Nom et adresse publique de votre boutique.
                            </p>
                        </div>
                        <div className="flex flex-col gap-4 lg:col-span-2">
                            <div>
                                <label className={labelCls}>Nom de la boutique</label>
                                <div className="relative">
                                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className={`${inputCls} pl-10`}
                                        placeholder="Ex.\u00A0: Toteka Shop"
                                    />
                                </div>
                            </div>
                            <div>
                                <ImageUpload
                                    label="Logo"
                                    value={logoUrl}
                                    onChange={(url) => setLogoUrl(url)}
                                    onRemove={() => setLogoUrl(undefined)}
                                />
                            </div>
                            <div>
                                <label className={labelCls}>URL (Slug)</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        className={`${inputCls} pl-10`}
                                        placeholder="ma-boutique"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact & Localisation */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8 border-b border-gray-50">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-sm font-bold text-gray-900">
                                Contact & Localisation
                            </h2>
                            <p className="text-xs text-gray-400">
                                Comment vos clients peuvent vous joindre.
                            </p>
                        </div>
                        <div className="flex flex-col gap-4 lg:col-span-2">
                            <div>
                                <label className={labelCls}>WhatsApp</label>
                                <div className="relative">
                                    <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={whatsapp}
                                        onChange={(e) => setWhatsapp(e.target.value)}
                                        className={`${inputCls} pl-10`}
                                        placeholder="+243..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Ville</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        className={`${inputCls} pl-10`}
                                        placeholder="Ex: Kinshasa"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8 border-b border-gray-50">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-sm font-bold text-gray-900">
                                Devise et conversion
                            </h2>
                            <p className="text-xs text-gray-400">
                                Les calculs des ventes utilisent ces paramètres.
                            </p>
                        </div>
                        <div className="flex flex-col gap-4 lg:col-span-2">
                            <div>
                                <label className={labelCls}>Devise de la boutique</label>
                                <div className={`${inputCls} bg-gray-50 text-gray-500`}>
                                    {currency === "CDF"
                                        ? "Franc congolais (Fc)"
                                        : "Dollar américain ($)"}
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Taux de change : 10 $ =</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        value={exchangeRate}
                                        onChange={(e) => setExchangeRate(e.target.value)}
                                        className={inputCls}
                                    />
                                    <span className="text-sm text-gray-500">Fc</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {loading ? "Enregistrement..." : "Enregistrer les modifications"}
                    </button>
                </div>
            </form>
        </div>
    );
}
