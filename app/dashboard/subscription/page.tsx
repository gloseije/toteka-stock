"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CreditCard, Check, Calendar, Receipt, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/date";
import { Skeleton, SkeletonCard, SkeletonTable } from "@/components/skeleton";
import { BETA_MODE } from "@/lib/beta";

// ─── Types ────────────────────────────────────────────────────────────────────

type PlanId = "TRIAL" | "PRO";
type SubscriptionStatus = "ACTIVE" | "PAST_DUE" | "CANCELLED" | "EXPIRED";
type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

interface PlanOption {
    id: PlanId;
    name: string;
    priceFC: number;
    period: string;
    features: string[];
}

interface PaymentRecord {
    id: string;
    amount: number;
    currency: "CDF" | "USD";
    method: string;
    status: PaymentStatus;
    paidAt: string | null;
    createdAt: string;
}

interface CurrentSubscription {
    planId: PlanId;
    planName: string;
    status: SubscriptionStatus;
    currentPeriodEnd: string;
    paymentMethod: string | null;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const plans: PlanOption[] = [
    {
        id: "TRIAL",
        name: "Essai gratuit",
        priceFC: 0,
        period: "14 jours",
        features: [
            "Produits et ventes illimités",
            "Historique complet",
            "Factures et reçus PDF",
            "Alertes stock et statistiques",
        ],
    },
    {
        id: "PRO",
        name: "Abonnement",
        priceFC: 10000,
        period: "/ mois",
        features: [
            "Produits et ventes illimités",
            "Historique complet",
            "Factures et reçus PDF",
            "Alertes stock et statistiques avancées",
            "Multi-utilisateurs et export en option",
        ],
    },
];

const statusLabel: Record<SubscriptionStatus, string> = {
    ACTIVE: "Actif",
    PAST_DUE: "En retard",
    CANCELLED: "Annulé",
    EXPIRED: "Expiré",
};

const statusStyles: Record<SubscriptionStatus, string> = {
    ACTIVE: "bg-green-50 text-green-700 border-green-100",
    PAST_DUE: "bg-red-50 text-red-700 border-red-100",
    CANCELLED: "bg-gray-50 text-gray-600 border-gray-100",
    EXPIRED: "bg-gray-50 text-gray-600 border-gray-100",
};

const paymentStatusLabel: Record<PaymentStatus, string> = {
    PENDING: "En attente",
    COMPLETED: "Payé",
    FAILED: "Échoué",
    REFUNDED: "Remboursé",
};

const paymentStatusStyles: Record<PaymentStatus, string> = {
    PENDING: "bg-yellow-50 text-yellow-700 border-yellow-100",
    COMPLETED: "bg-green-50 text-green-700 border-green-100",
    FAILED: "bg-red-50 text-red-700 border-red-100",
    REFUNDED: "bg-gray-50 text-gray-600 border-gray-100",
};

function formatAmount(amount: number, currency: "CDF" | "USD") {
    if (currency === "USD") {
        return `${amount.toLocaleString("fr-FR")}\u00A0$`;
    }
    return `${amount.toLocaleString("fr-FR")}\u00A0Fc`;
}

// ─── Inner page (needs Suspense for useSearchParams) ──────────────────────────

function SubscriptionContent() {
    const searchParams = useSearchParams();
    const preselectedPlan = searchParams.get("plan")?.toUpperCase() as PlanId | undefined;
    const trialExpired = searchParams.get("expired") === "true";

    const [loading, setLoading] = useState(false);

    // TODO: charger depuis l'API
    const [subscription] = useState<CurrentSubscription>(() => ({
        planId: "TRIAL",
        planName: "Essai gratuit",
        status: "ACTIVE",
        currentPeriodEnd: "2026-09-21T23:59:59.000Z",
        paymentMethod: null,
    }));
    const [payments] = useState<PaymentRecord[]>([]);

    const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(
        preselectedPlan === "PRO" ? preselectedPlan : null
    );
    const [changing, setChanging] = useState(preselectedPlan === "PRO");

    const formatPrice = (plan: PlanOption) =>
        `${plan.priceFC.toLocaleString("fr-FR")}\u00A0Fc`;

    const handleChangePlan = async () => {
        if (!selectedPlan || selectedPlan === subscription.planId) return;
        setLoading(true);
        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId: selectedPlan }),
            });
            const data = (await res.json()) as {
                checkoutUrl?: string;
                alreadyPurchased?: boolean;
                error?: string;
            };
            if (!res.ok) {
                alert(data.error ?? "Impossible d'initier le paiement");
                return;
            }
            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl;
                return;
            }
            setChanging(false);
            setSelectedPlan(null);
        } catch (error) {
            console.error("Checkout error:", error);
            alert("Erreur lors de l'initiation du paiement");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-8 max-w-7xl w-full">
            {/* Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Abonnement</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Consultez votre plan actuel et gérez vos paiements.
                </p>
            </div>

            {trialExpired && (
                <div className="bg-purple-50 border border-purple-200 rounded px-4 py-3">
                    <p className="text-sm font-semibold text-purple-900">
                        Votre essai gratuit est terminé
                    </p>
                    <p className="text-xs text-purple-700 mt-0.5">
                        Choisissez l&apos;abonnement pour continuer à utiliser Toteka Stock. Le
                        paiement se fait par Mobile Money.
                    </p>
                </div>
            )}

            {/* Current subscription */}
            <div className="bg-white border border-gray-200 rounded p-6 flex flex-col gap-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-purple-50 text-purple-600 rounded shrink-0">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Plan actuel
                            </p>
                            <p className="text-lg font-bold text-gray-900 mt-0.5">
                                {subscription.planName}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                                <span
                                    className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded border ${statusStyles[subscription.status]}`}
                                >
                                    {statusLabel[subscription.status]}
                                </span>
                                {subscription.paymentMethod && (
                                    <span className="text-xs text-gray-400">
                                        via {subscription.paymentMethod}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Calendar className="w-3.5 h-3.5" />
                            {subscription.planId === "TRIAL" && BETA_MODE
                                ? "Période beta"
                                : subscription.planId === "TRIAL"
                                  ? "Fin de l'essai"
                                  : "Renouvellement"}
                        </div>
                        <p className="text-sm font-semibold text-gray-900 mt-0.5">
                            {subscription.planId === "TRIAL" && BETA_MODE
                                ? "Sans limite"
                                : formatDate(subscription.currentPeriodEnd, { full: true })}
                        </p>
                    </div>
                </div>

                {subscription.planId === "TRIAL" && !changing && !BETA_MODE && (
                    <button
                        onClick={() => setChanging(true)}
                        className="self-start text-sm font-semibold bg-purple-600 text-white px-5 py-2.5 rounded hover:bg-purple-700 transition-colors"
                    >
                        S&apos;abonner
                    </button>
                )}

                {subscription.planId === "TRIAL" && BETA_MODE && (
                    <div className="flex items-center gap-3 bg-purple-50 border border-purple-100 rounded p-4 self-start">
                        <AlertCircle className="w-4 h-4 text-purple-600 shrink-0" />
                        <p className="text-xs text-purple-800">
                            Pendant la beta, l&apos;accès est illimité : aucun paiement n&apos;est
                            requis ni accepté pour le moment.
                        </p>
                    </div>
                )}
            </div>

            {/* Plan selection */}
            {changing && (
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-gray-900">Choisir un plan</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {plans.map((plan) => {
                            const isCurrent = plan.id === subscription.planId;
                            const isSelected = selectedPlan === plan.id;

                            return (
                                <button
                                    key={plan.id}
                                    type="button"
                                    onClick={() => !isCurrent && setSelectedPlan(plan.id)}
                                    disabled={isCurrent}
                                    className={[
                                        "bg-white border rounded p-6 flex flex-col gap-5 text-left transition-colors",
                                        isCurrent
                                            ? "border-gray-200 opacity-60 cursor-not-allowed"
                                            : isSelected
                                              ? "border-purple-600 ring-1 ring-purple-600"
                                              : "border-gray-200 hover:border-purple-200",
                                    ].join(" ")}
                                >
                                    <div>
                                        <p
                                            className={`text-xs font-semibold uppercase tracking-wider ${plan.id === "PRO" ? "text-purple-600" : "text-gray-400"}`}
                                        >
                                            {plan.name}
                                            {isCurrent && (
                                                <span className="ml-2 normal-case tracking-normal text-gray-400">
                                                    (actuel)
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">
                                            {formatPrice(plan)}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">{plan.period}</p>
                                    </div>
                                    <hr className="border-gray-100" />
                                    <ul className="flex flex-col gap-2.5 flex-1">
                                        {plan.features.map((item) => (
                                            <li
                                                key={item}
                                                className="flex gap-2 items-start text-sm text-gray-600"
                                            >
                                                <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-3 bg-purple-50 border border-purple-100 rounded p-4">
                        <AlertCircle className="w-4 h-4 text-purple-600 shrink-0" />
                        <p className="text-xs text-purple-800">
                            {BETA_MODE
                                ? "Pendant la beta, les paiements sont désactivés."
                                : "À la fin de votre essai de 14 jours, un abonnement actif est nécessaire pour continuer à utiliser Toteka Stock. Le paiement se fait par Mobile Money (Airtel Money, Orange Money, M-Pesa)."}
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setChanging(false);
                                setSelectedPlan(null);
                            }}
                            className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-2"
                        >
                            Annuler
                        </button>
                        <button
                            type="button"
                            onClick={handleChangePlan}
                            disabled={
                                BETA_MODE ||
                                !selectedPlan ||
                                selectedPlan === subscription.planId ||
                                loading
                            }
                            className="text-sm font-semibold bg-purple-600 text-white px-5 py-2.5 rounded hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {loading ? "Traitement..." : BETA_MODE ? "Indisponible en beta" : "Confirmer le changement"}
                        </button>
                    </div>
                </div>
            )}

            {/* Payment history */}
            <div className="flex flex-col gap-4">
                <h2 className="text-sm font-bold text-gray-900">Historique des paiements</h2>

                {payments.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded flex flex-col items-center justify-center py-16 gap-3">
                        <Receipt className="w-9 h-9 text-gray-200" />
                        <p className="text-sm font-medium text-gray-500">Aucun paiement</p>
                        <p className="text-xs text-gray-400">
                            Vos transactions apparaîtront ici après votre premier abonnement payant.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 rounded overflow-x-auto">
                        <table className="w-full min-w-170 text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Montant
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Méthode
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Statut
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="whitespace-nowrap">
                                        <td className="px-4 py-3 text-gray-700">
                                            {formatDate(payment.paidAt ?? payment.createdAt, { full: true })}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {formatAmount(payment.amount, payment.currency)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {payment.method}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded border ${paymentStatusStyles[payment.status]}`}
                                            >
                                                {paymentStatusLabel[payment.status]}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SubscriptionPage() {
    return (
        <Suspense
            fallback={
                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full flex flex-col gap-8">
                    <div className="space-y-1">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <SkeletonCard />
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                    <SkeletonTable rows={4} columns={4} />
                </div>
            }
        >
            <SubscriptionContent />
        </Suspense>
    );
}
