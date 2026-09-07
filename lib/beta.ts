/**
 * Mode beta de l'application.
 *
 * Quand `NEXT_PUBLIC_APP_BETA=true`, la limite d'essai de 14 jours
 * n'est pas appliquée : l'accès reste ouvert sans expiration.
 * Le paiement (checkout Chariow) reste possible en beta —
 * les webhooks continuent de créer des abonnements PRO normalement.
 *
 * Exposé via NEXT_PUBLIC_* pour être lisible côté client et serveur.
 */
export const BETA_MODE = process.env.NEXT_PUBLIC_APP_BETA === "true";

export const TRIAL_DAYS = 14;

/**
 * Date de fin d'essai : toujours `startedAt + 14 jours`.
 * La date est stockée telle quelle en base ; c'est `isAccessActive`
 * qui décide de l'ignorer en mode beta.
 */
export function trialEndsAt(startedAt: Date): Date {
    return new Date(startedAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
}

/**
 * Indique si un accès est encore valide.
 * En beta, l'accès est toujours actif quelle que soit la date de fin.
 */
export function isAccessActive(currentPeriodEnd: Date | null): boolean {
    if (BETA_MODE) return true;
    if (!currentPeriodEnd) return false;
    return currentPeriodEnd.getTime() > Date.now();
}
