"use client";

import { Check } from "lucide-react";
import AuthLink from "@/components/auth-link";

interface Plan {
    name: string;
    priceFC: number;
    period: string;
    description: string;
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
        name: "Essai gratuit",
        priceFC: 0,
        period: "14 jours",
        description:
            "Accès à l'ensemble des fonctionnalités pendant 14 jours, sans limitation.",
        features: [
            "Produits et ventes illimités",
            "Historique complet",
            "Factures et reçus PDF",
            "Alertes stock et statistiques",
        ],
        cta: "Commencer l'essai gratuit",
        href: "/register",
    },
    {
        name: "Abonnement",
        priceFC: 10000,
        period: "/ mois",
        description: "Pour continuer à utiliser Toteka après votre essai gratuit.",
        features: [
            "Produits et ventes illimités",
            "Historique complet",
            "Factures et reçus PDF",
            "Alertes stock et statistiques avancées",
            "Multi-utilisateurs et export en option",
        ],
        cta: "S'abonner",
        href: "/register",
        featured: true,
        authenticatedHref: "/dashboard/subscription?plan=PRO",
    },
];

export default function PricingSection() {
    const formatPrice = (plan: Plan) => `${plan.priceFC.toLocaleString("fr-FR")} Fc`;

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
                        14 jours d&apos;essai gratuit, puis 10 000 Fc par mois.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`flex flex-col rounded border ${plan.featured ? "border-purple-700 bg-purple-900" : "border-gray-200 bg-white"}`}
                        >
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
                                        className={`text-5xl font-bold leading-none ${plan.featured ? "text-white" : "text-gray-900"}`}
                                    >
                                        {formatPrice(plan)}
                                    </span>
                                    <span
                                        className={`text-sm mb-1 ${plan.featured ? "text-purple-400" : "text-gray-400"}`}
                                    >
                                        {plan.period}
                                    </span>
                                </div>
                                <p
                                    className={`text-sm mt-3 leading-relaxed ${plan.featured ? "text-purple-300" : "text-gray-500"}`}
                                >
                                    {plan.description}
                                </p>
                            </div>
                            <div className="flex-1 px-7 py-6">
                                <ul className="flex flex-col gap-3.5">
                                    {plan.features.map((item) => (
                                        <li
                                            key={item}
                                            className="flex gap-2.5 items-start text-sm text-gray-600"
                                        >
                                            <Check
                                                className={`w-4 h-4 shrink-0 mt-0.5 ${plan.featured ? "text-purple-400" : "text-purple-600"}`}
                                            />
                                            <span
                                                className={`text-sm ${plan.featured ? "text-purple-100" : "text-gray-700"}`}
                                            >
                                                {item}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="px-7 pb-7">
                                <AuthLink
                                    href={plan.href}
                                    className={`block w-full text-sm font-semibold text-center py-2.5 rounded border transition-colors ${
                                        plan.featured
                                            ? "bg-white text-purple-900 border-white hover:bg-purple-50"
                                            : "border border-purple-600 text-purple-600 hover:bg-purple-50"
                                    }`}
                                    authenticatedText={plan.cta}
                                    authenticatedHref={plan.authenticatedHref}
                                >
                                    {plan.cta}
                                </AuthLink>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
