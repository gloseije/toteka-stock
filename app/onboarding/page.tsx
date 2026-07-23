"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { shopSchema, productSchema } from "@/lib/validations";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShopData {
    name: string;
    city: string;
    category: string;
}

interface ProductData {
    name: string;
    price: string;
    stock: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
    "Alimentation",
    "Vêtements & Mode",
    "Cosmétiques & Beauté",
    "Électronique",
    "Maison & Décoration",
    "Autre",
];

const STEPS = ["Votre boutique", "Premier produit", "Confirmation"];

// ─── Shared input class ───────────────────────────────────────────────────────

const input =
    "w-full border border-gray-200 rounded px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-purple-600 transition-colors bg-white";

const label = "block text-xs font-semibold text-gray-700 mb-1.5";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
    const router = useRouter();

    const [step, setStep]       = useState<1 | 2 | 3>(1);
    const [shop, setShop]       = useState<ShopData>({ name: "", city: "", category: "" });
    const [product, setProduct] = useState<ProductData>({ name: "", price: "", stock: "" });
    const [skipped, setSkipped] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const next = () => {
        if (step === 1) {
            const result = shopSchema.safeParse(shop);
            if (!result.success) {
                const newErrors: Record<string, string> = {};
                result.error.issues.forEach((issue) => {
                    const fieldName = String(issue.path[0]);
                    const capitalized = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
                    newErrors["shop" + capitalized] = issue.message;
                });
                setErrors(newErrors);
                return;
            }
        }

        if (step === 2) {
            const result = productSchema.safeParse(product);
            if (!result.success) {
                const newErrors: Record<string, string> = {};
                result.error.issues.forEach((issue) => {
                    const fieldName = String(issue.path[0]);
                    const capitalized = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
                    newErrors["product" + capitalized] = issue.message;
                });
                setErrors(newErrors);
                return;
            }
        }

        setErrors({});
        setStep((s) => Math.min(s + 1, 3) as 1 | 2 | 3);
    };
    const back = () => {
        setErrors({});
        setStep((s) => Math.max(s - 1, 1) as 1 | 2 | 3);
    };

    const handleSkip = () => {
        setSkipped(true);
        setStep(3);
    };

    const handleFinish = () => {
        // TODO: persister shop + product via API avant redirection
        router.push("/dashboard");
    };


    return (
        <div className="min-h-screen bg-white flex flex-col lg:flex-row relative overflow-hidden">
            <div className="hidden lg:block lg:w-1/2 relative">
                <Image
                    src="https://images.unsplash.com/photo-1556742530-bc73f5230940?q=80&w=2070&auto=format&fit=crop"
                    alt="Commerçant utilisant Toteka"
                    fill
                    priority
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-purple-900/10" />
            </div>

            {/* Right Side: Content */}
            <div className="flex-1 flex flex-col bg-purple-50/50 relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute inset-0 pointer-events-none -z-10">
                    <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-purple-100/50 blur-[100px]" />
                    <div className="absolute top-[20%] -right-[5%] w-[35%] h-[35%] rounded-full bg-purple-200/30 blur-[80px]" />
                    <div className="absolute -bottom-[10%] left-[10%] w-[50%] h-[45%] rounded-full bg-purple-100/40 blur-[120px]" />
                </div>

                {/* Top bar */}
                <div className="px-6 py-6 lg:px-12 lg:py-8">
                    <Link href="/" className="flex items-center gap-2 w-fit">
                        <div className="w-7 h-7 bg-purple-600 rounded flex items-center justify-center text-white font-bold text-xs shrink-0">
                            T
                        </div>
                        <span className="font-bold text-sm text-gray-900 tracking-tight">Toteka Stock</span>
                    </Link>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex items-center justify-center px-4 py-8 lg:py-12">
                    <div className="w-full max-w-md">

                        {/* Progress bar */}
                        <div className="flex items-center gap-1.5 mb-2">
                            {STEPS.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                                        i + 1 <= step ? "bg-purple-600" : "bg-gray-200"
                                    }`}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between items-center mb-8">
                            <p className="text-xs text-gray-400">
                                Étape {step} sur {STEPS.length} — {STEPS[step - 1]}
                            </p>
                        </div>

                        <div className="bg-white border border-purple-100 rounded-md p-6 sm:p-8 shadow-sm">
                        {/* ── Étape 1 : Boutique ── */}
                        {step === 1 && (
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                                    Votre boutique
                                </h1>
                                <p className="text-sm text-gray-500 mt-1.5 mb-8">
                                    Ces informations apparaîtront sur votre page publique.
                                </p>

                                <div className="flex flex-col gap-5">
                                    <div>
                                        <label className={label}>Nom de la boutique *</label>
                                        <input
                                            type="text"
                                            placeholder="ex. Chez Marie Beauté"
                                            value={shop.name}
                                            onChange={(e) => {
                                                setShop({ ...shop, name: e.target.value });
                                                if (errors.shopName) setErrors({ ...errors, shopName: "" });
                                            }}
                                            className={input}
                                        />
                                        {errors.shopName && (
                                            <p className="mt-1.5 text-xs text-red-600">
                                                {errors.shopName}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className={label}>Ville *</label>
                                        <input
                                            type="text"
                                            placeholder="ex. Kinshasa"
                                            value={shop.city}
                                            onChange={(e) => {
                                                setShop({ ...shop, city: e.target.value });
                                                if (errors.shopCity) setErrors({ ...errors, shopCity: "" });
                                            }}
                                            className={input}
                                        />
                                        {errors.shopCity && (
                                            <p className="mt-1.5 text-xs text-red-600">
                                                {errors.shopCity}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className={label}>Catégorie *</label>
                                        <select
                                            value={shop.category}
                                            onChange={(e) => {
                                                setShop({ ...shop, category: e.target.value });
                                                if (errors.shopCategory) setErrors({ ...errors, shopCategory: "" });
                                            }}
                                            className={input}
                                        >
                                            <option value="">Sélectionner une catégorie</option>
                                            {CATEGORIES.map((c) => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                        {errors.shopCategory && (
                                            <p className="mt-1.5 text-xs text-red-600">
                                                {errors.shopCategory}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={next}
                                    className="mt-8 w-full flex items-center justify-center gap-2 bg-purple-600 text-white text-sm font-semibold py-2.5 rounded hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Continuer <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* ── Étape 2 : Premier produit ── */}
                        {step === 2 && (
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                                    Premier produit
                                </h1>
                                <p className="text-sm text-gray-500 mt-1.5 mb-8">
                                    Ajoutez un produit pour démarrer votre catalogue.
                                </p>

                                <div className="flex flex-col gap-5">
                                    <div>
                                        <label className={label}>Nom du produit</label>
                                        <input
                                            type="text"
                                            placeholder="ex. Savon Omo 500g"
                                            value={product.name}
                                            onChange={(e) => {
                                                setProduct({ ...product, name: e.target.value });
                                                if (errors.productName) setErrors({ ...errors, productName: "" });
                                            }}
                                            className={input}
                                        />
                                        {errors.productName && (
                                            <p className="mt-1.5 text-xs text-red-600">
                                                {errors.productName}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={label}>Prix de vente (Fc)</label>
                                            <input
                                                type="number"
                                                min={0}
                                                placeholder="ex. 1 500"
                                                value={product.price}
                                                onChange={(e) => {
                                                    setProduct({ ...product, price: e.target.value });
                                                    if (errors.productPrice) setErrors({ ...errors, productPrice: "" });
                                                }}
                                                className={input}
                                            />
                                            {errors.productPrice && (
                                                <p className="mt-1.5 text-xs text-red-600">
                                                    {errors.productPrice}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className={label}>Stock initial</label>
                                            <input
                                                type="number"
                                                min={0}
                                                placeholder="ex. 50"
                                                value={product.stock}
                                                onChange={(e) => {
                                                    setProduct({ ...product, stock: e.target.value });
                                                    if (errors.productStock) setErrors({ ...errors, productStock: "" });
                                                }}
                                                className={input}
                                            />
                                            {errors.productStock && (
                                                <p className="mt-1.5 text-xs text-red-600">
                                                    {errors.productStock}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-col gap-3">
                                    <button
                                        onClick={next}
                                        className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white text-sm font-semibold py-2.5 rounded hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Continuer <ArrowRight className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={handleSkip}
                                        className="text-sm text-gray-400 hover:text-gray-600 transition-colors py-1 text-center"
                                    >
                                        Passer cette étape
                                    </button>
                                </div>

                                <button
                                    onClick={back}
                                    className="mt-6 flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Retour
                                </button>
                            </div>
                        )}

                        {/* ── Étape 3 : Confirmation ── */}
                        {step === 3 && (
                            <div>
                                <div className="w-11 h-11 bg-purple-50 rounded-full flex items-center justify-center mb-6">
                                    <Check className="w-5 h-5 text-purple-600" />
                                </div>

                                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                                    Tout est prêt
                                </h1>
                                <p className="text-sm text-gray-500 mt-1.5 mb-8">
                                    Votre boutique est configurée. Vous pouvez commencer à gérer vos ventes.
                                </p>

                                {/* Résumé */}
                                <div className="border border-purple-100 rounded divide-y divide-purple-50">
                                    {[
                                        ["Boutique", shop.name],
                                        ["Ville", shop.city],
                                        ["Catégorie", shop.category],
                                        [
                                            "Premier produit",
                                            skipped || !product.name ? "Non ajouté" : product.name,
                                        ],
                                    ].map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between px-4 py-3">
                                            <span className="text-xs text-gray-400">{key}</span>
                                            <span className={`text-sm font-medium ${value === "Non ajouté" ? "text-gray-400" : "text-gray-900"}`}>
                                                {value}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={handleFinish}
                                    className="mt-8 w-full flex items-center justify-center gap-2 bg-purple-600 text-white text-sm font-semibold py-2.5 rounded hover:bg-purple-700 transition-colors"
                                >
                                    Accéder au tableau de bord <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
}
