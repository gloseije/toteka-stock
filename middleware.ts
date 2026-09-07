import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { isAccessActive } from "@/lib/beta";
import { ensureTrialSubscription } from "@/lib/subscription";

// Routes API qui ne nécessitent PAS d'authentification
const publicApiRoutes = [
    "/api/auth",
    "/api/shop/public",
    "/api/products/public",
    "/api/images",
    "/api/webhooks",
];

function isPublicApiRoute(pathname: string): boolean {
    return publicApiRoutes.some((route) => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isAuthPage =
        pathname.startsWith("/login") || pathname.startsWith("/register");
    const isDashboardPage = pathname.startsWith("/dashboard");
    const isOnboardingPage = pathname.startsWith("/onboarding");
    const isProtectedPage = isDashboardPage || isOnboardingPage;

    // ─── Routes pages protégées (dashboard, onboarding) ────────────────
    if (isProtectedPage || isAuthPage) {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        const isLoggedIn = !!session?.user;

        if (isProtectedPage && !isLoggedIn) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        if (isAuthPage && isLoggedIn) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }

        if (isLoggedIn && isProtectedPage) {
            const { prisma } = await import("@/lib/prisma");

            const shop = await prisma.shop.findUnique({
                where: { userId: session.user.id },
                select: { id: true },
            });

            if (!shop && isDashboardPage) {
                return NextResponse.redirect(new URL("/onboarding", request.url));
            }

            if (shop && isOnboardingPage) {
                return NextResponse.redirect(new URL("/dashboard", request.url));
            }

            const isSubscriptionPage = pathname.startsWith("/dashboard/subscription");
            if (shop && isDashboardPage && !isSubscriptionPage) {
                const subscription = await ensureTrialSubscription(
                    session.user.id,
                    new Date(session.user.createdAt)
                );
                if (!isAccessActive(subscription.currentPeriodEnd)) {
                    return NextResponse.redirect(
                        new URL("/dashboard/subscription?expired=true", request.url)
                    );
                }
            }
        }
    }

    // ─── Routes API protégées ───────────────────────────────────────
    if (pathname.startsWith("/api") && !isPublicApiRoute(pathname)) {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user) {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 401 }
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/onboarding/:path*",
        "/login",
        "/register",
        "/api/:path*",
    ],
    runtime: "nodejs",
};
