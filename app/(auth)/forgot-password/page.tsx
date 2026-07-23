"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { forgotPasswordSchema } from "@/lib/validations";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const result = forgotPasswordSchema.safeParse({ email });
        if (!result.success) {
            setError(result.error.issues[0].message);
            setIsLoading(false);
            return;
        }

        try {
            await authClient.requestPasswordReset({
                email,
                redirectTo: "/reset-password",
            }, {
                onSuccess: () => {
                    setIsSubmitted(true);
                },
                onError: (ctx) => {
                    setError(ctx.error.message || "Une erreur est survenue.");
                }
            });
        } catch (err) {
            setError("Une erreur inattendue est survenue.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 bg-purple-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-sm border border-purple-100">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold text-purple-900">Mot de passe oublié</h1>
                    <p className="text-purple-600 font-semibold">
                        Entrez votre email pour réinitialiser votre mot de passe
                    </p>
                </div>
                
                {isSubmitted ? (
                    <div className="space-y-4 text-center">
                        <div className="p-4 bg-purple-50 border border-purple-100 rounded text-purple-900 font-semibold">
                            Si un compte existe pour cet email, vous recevrez bientôt un lien de réinitialisation.
                        </div>
                        <Link
                            href="/login"
                            className="inline-flex items-center font-bold text-purple-600 hover:text-purple-900"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour à la connexion
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded text-xs text-red-600">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-semibold text-purple-900">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="nom@exemple.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-purple-200 rounded focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                            />
                        </div>
                        
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center px-4 py-2 text-white bg-purple-600 rounded hover:bg-purple-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Envoi en cours&nbsp;...
                                </>
                            ) : (
                                "Envoyer le lien"
                            )}
                        </button>

                        <div className="text-center">
                            <Link
                                href="/login"
                                className="inline-flex items-center text-sm font-bold text-purple-600 hover:text-purple-900"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour à la connexion
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
