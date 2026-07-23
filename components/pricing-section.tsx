"use client";

import { useState } from "react";
import Link from "next/link";
import AuthLink from "@/components/auth-link";
import CurrencyToggle from "@/components/currency-toggle";

type Currency = "USD" | "FC";

interface Plan {
    name: string;
    priceUSD: number;
    priceFC: number;
    period: string;
    subtextUSD?: string;
    subtextFC?: string;
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
        features: ["Jusqu'à 20 produits", "Tableau de bord du jour", "Lien boutique public"],
        cta: "Commencer",
        href: "/register",
    },
    {
        name: "Standard",
        priceUSD: 2.2,
        priceFC: 5000,
        period: "/ mois",
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
        features: [
            "Tout du Standard",
            "Multi-utilisateurs",
            "Export Excel / CSV",
            "Rapport mensuel",
        ],
        cta: "Choisir Pro",
        href: "/register",
        authenticatedHref: "/dashboard/subscription?plan=pro",
    },
];

export default function PricingSection() {
    const [currency, setCurrency] = useState<Currency>("FC");

    const formatPrice = (plan: Plan) => {
        if (currency === "USD") {
            return `${plan.priceUSD.toLocaleString("fr-FR")}\u00A0$`;
        }
        return `${plan.priceFC.toLocaleString("fr-FR")}\u00A0Fc`;
    };

    return (
        <section id="pricing" className="bg-gray-50 border-b border-gray-100 py-20 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="max-w-lg mb-12">
                    <p className="text-xs font-semibold uppercase tracking-widest text-purple-600 mb-3">
                        Tarifs
                    </p>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                        Pensés pour la RDC
                    </h2>
                    <p className="mt-3 text-base text-gray-500">
                        Commencez gratuitement, évoluez quand vous êtes prêt.
                    </p>
                </div>

                <CurrencyToggle currency={currency} onChange={setCurrency} />

                <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`bg-white border ${
                                plan.featured ? "border-purple-200" : "border-gray-200"
                            } rounded p-7 flex flex-col gap-6 relative overflow-hidden`}
                        >
                            <div>
                                <p
                                    className={`text-xs font-semibold uppercase tracking-wider ${
                                        plan.featured ? "text-purple-600" : "text-gray-400"
                                    }`}
                                >
                                    {plan.name}
                                </p>
                                <p className="text-4xl font-bold tracking-tight text-gray-900 mt-2">
                                    {formatPrice(plan)}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">{plan.period}</p>
                            </div>
                            <hr className="border-gray-100" />
                            <ul className="flex flex-col gap-3 flex-1">
                                {plan.features.map((item) => (
                                    <li
                                        key={item}
                                        className="flex gap-2.5 items-start text-sm text-gray-600"
                                    >
                                        <span className="text-purple-600 font-semibold mt-px">✓</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <AuthLink
                                href={plan.href}
                                className={`text-sm font-semibold text-center py-2.5 rounded transition-colors ${
                                    plan.featured
                                        ? "bg-purple-600 text-white hover:bg-purple-700"
                                        : "border border-gray-200 text-gray-700 hover:border-purple-400 hover:text-purple-700"
                                }`}
                                authenticatedText={plan.cta}
                                authenticatedHref={plan.authenticatedHref}
                            >
                                {plan.cta}
                            </AuthLink>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
