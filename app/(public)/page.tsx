import Image from "next/image";
import {
    Package,
    ShoppingCart,
    BarChart3,
    Users,
    FileText,
    Share2,
    type LucideIcon,
} from "lucide-react";

import HeroCTA from "@/components/hero-cta";
import AuthLink from "@/components/auth-link";
import PricingSection from "@/components/pricing-section";

interface Feature {
    Icon: LucideIcon;
    title: string;
    description: string;
}

const features: Feature[] = [
    {
        Icon: Package,
        title: "Catalogue produits",
        description: "Ajoutez et organisez vos produits avec photo, prix et stock disponible.",
    },
    {
        Icon: ShoppingCart,
        title: "Enregistrement des ventes",
        description:
            "Saisissez une vente en quelques secondes. Le stock se met à jour automatiquement.",
    },
    {
        Icon: BarChart3,
        title: "Tableau de bord",
        description:
            "Ventes du jour, commandes en cours et produits en rupture : tout en un coup d'œil.",
    },
    {
        Icon: Users,
        title: "Gestion des clients",
        description: "Historique des achats et informations client centralisées.",
    },
    {
        Icon: FileText,
        title: "Facturation PDF",
        description: "Générez une facture à votre nom et partagez-la directement avec le client.",
    },
    {
        Icon: Share2,
        title: "Partage du catalogue",
        description: "Partagez votre catalogue ou un produit sur vos canaux de vente.",
    },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
    return (
        <div className="min-h-screen bg-white text-gray-900">
            <section className="relative flex items-center min-h-125 lg:min-h-160 overflow-hidden">
                <Image
                    src="/images/hero.jpg"
                    alt=""
                    aria-hidden="true"
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-center"
                />

                <div className="absolute inset-0 z-10 bg-black/65" />

                <div className="relative z-20 w-full max-w-6xl mx-auto px-6 py-24">
                    <p className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-5">
                        Pour les vendeurs en RDC
                    </p>
                    <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white max-w-2xl">
                        Gérez vos ventes comme un commerce structuré.
                    </h1>
                    <p className="mt-5 text-lg text-gray-300 max-w-xl leading-relaxed">
                        Catalogue, stock, clients, factures : tout depuis votre téléphone. Sans
                        changer votre façon de vendre.
                    </p>
                    <HeroCTA />
                </div>
            </section>

            {/* ── Contexte ── */}
            <section className="bg-white border-b border-gray-100 py-20 px-6">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div className="relative w-full rounded overflow-hidden aspect-3/2">
                        <Image
                            src="/images/market.jpg"
                            alt="Vendeuse dans un marché africain"
                            fill
                            loading="eager"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-cover"
                        />
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-purple-600 mb-4">
                            Pourquoi Toteka
                        </p>
                        <h2 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                            Vos canaux de vente ne gèrent pas votre commerce.
                        </h2>
                        <p className="mt-4 text-base text-gray-600 leading-relaxed">
                            Toteka réunit votre catalogue, votre stock, vos clients et vos ventes
                            dans un même espace, quel que soit votre canal de vente.
                        </p>
                        <ul className="mt-8 flex flex-col gap-5">
                            {[
                                [
                                    "Stock en temps réel",
                                    "Mise à jour automatique à chaque vente enregistrée.",
                                ],
                                [
                                    "Chiffres clairs",
                                    "Chiffre d'affaires, bénéfice et commandes en attente.",
                                ],
                                [
                                    "Partage en 1 clic",
                                    "Catalogue ou facture partageable sur vos canaux de vente.",
                                ],
                            ].map(([title, desc]) => (
                                <li key={title} className="flex gap-3 items-start">
                                    <div className="w-1 h-1 rounded-full bg-purple-600 mt-2.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {title}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section id="features" className="bg-gray-50 border-b border-gray-100 py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="max-w-lg mb-12">
                        <p className="text-xs font-semibold uppercase tracking-widest text-purple-600 mb-3">
                            Fonctionnalités
                        </p>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                            Tout ce dont vous avez besoin
                        </h2>
                        <p className="mt-3 text-base text-gray-500">
                            Des outils pensés pour les vendeurs congolais qui veulent grandir sans
                            se compliquer la vie.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {features.map(({ Icon, title, description }) => (
                            <div
                                key={title}
                                className="bg-white border border-gray-200 rounded p-6"
                            >
                                <div className="w-8 h-8 bg-purple-50 rounded flex items-center justify-center text-purple-600 mb-4">
                                    <Icon className="w-4 h-4" />
                                </div>
                                <p className="font-semibold text-sm text-gray-900">{title}</p>
                                <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                                    {description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Mobile-first ── */}
            <section className="bg-white border-b border-gray-100 py-20 px-6">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-purple-600 mb-4">
                            Mobile-first
                        </p>
                        <h2 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                            Conçu pour le terrain, pas pour un bureau.
                        </h2>
                        <p className="mt-4 text-base text-gray-600 leading-relaxed">
                            Pas besoin d&apos;ordinateur. Toteka fonctionne entièrement depuis votre
                            smartphone, même avec une connexion limitée.
                        </p>
                    </div>

                    <div className="relative w-full rounded overflow-hidden aspect-4/3">
                        <Image
                            src="/images/seller.jpg"
                            alt="Vendeur africain dans son commerce"
                            fill
                            unoptimized
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-cover"
                        />
                    </div>
                </div>
            </section>

            {/* ── Pricing ── */}
            <PricingSection />

            {/* ── CTA ── */}
            <section className="bg-purple-900 py-20 px-6">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold leading-tight tracking-tight text-white">
                        Prêt à structurer votre activité ?
                    </h2>
                    <p className="mt-3 text-base text-purple-200 leading-relaxed">
                        Structurez votre activité sans changer votre façon de vendre.
                    </p>
                    <div className="flex flex-wrap gap-3 mt-8">
                        <AuthLink
                            href="/register"
                            className="text-sm font-semibold bg-white text-purple-700 px-5 py-2.5 rounded hover:bg-purple-50 transition-colors"
                        >
                            Créer mon compte gratuitement
                        </AuthLink>
                        <AuthLink
                            showButton={false}
                            href="/login"
                            className="text-sm font-semibold border border-purple-500 text-white px-5 py-2.5 rounded hover:border-purple-300 transition-colors"
                        >
                            Se connecter
                        </AuthLink>
                    </div>
                </div>
            </section>
        </div>
    );
}
