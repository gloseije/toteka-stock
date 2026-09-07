import crypto from "node:crypto";

const CHARIOW_API_BASE = "https://api.chariow.com/v1";

/**
 * En développement, réécrit les emails de fixtures (`paul@gmail.com`, …)
 * vers un alias Gmail `glweb75+{local}@gmail.com` afin que les emails
 * envoyés par l'API Chariow réelle arrivent dans une seule boîte de test.
 * En production, l'email du client est transmis tel quel.
 */
export function resolveCheckoutEmail(fakeEmail: string): string {
    if (process.env.NODE_ENV === "production") {
        return fakeEmail;
    }
    const [localPart] = fakeEmail.split("@");
    return `glweb75+${localPart}@gmail.com`;
}

export interface ChariowCheckoutInput {
    email: string;
    entityId: string;
    redirectUrl: string;
    firstName?: string;
    lastName?: string;
    phone?: { number: string; countryCode?: string };
    productId?: string;
    planId?: string;
}

export type ChariowCheckoutResult =
    | { step: "payment"; checkoutUrl: string }
    | { step: "already_purchased" }
    | { step: "completed" };

export async function createChariowCheckout(
    input: ChariowCheckoutInput
): Promise<ChariowCheckoutResult> {
    const apiKey = process.env.CHARIOW_API_KEY;
    const productId = input.productId ?? process.env.CHARIOW_PRODUCT_ID;
    if (!apiKey || !productId) {
        throw new Error(
            "Configuration Chariow manquante (CHARIOW_API_KEY / CHARIOW_PRODUCT_ID)"
        );
    }

    const response = await fetch(`${CHARIOW_API_BASE}/checkout`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            product_id: productId,
            email: resolveCheckoutEmail(input.email),
            first_name: input.firstName,
            last_name: input.lastName,
            phone: input.phone
                ? {
                      number: input.phone.number,
                      country_code: input.phone.countryCode ?? "CD",
                  }
                : undefined,
            custom_metadata: {
                entity_id: input.entityId,
                ...(input.planId ? { plan_id: input.planId } : {}),
            },
            redirect_url: input.redirectUrl,
        }),
    });

    const json = (await response.json()) as {
        data?: { step?: string; payment?: { checkout_url?: string } };
        message?: string;
    };

    if (!response.ok) {
        throw new Error(json.message ?? `Checkout Chariow échoué (${response.status})`);
    }

    if (json.data?.step === "payment" && json.data.payment?.checkout_url) {
        return { step: "payment", checkoutUrl: json.data.payment.checkout_url };
    }
    if (json.data?.step === "already_purchased") {
        return { step: "already_purchased" };
    }
    return { step: "completed" };
}

// ─── Webhooks (Pulses) ────────────────────────────────────────────────────────

/**
 * Vérifie la signature HMAC-SHA256 d'un Pulse Chariow.
 * La signature est attendue dans l'en-tête `x-chariow-signature`
 * et calculée sur le corps brut de la requête.
 */
export function verifyPulseSignature(rawBody: string, signature: string | null): boolean {
    const secret = process.env.CHARIOW_WEBHOOK_SECRET;
    if (!secret || !signature) return false;
    // Format réel : "sha256=<64 hex>" — le préfixe identifie l'algorithme
    if (!signature.startsWith("sha256=")) return false;
    const received = signature.slice("sha256=".length);
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const sigBuffer = Buffer.from(received);
    const expectedBuffer = Buffer.from(expected);
    return (
        sigBuffer.length === expectedBuffer.length &&
        crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    );
}

/**
 * Active une licence côté serveur dès réception de `license_issued`,
 * afin que le client n'ait jamais à copier-coller de clé.
 * `device_identifier` est arbitraire : aucun suivi d'appareil n'est fait,
 * Chariow exige simplement une valeur non vide.
 */
export async function activateChariowLicense(
    licenseKey: string
): Promise<{ expiresAt: string | null; alreadyActive: boolean }> {
    const apiKey = process.env.CHARIOW_API_KEY;
    if (!apiKey) {
        throw new Error("Configuration Chariow manquante (CHARIOW_API_KEY)");
    }

    const response = await fetch(`${CHARIOW_API_BASE}/licenses/${licenseKey}/activate`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            device_identifier: `server-${crypto.randomUUID()}`,
        }),
    });

    if (!response.ok) {
        const error = (await response.json().catch(() => ({}))) as { message?: string };
        // Licence déjà active (ou activation non requise) : idempotent, pas une erreur
        if (response.status === 400) {
            return { expiresAt: null, alreadyActive: true };
        }
        throw new Error(error.message ?? `Activation Chariow échouée (${response.status})`);
    }

    const json = (await response.json()) as {
        data?: { license?: { expires_at?: string | null } };
    };
    return { expiresAt: json.data?.license?.expires_at ?? null, alreadyActive: false };
}

export interface ChariowPulsePayload {
    event?: string;
    license?: {
        id?: string;
        key?: string;
        expires_at?: string | null;
    };
    customer?: {
        email?: string;
    };
    custom_metadata?: {
        entity_id?: string;
        plan_id?: string;
    };
}
