import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAccessActive } from "@/lib/beta";
import { ensureTrialSubscription } from "@/lib/subscription";

export type AuthSession = NonNullable<
    Awaited<ReturnType<typeof auth.api.getSession>>
>;
export type AuthUser = AuthSession["user"];

/**
 * Wrapper HOF pour les route handlers authentifiés.
 *
 * Le proxy global garantit déjà le rejet 401 en amont.
 * Ce wrapper résout la session et fournit l'objet `user` typé
 * au handler, sans aucun boilerplate dans la route elle-même.
 *
 * @example
 * ```ts
 * export const GET = withAuth(async (request, { user }) => {
 *     return NextResponse.json({ userId: user.id });
 * });
 * ```
 */
export function withAuth<TParams = Record<string, string>>(
    handler: (
        request: NextRequest,
        auth: { session: AuthSession; user: AuthUser },
        params: TParams
    ) => Promise<NextResponse>
) {
    return async (
        request: NextRequest,
        context?: { params: Promise<TParams> }
    ) => {
        // Le proxy a déjà vérifié la session — on la récupère ici pour le typage
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        // Défense en profondeur (ne devrait jamais arriver si le proxy est actif)
        if (!session?.user) {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 401 }
            );
        }

        const resolvedParams = context?.params
            ? await context.params
            : ({} as TParams);

        return handler(
            request,
            { session: session as AuthSession, user: session.user as AuthUser },
            resolvedParams
        );
    };
}

/**
 * Même contrat que `withAuth`, avec en plus la vérification
 * que l'abonnement de l'utilisateur est actif (essai ou payé).
 * Hors beta, un essai expiré reçoit un 402.
 */
export function withActiveSubscription<TParams = Record<string, string>>(
    handler: (
        request: NextRequest,
        auth: { session: AuthSession; user: AuthUser },
        params: TParams
    ) => Promise<NextResponse>
) {
    return withAuth<TParams>(async (request, { session, user }, params) => {
        const subscription = await ensureTrialSubscription(
            user.id,
            new Date(user.createdAt)
        );
        if (!isAccessActive(subscription.currentPeriodEnd)) {
            return NextResponse.json(
                { error: "Essai expiré : un abonnement actif est requis." },
                { status: 402 }
            );
        }
        return handler(request, { session, user }, params);
    });
}
