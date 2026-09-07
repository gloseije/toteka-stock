"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { loginSchema } from "@/lib/validations";

// ─── Shared classes ───────────────────────────────────────────────────────────

const inputCls =
    "w-full border border-gray-200 rounded px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-purple-600 transition-colors bg-white";

const labelCls = "block text-xs font-semibold text-gray-700 mb-1.5";

// ─── Component ────────────────────────────────────────────────────────────────

export function LoginForm() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Client-side validation
        const result = loginSchema.safeParse({ email, password });
        if (!result.success) {
            setError(result.error.issues[0].message);
            setIsLoading(false);
            return;
        }

        try {
            await authClient.signIn.email(
                { email, password, callbackURL: "/dashboard" },
                {
                    onSuccess: () => {
                        router.push("/dashboard");
                        router.refresh();
                    },
                    onError: (ctx) => {
                        console.error("Auth error:", ctx.error);
                        setError(ctx.error.message || "Une erreur est survenue.");
                    },
                }
            );
        } catch (e) {
            console.error("Unexpected error:", e);
            setError("Une erreur inattendue est survenue.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded p-8 flex flex-col gap-7">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 w-fit">
                <Image
                    src="/toteka-stock-logo-primaire.svg"
                    alt="Toteka Stock"
                    width={160}
                    height={50}
                />
            </Link>

            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-xl font-bold text-gray-900">Connexion</h1>
                <p className="text-sm text-gray-500">Accédez à votre espace Toteka.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {error && (
                    <div className="bg-red-50 border border-red-100 rounded p-3 text-xs text-red-600">
                        {error}
                    </div>
                )}

                <div>
                    <label htmlFor="email" className={labelCls}>
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        placeholder="nom@exemple.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputCls}
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="password" className={labelCls + " mb-0"}>
                            Mot de passe
                        </label>
                        <Link
                            href="/forgot-password"
                            className="text-xs text-purple-600 hover:text-purple-700 transition-colors"
                        >
                            Mot de passe oublié ?
                        </Link>
                    </div>
                    <input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputCls}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-purple-600 text-white py-2.5 rounded hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isLoading ? "Connexion en cours..." : "Se connecter"}
                </button>
            </form>

            {/* Footer */}
            <p className="text-xs text-gray-500 text-center">
                Pas encore de compte ?{" "}
                <Link
                    href="/register"
                    className="font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                >
                    S&apos;inscrire
                </Link>
            </p>
        </div>
    );
}
