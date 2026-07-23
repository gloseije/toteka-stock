"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Store, Save, Users, Globe, MessageCircle, MapPin, Coins, ImageIcon } from "lucide-react";

// ─── Shared classes ───────────────────────────────────────────────────────────

const inputCls =
    "w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-purple-600 transition-colors bg-white";

const labelCls = "block text-xs font-semibold text-gray-700 mb-1.5";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ShopSettingsPage() {
    const [name, setName] = useState("Ma Boutique");
    const [slug, setSlug] = useState("ma-boutique");
    const [whatsapp, setWhatsapp] = useState("+243");
    const [city, setCity] = useState("Kinshasa");
    const [currency, setCurrency] = useState("CDF");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // TODO: PATCH /api/shop
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-8 max-w-7xl w-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Paramètres de la boutique</h1>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-gray-50">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-sm font-bold text-gray-900">Identité</h2>
                            <p className="text-xs text-gray-400">
                                Nom et adresse publique de votre boutique.
                            </p>
                        </div>
                        <div className="flex flex-col gap-4">
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
                                <label className={labelCls}>Logo</label>
                                <div className="w-16 h-16 border border-gray-200 rounded bg-gray-50 flex items-center justify-center overflow-hidden">
                                    <ImageIcon className="w-6 h-6 text-gray-300" />
                                </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-gray-50">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-sm font-bold text-gray-900">
                                Contact & Localisation
                            </h2>
                            <p className="text-xs text-gray-400">
                                Comment vos clients peuvent vous joindre.
                            </p>
                        </div>
                        <div className="flex flex-col gap-4">
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

                    {/* Préférences */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-sm font-bold text-gray-900">Préférences</h2>
                            <p className="text-xs text-gray-400">
                                Réglages régionaux et monétaires.
                            </p>
                        </div>
                        <div>
                            <label className={labelCls}>Devise principale</label>
                            <div className="relative">
                                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className={`${inputCls} pl-10`}
                                >
                                    <option value="CDF">Franc Congolais (Fc)</option>
                                    <option value="USD">Dollar Américain ($)</option>
                                </select>
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
