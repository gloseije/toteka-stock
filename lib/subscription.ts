import { prisma } from "./prisma";
import { trialEndsAt } from "./beta";

/**
 * Retourne l'abonnement de l'utilisateur, en créant un abonnement
 * d'essai (plan TRIAL, 14 jours depuis l'inscription) si absent.
 * Le plan TRIAL est créé à la volée si la table `plan` est vide.
 */
export async function ensureTrialSubscription(userId: string, userCreatedAt: Date) {
    const existing = await prisma.subscription.findUnique({ where: { userId } });
    if (existing) return existing;

    const trialPlan = await prisma.plan.upsert({
        where: { name: "TRIAL" },
        update: {},
        create: {
            name: "TRIAL",
            displayName: "Essai gratuit",
            priceUsd: 0,
            priceCdf: 0,
        },
    });

    return prisma.subscription.create({
        data: {
            userId,
            planId: trialPlan.id,
            source: "MANUAL",
            currentPeriodStart: userCreatedAt,
            currentPeriodEnd: trialEndsAt(userCreatedAt),
        },
    });
}
