"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

import AuthLink from "@/components/auth-link";
import CurrencyToggle from "@/components/currency-toggle";

// ─── Data ─────────────────────────────────────────────────────────────────────

type Currency = "USD" | "FC";

interface Plan {
    name: string;
    priceUSD: number;
    priceFC: number;
    period: string;
    description: string;
    features: string[];
    cta: string;
    href: string;
    featured?: boolean;
    authenticatedHref?: string;
}

const plans: Plan[] = [
    {
        name: "Gratuit",
        priceUSD: 0,
        priceFC: 0,
        period: "à vie",
        description: "Pour tester et démarrer doucement votre activité.",
        features: ["Jusqu'à 20 produits", "Tableau de bord du jour", "Lien boutique public"],
        cta: "Commencer gratuitement",
        href: "/register",
    },
    {
        name: "Standard",
        priceUSD: 2.2,
        priceFC: 5000,
        period: "/ mois",
        description: "L'essentiel pour gérer votre commerce au quotidien.",
        features: [
            "Produits illimités",
            "Historique complet",
            "Gestion des clients",
            "Factures PDF + alertes stock",
        ],
        cta: "Choisir Standard",
        href: "/register",
        featured: true,
        authenticatedHref: "/dashboard/subscription?plan=standard",
    },
    {
        name: "Pro",
        priceUSD: 5,
        priceFC: 11250,
        period: "/ mois",
        description: "Pour les commerces en pleine expansion.",
        features: [
            "Tout du plan Standard",
            "Multi-utilisateurs",
            "Export Excel / CSV",
            "Rapport mensuel",
        ],
        cta: "Choisir Pro",
        href: "/register",
        authenticatedHref: "/dashboard/subscription?plan=pro",
    },
];

const faq = [
    {
        q: "Comment se passe le paiement\u00A0?",
        a: "Nous acceptons les paiements par Mobile Money (M-Pesa, Orange Money, Airtel Money). Vous n'avez pas besoin de carte bancaire pour utiliser Toteka.",
    },
    {
        q: "Puis-je changer de forfait plus tard\u00A0?",
        a: "Oui, vous pouvez passer à un forfait supérieur ou inférieur à tout moment depuis vos paramètres. La différence sera calculée au prorata.",
    },
    {
        q: "Y a-t-il des frais cachés\u00A0?",
        a: "Absolument aucun. Le prix affiché est celui que vous payez. Toutes les mises à jour sont incluses dans votre abonnement.",
    },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PricingPage() {
    const [currency, setCurrency] = useState<Currency>("FC");

    const formatPrice = (plan: Plan) => {
        if (currency === "USD") {
            return `${plan.priceUSD.toLocaleString("fr-FR")}\u00A0$`;
        }
        return `${plan.priceFC.toLocaleString("fr-FR")}\u00A0Fc`;
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <section className="bg-purple-900 py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <p className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-4">
                        Tarifs
                    </p>
                    <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight max-w-2xl mb-5">
                        Un tarif simple et transparent
                    </h1>
                    <p className="text-base text-purple-300 max-w-xl leading-relaxed">
                        Choisissez le plan qui correspond à la taille de votre commerce. Changez ou
                        annulez à tout moment.
                    </p>
                </div>
            </section>

            {/* Plans */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <CurrencyToggle currency={currency} onChange={setCurrency} />

                    <div className="grid md:grid-cols-3 gap-5">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={`flex flex-col rounded border ${
                                    plan.featured
                                        ? "border-purple-700 bg-purple-900"
                                        : "border-gray-200 bg-white"
                                }`}
                            >
                                {/* Plan header */}
                                <div
                                    className={`px-7 pt-7 pb-6 border-b ${plan.featured ? "border-purple-800" : "border-gray-100"}`}
                                >
                                    <p
                                        className={`text-xs font-bold uppercase tracking-widest mb-3 ${plan.featured ? "text-purple-400" : "text-gray-400"}`}
                                    >
                                        {plan.name}
                                    </p>
                                    <div className="flex items-end gap-1.5">
                                        <span
                                            className={`text-5xl font-bold tracking-tight leading-none ${plan.featured ? "text-white" : "text-gray-900"}`}
                                        >
                                            {formatPrice(plan)}
                                        </span>
                                        {plan.period && (
                                            <span
                                                className={`text-sm mb-1 ${plan.featured ? "text-purple-400" : "text-gray-400"}`}
                                            >
                                                {plan.period}
                                            </span>
                                        )}
                                    </div>
                                    <p
                                        className={`text-sm mt-3 leading-relaxed ${plan.featured ? "text-purple-300" : "text-gray-500"}`}
                                    >
                                        {plan.description}
                                    </p>
                                </div>

                                {/* Features */}
                                <div className="flex-1 px-7 py-6">
                                    <ul className="flex flex-col gap-3.5">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-start gap-2.5">
                                                <Check
                                                    className={`w-4 h-4 shrink-0 mt-0.5 ${plan.featured ? "text-purple-400" : "text-purple-600"}`}
                                                />
                                                <span
                                                    className={`text-sm ${plan.featured ? "text-purple-100" : "text-gray-700"}`}
                                                >
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* CTA */}
                                <div className="px-7 pb-7">
                                    <AuthLink
                                        href={plan.href}
                                        className={`block text-sm font-semibold text-center py-2.5 rounded border transition-colors ${
                                            plan.featured
                                                ? "bg-white text-purple-900 border-white hover:bg-purple-50"
                                                : "border-purple-600 text-purple-600 hover:bg-purple-50"
                                        }`}
                                        authenticatedHref={plan.authenticatedHref}
                                        authenticatedText={plan.cta}
                                    >
                                        {plan.cta}
                                    </AuthLink>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Paiement */}
                    <p className="text-xs text-gray-400 mt-6 text-center">
                        Paiement par Mobile Money\u00A0: Airtel Money, Orange Money, M-Pesa. Aucun
                        engagement.
                    </p>
                </div>
            </section>

            {/* FAQ */}
            <section className="border-t border-gray-100 py-20 px-6">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 mb-10">Questions fréquentes</h2>
                    <div className="divide-y divide-gray-100">
                        {faq.map(({ q, a }) => (
                            <div key={q} className="py-6">
                                <h3 className="font-semibold text-gray-900 mb-2">{q}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="bg-purple-900 py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-white tracking-tight mb-4 max-w-xl">
                        Prêt à structurer votre activité ?
                    </h2>
                    <p className="text-purple-300 mb-8 max-w-md leading-relaxed">
                        Rejoignez les vendeurs qui ont dit adieu au cahier et au stress du stock.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <AuthLink
                            href="/register"
                            className="text-sm font-semibold bg-white text-purple-900 px-5 py-2.5 rounded hover:bg-purple-50 transition-colors"
                        >
                            Commencer gratuitement
                        </AuthLink>
                        <Link
                            href="/features"
                            className="text-sm font-semibold border border-purple-700 text-purple-300 px-5 py-2.5 rounded hover:border-purple-500 transition-colors"
                        >
                            Voir les fonctionnalités
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
