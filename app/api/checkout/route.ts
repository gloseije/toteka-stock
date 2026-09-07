import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-guard";
import { createChariowCheckout } from "@/lib/chariow";
import { BETA_MODE } from "@/lib/beta";

interface CheckoutBody {
    planId?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    countryCode?: string;
}

export const POST = withAuth(async (request: NextRequest, { user }) => {
    // En mode beta, le paiement n'est pas encore ouvert
    if (BETA_MODE) {
        return NextResponse.json(
            { error: "Le paiement n'est pas disponible pendant la beta." },
            { status: 403 }
        );
    }

    let body: CheckoutBody = {};
    try {
        body = (await request.json()) as CheckoutBody;
    } catch {
        // Corps optionnel
    }

    try {
        const result = await createChariowCheckout({
            email: user.email,
            entityId: user.id,
            planId: body.planId,
            firstName: body.firstName,
            lastName: body.lastName,
            phone: body.phoneNumber
                ? {
                      number: body.phoneNumber.replace(/\D/g, ""),
                      countryCode: body.countryCode,
                  }
                : undefined,
            redirectUrl: `${process.env.BETTER_AUTH_URL}/dashboard/subscription`,
        });

        if (result.step === "payment") {
            return NextResponse.json({ checkoutUrl: result.checkoutUrl });
        }
        if (result.step === "already_purchased") {
            return NextResponse.json({ alreadyPurchased: true });
        }
        return NextResponse.json({ completed: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Erreur inconnue";
        console.error("POST /api/checkout error:", error);
        return NextResponse.json({ error: message }, { status: 400 });
    }
});
