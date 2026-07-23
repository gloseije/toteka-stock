"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";

// ─── Content ──────────────────────────────────────────────────────────────────

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    // Utilisation d'un état dérivé pour éviter d'appeler setState de manière synchrone dans useEffect
    const effectiveStatus = !token ? "error" : status;
    const effectiveMessage = !token ? "Jeton de vérification manquant." : message;

    useEffect(() => {
        if (!token) return;

        authClient
            .verifyEmail(
                { query: { token } },
                {
                    onSuccess: () => {
                        setStatus("success");
                        setMessage("Votre adresse email a été vérifiée.");
                    },
                    onError: (ctx) => {
                        setStatus("error");
                        setMessage(ctx.error.message || "La vérification a échoué.");
                    },
                }
            )
            .catch(() => {
                setStatus("error");
                setMessage("Une erreur inattendue est survenue.");
            });
    }, [token]);

    return (
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded p-8 flex flex-col gap-7">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 w-fit">
                <div className="w-7 h-7 bg-purple-600 rounded flex items-center justify-center text-white font-bold text-xs shrink-0">
                    T
                </div>
                <span className="font-bold text-sm text-gray-900">Toteka Stock</span>
            </Link>

            {/* Statut */}
            {effectiveStatus === "loading" && (
                <div className="flex flex-col gap-4">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Vérification en cours</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Veuillez patienter quelques instants.
                        </p>
                    </div>
                </div>
            )}

            {effectiveStatus === "success" && (
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Email vérifié</h1>
                            <p className="text-sm text-gray-500 mt-1">{effectiveMessage}</p>
                        </div>
                    </div>
                    <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 text-sm font-semibold bg-purple-600 text-white py-2.5 rounded hover:bg-purple-700 transition-colors"
                    >
                        Accéder à la connexion
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            )}

            {effectiveStatus === "error" && (
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                        <XCircle className="w-8 h-8 text-red-500" />
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">
                                Échec de la vérification
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">{effectiveMessage}</p>
                        </div>
                    </div>
                    <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 text-sm font-semibold border border-gray-200 text-gray-700 py-2.5 rounded hover:border-purple-400 hover:text-purple-700 transition-colors"
                    >
                        Retour à la connexion
                    </Link>
                </div>
            )}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
            <Suspense
                fallback={
                    <div className="w-full max-w-sm bg-white border border-gray-200 rounded p-8 flex flex-col gap-4">
                        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                        <p className="text-sm text-gray-500">Chargement...</p>
                    </div>
                }
            >
                <VerifyEmailContent />
            </Suspense>
        </div>
    );
}
