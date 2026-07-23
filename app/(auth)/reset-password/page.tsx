"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { resetPasswordSchema } from "@/lib/validations";

// ─── Shared classes ───────────────────────────────────────────────────────────

const inputCls =
    "w-full border border-gray-200 rounded px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-purple-600 transition-colors bg-white";

const labelCls = "block text-xs font-semibold text-gray-700 mb-1.5";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResetPasswordPage() {
    const router = useRouter();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();

        const result = resetPasswordSchema.safeParse({ password, confirmPassword });
        if (!result.success) {
            setError(result.error.issues[0].message);
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            await authClient.resetPassword(
                { newPassword: password },
                {
                    onSuccess: () => router.push("/login"),
                    onError: (ctx) => setError(ctx.error.message || "Une erreur est survenue."),
                }
            );
        } catch {
            setError("Une erreur inattendue est survenue.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-sm bg-white border border-gray-200 rounded p-8 flex flex-col gap-7">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 w-fit">
                    <div className="w-7 h-7 bg-purple-600 rounded flex items-center justify-center text-white font-bold text-xs shrink-0">
                        T
                    </div>
                    <span className="font-bold text-sm text-gray-900">Toteka Stock</span>
                </Link>

                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-bold text-gray-900">Nouveau mot de passe</h1>
                    <p className="text-sm text-gray-500">Choisissez un mot de passe sécurisé.</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {error && (
                        <div className="bg-red-50 border border-red-100 rounded p-3 text-xs text-red-600">
                            {error}
                        </div>
                    )}
                    <div>
                        <label htmlFor="password" className={labelCls}>
                            Nouveau mot de passe
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            minLength={8}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={inputCls}
                        />
                        <p className="text-[11px] text-gray-400 mt-1.5">8 caractères minimum.</p>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className={labelCls}>
                            Confirmer le mot de passe
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={inputCls}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-purple-600 text-white py-2.5 rounded hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isLoading
                            ? "Réinitialisation en cours..."
                            : "Réinitialiser le mot de passe"}
                    </button>
                </form>

                {/* Footer */}
                <p className="text-xs text-gray-500 text-center">
                    <Link
                        href="/login"
                        className="font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                    >
                        Retour à la connexion
                    </Link>
                </p>
            </div>
        </div>
    );
}
