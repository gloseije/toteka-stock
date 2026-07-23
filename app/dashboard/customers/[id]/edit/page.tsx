"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// ─── Shared classes ───────────────────────────────────────────────────────────

const inputCls =
    "w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-purple-600 transition-colors bg-white";

const labelCls = "block text-xs font-semibold text-gray-700 mb-1.5";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomerEditPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // TODO: GET /api/customers/:id et pré-remplir les champs
    }, [params.id]);

    // ── Validation ─────────────────────────────────────────────────────────────

    const valid = name.trim().length > 0;

    // ── Submit ─────────────────────────────────────────────────────────────────

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        if (!valid) return;
        setLoading(true);
        try {
            // TODO: PATCH /api/customers/:id
            router.push(`/dashboard/customers/${params.id}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-start justify-center p-8">
            <div className="w-full max-w-7xl bg-white border border-gray-200 rounded p-8 flex flex-col gap-8">
                {/* Header */}
                <div>
                    <Link
                        href={`/dashboard/customers/${params.id}`}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Retour à la fiche client
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900">Modifier le client</h1>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Nom */}
                    <div>
                        <label className={labelCls}>Nom complet *</label>
                        <input
                            type="text"
                            placeholder="Ex.\u00A0: Jean Dupont"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={inputCls}
                            required
                        />
                    </div>

                    {/* Contact Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelCls}>Email</label>
                            <input
                                type="email"
                                placeholder="client@exemple.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Téléphone</label>
                            <input
                                type="tel"
                                placeholder="+243..."
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className={inputCls}
                            />
                        </div>
                    </div>

                    {/* Adresse */}
                    <div>
                        <label className={labelCls}>Adresse</label>
                        <textarea
                            rows={2}
                            placeholder="Adresse complète"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className={inputCls + " resize-none"}
                        />
                    </div>

                    {/* Note */}
                    <div>
                        <label className={labelCls}>Note interne</label>
                        <textarea
                            rows={3}
                            placeholder="Informations complémentaires sur le client"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className={inputCls + " resize-none"}
                        />
                    </div>

                    {/* Actions */}
                    <div className="border-t border-gray-100 pt-6 flex items-center justify-end gap-3">
                        <Link
                            href={`/dashboard/customers/${params.id}`}
                            className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-2"
                        >
                            Annuler
                        </Link>
                        <button
                            type="submit"
                            disabled={!valid || loading}
                            className="text-sm font-semibold bg-purple-600 text-white px-5 py-2.5 rounded hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {loading ? "Enregistrement..." : "Enregistrer les modifications"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
