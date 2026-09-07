"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Plus, Pencil, Trash2, Shield, Crown } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type MemberRole = "OWNER" | "CASHIER" | "VIEWER";

interface ShopMember {
    id: string;
    name: string;
    email: string;
    role: MemberRole;
    isCurrentUser?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const roleLabel: Record<MemberRole, string> = {
    OWNER: "Propriétaire",
    CASHIER: "Caissier",
    VIEWER: "Lecteur",
};

const roleDescription: Record<MemberRole, string> = {
    OWNER: "Accès complet à la boutique",
    CASHIER: "Ventes, commandes et clients",
    VIEWER: "Consultation uniquement",
};

// ─── Shared classes ───────────────────────────────────────────────────────────

const inputCls =
    "w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-purple-600 transition-colors bg-white";

const labelCls = "block text-xs font-semibold text-gray-700 mb-1.5";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ShopMembersPage() {
    // TODO: charger le plan et les membres depuis l'API
    const [hasProPlan] = useState(false);
    const [members, setMembers] = useState<ShopMember[]>([
        {
            id: "1",
            name: "Vous",
            email: "proprietaire@exemple.com",
            role: "OWNER",
            isCurrentUser: true,
        },
    ]);
    const [adding, setAdding] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<MemberRole>("CASHIER");
    const [editId, setEditId] = useState<string | null>(null);
    const [editRole, setEditRole] = useState<MemberRole>("CASHIER");
    const [loading, setLoading] = useState(false);

    const handleInvite = async (e: React.SubmitEvent) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;
        setLoading(true);
        try {
            // TODO: POST /api/shop/members
            const created: ShopMember = {
                id: Date.now().toString(),
                name: inviteEmail.split("@")[0],
                email: inviteEmail.trim(),
                role: inviteRole,
            };
            setMembers((prev) => [...prev, created]);
            setInviteEmail("");
            setInviteRole("CASHIER");
            setAdding(false);
        } finally {
            setLoading(false);
        }
    };

    const handleEditRole = async (id: string) => {
        setLoading(true);
        try {
            // TODO: PATCH /api/shop/members/:id
            setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role: editRole } : m)));
            setEditId(null);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (id: string) => {
        if (!confirm("Voulez-vous vraiment retirer ce membre de la boutique ?")) return;
        setMembers((prev) => prev.filter((m) => m.id !== id));
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-8 max-w-7xl w-full">
            {/* Header */}
            <div>
                <Link
                    href="/dashboard/shop"
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors mb-4"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Retour aux paramètres de la boutique
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Équipe</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Invitez des collaborateurs à gérer votre boutique.
                        </p>
                    </div>
                    {hasProPlan && !adding && (
                        <button
                            onClick={() => setAdding(true)}
                            className="flex items-center gap-2 text-sm font-semibold bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Inviter un membre
                        </button>
                    )}
                </div>
            </div>

            {/* Upgrade gate */}
            {!hasProPlan && (
                <div className="bg-white border border-purple-200 rounded p-8 flex flex-col items-center text-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded">
                        <Crown className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-gray-900">
                            Fonctionnalité réservée au plan Pro
                        </h2>
                        <p className="text-sm text-gray-500 mt-1 max-w-md">
                            Ajoutez des caissiers et des lecteurs pour travailler en équipe sur
                            votre boutique.
                        </p>
                    </div>
                    <Link
                        href="/dashboard/subscription?plan=pro"
                        className="text-sm font-semibold bg-purple-600 text-white px-5 py-2.5 rounded hover:bg-purple-700 transition-colors"
                    >
                        Passer au plan Pro
                    </Link>
                </div>
            )}

            {hasProPlan && (
                <>
                    {/* Invite form */}
                    {adding && (
                        <form
                            onSubmit={handleInvite}
                            className="bg-white border border-gray-200 rounded p-6 flex flex-col gap-4"
                        >
                            <h2 className="text-sm font-bold text-gray-900">Inviter un membre</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Adresse email</label>
                                    <input
                                        autoFocus
                                        type="email"
                                        placeholder="collaborateur@exemple.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className={inputCls}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={labelCls}>Rôle</label>
                                    <select
                                        value={inviteRole}
                                        onChange={(e) =>
                                            setInviteRole(e.target.value as MemberRole)
                                        }
                                        className={inputCls}
                                    >
                                        <option value="CASHIER">Caissier</option>
                                        <option value="VIEWER">Lecteur</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAdding(false);
                                        setInviteEmail("");
                                    }}
                                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-2"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={!inviteEmail.trim() || loading}
                                    className="text-sm font-semibold bg-purple-600 text-white px-5 py-2.5 rounded hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Envoi..." : "Envoyer l\u2019invitation"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Members list */}
                    {members.length === 0 ? (
                        <div className="bg-white border border-gray-200 rounded flex flex-col items-center justify-center py-16 gap-3">
                            <Users className="w-9 h-9 text-gray-200" />
                            <p className="text-sm font-medium text-gray-500">Aucun membre</p>
                            <p className="text-xs text-gray-400">
                                Invitez votre première personne pour commencer.
                            </p>
                            <button
                                onClick={() => setAdding(true)}
                                className="mt-2 text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                            >
                                Inviter un membre
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded overflow-hidden divide-y divide-gray-100">
                            {members.map((member) => (
                                <div key={member.id} className="flex items-center gap-3 px-4 py-4">
                                    <div className="w-9 h-9 shrink-0 bg-purple-50 text-purple-600 rounded flex items-center justify-center text-xs font-bold">
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {member.name}
                                                {member.isCurrentUser && (
                                                    <span className="text-xs text-gray-400 font-normal ml-1">
                                                        (vous)
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-400 truncate">
                                            {member.email}
                                        </p>
                                    </div>

                                    {editId === member.id ? (
                                        <div className="flex items-center gap-2 shrink-0">
                                            <select
                                                value={editRole}
                                                onChange={(e) =>
                                                    setEditRole(e.target.value as MemberRole)
                                                }
                                                className={inputCls + " w-auto"}
                                            >
                                                <option value="CASHIER">Caissier</option>
                                                <option value="VIEWER">Lecteur</option>
                                            </select>
                                            <button
                                                onClick={() => handleEditRole(member.id)}
                                                disabled={loading}
                                                className="text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors disabled:opacity-40"
                                            >
                                                Enregistrer
                                            </button>
                                            <button
                                                onClick={() => setEditId(null)}
                                                className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                                            >
                                                Annuler
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="hidden sm:flex flex-col items-end shrink-0">
                                                <span className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                                                    {member.role === "OWNER" ? (
                                                        <Shield className="w-3 h-3 text-purple-600" />
                                                    ) : null}
                                                    {roleLabel[member.role]}
                                                </span>
                                                <span className="text-[10px] text-gray-400">
                                                    {roleDescription[member.role]}
                                                </span>
                                            </div>
                                            {member.role !== "OWNER" && (
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <button
                                                        onClick={() => {
                                                            setEditId(member.id);
                                                            setEditRole(member.role);
                                                        }}
                                                        className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                                                        aria-label="Modifier le rôle"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemove(member.id)}
                                                        className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                        aria-label="Retirer le membre"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
