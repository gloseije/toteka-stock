import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Prisma, Shop } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { AuthSession, AuthUser } from "@/lib/auth-guard";

export type { AuthSession, AuthUser };

type ShopPayload<S extends Prisma.ShopSelect | undefined> = S extends Prisma.ShopSelect
    ? Prisma.ShopGetPayload<{ select: S }>
    : Shop;

/** Vérifie la session et redirige vers /login si absent. */
export async function requireAuthUser(): Promise<AuthUser> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
        redirect("/login");
    }
    return session.user as AuthUser;
}

/** Vérifie la session et redirige vers /login si absent. Retourne la session complète. */
export async function requireAuthSession(): Promise<AuthSession> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
        redirect("/login");
    }
    return session as AuthSession;
}

/** Vérifie l'utilisateur et sa boutique, redirige vers /onboarding si absent. */
export async function requireShop<S extends Prisma.ShopSelect | undefined = undefined>(
    select?: S
): Promise<ShopPayload<S>> {
    const user = await requireAuthUser();
    const shop = await prisma.shop.findUnique({
        where: { userId: user.id },
        ...(select ? { select } : {}),
    });
    if (!shop) {
        redirect("/onboarding");
    }
    return shop as ShopPayload<S>;
}

/** Contexte dashboard : utilisateur authentifié + boutique. */
export async function requireDashboardContext<
    S extends Prisma.ShopSelect | undefined = undefined,
>(shopSelect?: S): Promise<{ user: AuthUser; shop: ShopPayload<S> }> {
    const user = await requireAuthUser();
    const shop = await prisma.shop.findUnique({
        where: { userId: user.id },
        ...(shopSelect ? { select: shopSelect } : {}),
    });
    if (!shop) {
        redirect("/onboarding");
    }
    return { user, shop: shop as ShopPayload<S> };
}
