import Image from "next/image";
import {
    Package,
    ShoppingCart,
    Users,
    FileText,
    Share2,
    Bell,
    History,
    MessageSquare,
    Smartphone,
    ShieldCheck,
    type LucideIcon,
} from "lucide-react";

import AuthLink from "@/components/auth-link";
import { Metadata } from "next";

// ─── Data ─────────────────────────────────────────────────────────────────────

interface FeatureItem {
    icon: LucideIcon;
    text: string;
}

interface Feature {
    title: string;
    description: string;
    items: FeatureItem[];
    image: string;
    reverse?: boolean;
}

export const metadata: Metadata = {
    title: "Fonctionnalités",
    description:
        "Découvrez toutes les fonctionnalités de Toteka Stock : gestion de stock, ventes, clients, factures et alertes.",
};

const features: Feature[] = [
    {
        title: "Gestion de stock simplifiée",
        description:
            "Suivez vos articles en temps réel et évitez les ruptures de stock inattendues.",
        items: [
            { icon: Package, text: "Inventaire complet avec photos et catégories." },
            { icon: Bell, text: "Alertes automatiques pour les produits en fin de stock." },
            { icon: History, text: "Historique détaillé des entrées et sorties de marchandises." },
        ],
        image: "/images/inventory-management.svg",
    },
    {
        title: "Ventes et facturation",
        description:
            "Enregistrez vos transactions rapidement et fournissez des preuves d'achat professionnelles.",
        items: [
            { icon: ShoppingCart, text: "Saisie de vente ultra-rapide adaptée au mobile." },
            { icon: FileText, text: "Génération automatique de factures PDF à votre nom." },
            { icon: Share2, text: "Partage direct des reçus via vos canaux ou email." },
        ],
        image: "/images/invoice.jpg",
        reverse: true,
    },
    {
        title: "Relation client",
        description:
            "Connaissez vos meilleurs clients et gérez les paiements à crédit en toute sérénité.",
        items: [
            { icon: Users, text: "Répertoire client avec historique d'achats complet." },
            {
                icon: MessageSquare,
                text: "Coordonnées client accessibles depuis une fiche dédiée.",
            },
            { icon: ShieldCheck, text: "Suivi rigoureux des dettes et des paiements partiels." },
        ],
        image: "/images/customer-relation.svg",
    },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <section className="bg-purple-50 border-b border-purple-100 py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-4 max-w-2xl">
                        Toutes les fonctionnalités pour votre commerce
                    </h1>
                    <p className="text-lg text-gray-600 max-w-xl leading-relaxed">
                        Toteka Stock est conçu spécifiquement pour les vendeurs qui souhaitent
                        passer à la vitesse supérieure sans complexité inutile.
                    </p>
                </div>
            </section>

            {/* Fonctionnalités détaillées */}
            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto flex flex-col gap-24">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-20 ${
                                feature.reverse ? "lg:flex-row-reverse" : ""
                            }`}
                        >
                            {/* Texte */}
                            <div className="flex-1">
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                    {feature.title}
                                </h2>
                                <p className="text-gray-600 mb-8 leading-relaxed">
                                    {feature.description}
                                </p>
                                <ul className="flex flex-col gap-4">
                                    {feature.items.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="mt-0.5 bg-purple-100 p-1.5 rounded text-purple-600 shrink-0">
                                                <item.icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-gray-700 font-medium">
                                                {item.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Image */}
                            <div className="flex-1 w-full">
                                <div className="relative aspect-4/3 overflow-hidden">
                                    <Image
                                        src={feature.image}
                                        alt={feature.title}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Mobilité */}
            <section className="bg-gray-50 border-t border-gray-100 py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="w-11 h-11 bg-purple-600 text-white rounded flex items-center justify-center mb-6">
                        <Smartphone className="w-5 h-5" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Votre commerce vous suit partout
                    </h2>
                    <p className="text-gray-600 mb-8 leading-relaxed text-base max-w-2xl">
                        Toteka Stock fonctionne parfaitement sur smartphone, tablette et ordinateur.
                        Synchronisation en temps réel pour que vous ne perdiez jamais le fil, que
                        vous soyez en boutique ou en déplacement.
                    </p>
                    <AuthLink
                        href="/register"
                        className="inline-flex items-center bg-purple-600 text-white px-5 py-2.5 rounded font-semibold hover:bg-purple-700 transition-colors text-sm"
                    >
                        Commencer maintenant
                    </AuthLink>
                </div>
            </section>
        </div>
    );
}
