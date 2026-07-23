"use client";

import React, { useState, useEffect, useRef } from "react";
import { User, Mail, Lock, Save } from "lucide-react";
import { authClient } from "@/lib/auth-client";

// ─── Shared classes ───────────────────────────────────────────────────────────

const inputCls =
    "w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-purple-600 transition-colors bg-white";

const labelCls = "block text-xs font-semibold text-gray-700 mb-1.5";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
    const { data: session } = authClient.useSession();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [profileSuccess, setProfileSuccess] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current && session?.user) {
            initialized.current = true;
    
            setName(session.user.name ?? "");
            setEmail(session.user.email ?? "");
        }
    }, [session]);

    const profileValid = name.trim().length > 0;
    const passwordValid =
        currentPassword.length > 0 &&
        newPassword.length >= 8 &&
        newPassword === confirmPassword;

    const handleProfileSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        if (!profileValid) return;
        setProfileLoading(true);
        setProfileSuccess(false);
        try {
            // TODO: PATCH /api/user — mettre à jour le nom via Better Auth
            setProfileSuccess(true);
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess(false);

        if (newPassword !== confirmPassword) {
            setPasswordError("Les mots de passe ne correspondent pas.");
            return;
        }
        if (newPassword.length < 8) {
            setPasswordError("Le mot de passe doit contenir au moins 8 caractères.");
            return;
        }

        setPasswordLoading(true);
        try {
            // TODO: changer le mot de passe via Better Auth
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setPasswordSuccess(true);
        } catch {
            setPasswordError("Impossible de modifier le mot de passe. Réessayez.");
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-8 max-w-7xl w-full">
            {/* Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Mon compte</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Gérez vos informations personnelles et votre mot de passe.
                </p>
            </div>

            {/* Profile */}
            <form
                onSubmit={handleProfileSubmit}
                className="bg-white border border-gray-200 rounded overflow-hidden"
            >
                <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-sm font-bold text-gray-900">Profil</h2>
                            <p className="text-xs text-gray-400">
                                Vos informations de connexion.
                            </p>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className={labelCls}>Nom complet</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className={`${inputCls} pl-10`}
                                        placeholder="Votre nom"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Adresse email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        readOnly
                                        className={`${inputCls} pl-10 bg-gray-50 text-gray-500 cursor-not-allowed`}
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1.5">
                                    L&apos;email ne peut pas être modifié pour le moment.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex items-center justify-between">
                    {profileSuccess && (
                        <p className="text-xs text-green-600 font-medium">
                            Profil mis à jour avec succès.
                        </p>
                    )}
                    {!profileSuccess && <span />}
                    <button
                        type="submit"
                        disabled={!profileValid || profileLoading}
                        className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {profileLoading ? "Enregistrement..." : "Enregistrer le profil"}
                    </button>
                </div>
            </form>

            {/* Password */}
            <form
                onSubmit={handlePasswordSubmit}
                className="bg-white border border-gray-200 rounded overflow-hidden"
            >
                <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-sm font-bold text-gray-900">Mot de passe</h2>
                            <p className="text-xs text-gray-400">
                                Modifiez votre mot de passe de connexion.
                            </p>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className={labelCls}>Mot de passe actuel</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className={`${inputCls} pl-10`}
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Nouveau mot de passe</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className={`${inputCls} pl-10`}
                                        placeholder="8 caractères minimum"
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Confirmer le mot de passe</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={`${inputCls} pl-10`}
                                        placeholder="Répétez le mot de passe"
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>
                            {passwordError && (
                                <p className="text-xs text-red-600">{passwordError}</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex items-center justify-between">
                    {passwordSuccess && (
                        <p className="text-xs text-green-600 font-medium">
                            Mot de passe modifié avec succès.
                        </p>
                    )}
                    {!passwordSuccess && <span />}
                    <button
                        type="submit"
                        disabled={!passwordValid || passwordLoading}
                        className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                        <Lock className="w-4 h-4" />
                        {passwordLoading ? "Modification..." : "Changer le mot de passe"}
                    </button>
                </div>
            </form>
        </div>
    );
}
