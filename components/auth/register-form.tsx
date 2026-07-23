"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { registerSchema } from "@/lib/validations";

// ─── Shared classes ───────────────────────────────────────────────────────────

const inputCls =
    "w-full border border-gray-200 rounded px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-purple-600 transition-colors bg-white";

const labelCls = "block text-xs font-semibold text-gray-700 mb-1.5";

// ─── Component ────────────────────────────────────────────────────────────────

export function RegisterForm() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        // Client-side validation
        const result = registerSchema.safeParse({ name, email, password });
        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                const key = String(issue.path[0]);
                newErrors[key] = issue.message;
            });
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }

        try {
            await authClient.signUp.email(
                { email, password, name, callbackURL: "/onboarding" },
                {
                    onSuccess: () => {
                        router.push("/onboarding");
                        router.refresh();
                    },
                    onError: (ctx) => {
                        console.error("Auth error:", ctx.error);
                        const msg = ctx.error.message || "Une erreur est survenue.";

                        if (msg.toLowerCase().includes("email")) {
                            setErrors({ email: msg });
                        } else if (
                            msg.toLowerCase().includes("password") ||
                            msg.toLowerCase().includes("mot de passe")
                        ) {
                            setErrors({ password: msg });
                        } else if (
                            msg.toLowerCase().includes("name") ||
                            msg.toLowerCase().includes("nom")
                        ) {
                            setErrors({ name: msg });
                        } else {
                            setErrors({ root: msg });
                        }
                    },
                }
            );
        } catch (e) {
            console.error("Unexpected error:", e);
            setErrors({ root: "Une erreur inattendue est survenue." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
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
                <h1 className="text-xl font-bold text-gray-900">Créer un compte</h1>
                <p className="text-sm text-gray-500">
                    Gérez votre commerce depuis votre téléphone.
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {errors.root && <p className="text-xs text-red-600 text-center">{errors.root}</p>}

                <div>
                    <label htmlFor="name" className={labelCls}>
                        Nom complet
                    </label>
                    <input
                        id="name"
                        type="text"
                        placeholder="Jean Dupont"
                        required
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (errors.name) setErrors({ ...errors, name: "" });
                        }}
                        className={inputCls}
                    />
                    {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name}</p>}
                </div>

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
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors({ ...errors, email: "" });
                        }}
                        className={inputCls}
                    />
                    {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
                </div>

                <div>
                    <label htmlFor="password" className={labelCls}>
                        Mot de passe
                    </label>
                    <input
                        id="password"
                        type="password"
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password) setErrors({ ...errors, password: "" });
                        }}
                        className={inputCls}
                    />
                    <p className="text-[11px] text-gray-400 mt-1.5">8 caractères minimum.</p>
                    {errors.password && (
                        <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-purple-600 text-white py-2.5 rounded hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isLoading ? "Inscription en cours..." : "Créer mon compte"}
                </button>
            </form>

            {/* Footer */}
            <p className="text-xs text-gray-500 text-center">
                Déjà un compte ?{" "}
                <Link
                    href="/login"
                    className="font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                >
                    Se connecter
                </Link>
            </p>
        </div>
    );
}
