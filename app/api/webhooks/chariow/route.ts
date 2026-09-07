import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    activateChariowLicense,
    verifyPulseSignature,
    type ChariowPulsePayload,
} from "@/lib/chariow";

export async function POST(request: NextRequest) {
    const rawBody = await request.text();
    const signature = request.headers.get("x-chariow-signature");
    if (!verifyPulseSignature(rawBody, signature)) {
        return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
    }

    // Les test pulses du dashboard n'ont pas de x-pulse-delivery-id :
    // on retombe sur x-pulse-id pour conserver l'idempotence.
    const deliveryId =
        request.headers.get("x-pulse-delivery-id") ??
        request.headers.get("x-pulse-id");
    if (!deliveryId) {
        return NextResponse.json({ error: "delivery_id manquant" }, { status: 400 });
    }

    // Idempotence : ne jamais traiter deux fois la même livraison
    const alreadyProcessed = await prisma.chariowWebhookEvent.findUnique({
        where: { deliveryId },
    });
    if (alreadyProcessed) {
        return NextResponse.json({ ok: true });
    }

    const payload = JSON.parse(rawBody) as ChariowPulsePayload;
    await prisma.chariowWebhookEvent.create({
        data: { deliveryId, event: payload.event ?? "unknown" },
    });

    const entityId = payload.custom_metadata?.entity_id;
    const licenseKey = payload.license?.key;

    switch (payload.event) {
        case "license_issued": {
            if (!entityId || !licenseKey) break;

            await prisma.chariowLicense.upsert({
                where: { entityId },
                update: { licenseKey },
                create: { entityId, licenseKey },
            });

            try {
                await activateChariowLicense(licenseKey);
            } catch (error) {
                // Ne pas renvoyer d'erreur à Chariow pour éviter des retries
                // inutiles : l'événement license_activated arrivera de toute façon.
                console.error("Activation automatique Chariow échouée :", error);
            }
            break;
        }

        case "license_activated": {
            if (!entityId || !licenseKey) break;

            const expiresAt = payload.license?.expires_at
                ? new Date(payload.license.expires_at)
                : null;

            await prisma.$transaction(async (tx) => {
                await tx.chariowLicense.upsert({
                    where: { entityId },
                    update: { activatedAt: new Date(), expiresAt },
                    create: { entityId, licenseKey, activatedAt: new Date(), expiresAt },
                });

                const planName = payload.custom_metadata?.plan_id ?? "PRO";
                const plan = await tx.plan.findUnique({ where: { name: planName } });
                if (!plan) return;

                const periodEnd = expiresAt ?? new Date();
                const subscription = await tx.subscription.upsert({
                    where: { userId: entityId },
                    update: {
                        planId: plan.id,
                        source: "CHARIOW",
                        currentPeriodStart: new Date(),
                        currentPeriodEnd: periodEnd,
                        externalReference: payload.license?.id ?? licenseKey,
                    },
                    create: {
                        userId: entityId,
                        planId: plan.id,
                        source: "CHARIOW",
                        currentPeriodEnd: periodEnd,
                        externalReference: payload.license?.id ?? licenseKey,
                    },
                });

                await tx.payment.create({
                    data: {
                        subscriptionId: subscription.id,
                        amount: plan.priceCdf,
                        method: "MOBILE_MONEY",
                        status: "COMPLETED",
                        reference: payload.license?.id ?? licenseKey,
                        paidAt: new Date(),
                    },
                });
            });
            break;
        }

        case "license_expired":
        case "license_revoked": {
            if (!entityId) break;
            await prisma.chariowLicense.updateMany({
                where: { entityId },
                data:
                    payload.event === "license_revoked"
                        ? { revokedAt: new Date() }
                        : { expiresAt: new Date() },
            });
            break;
        }

        default:
            break;
    }

    return NextResponse.json({ ok: true });
}
