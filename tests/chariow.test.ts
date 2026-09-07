import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { resolveCheckoutEmail, verifyPulseSignature } from "../lib/chariow";

const env = process.env as Record<string, string | undefined>;
const originalNodeEnv = env.NODE_ENV;

describe("resolveCheckoutEmail", () => {
    afterEach(() => {
        env.NODE_ENV = originalNodeEnv;
    });

    it("retourne l'email inchangé en production", () => {
        env.NODE_ENV = "production";
        assert.equal(resolveCheckoutEmail("paul@gmail.com"), "paul@gmail.com");
        assert.equal(
            resolveCheckoutEmail("julie@toteka.cd"),
            "julie@toteka.cd"
        );
    });

    it("convertit l'email en alias Gmail en développement", () => {
        env.NODE_ENV = "development";
        assert.equal(
            resolveCheckoutEmail("paul@gmail.com"),
            "glweb75+paul@gmail.com"
        );
        assert.equal(
            resolveCheckoutEmail("julie@toteka.cd"),
            "glweb75+julie@gmail.com"
        );
    });

    it("convertit aussi l'email en alias en dehors de la production (test)", () => {
        env.NODE_ENV = "test";
        assert.equal(
            resolveCheckoutEmail("marie@example.com"),
            "glweb75+marie@gmail.com"
        );
    });
});

describe("verifyPulseSignature", () => {
    const originalSecret = env.CHARIOW_WEBHOOK_SECRET;

    afterEach(() => {
        env.CHARIOW_WEBHOOK_SECRET = originalSecret;
    });

    it("accepte une signature valide", () => {
        env.CHARIOW_WEBHOOK_SECRET = "secret_test";
        const body = JSON.stringify({ event: "license_issued" });
        const signature =
            "sha256=" +
            crypto.createHmac("sha256", "secret_test").update(body).digest("hex");
        assert.equal(verifyPulseSignature(body, signature), true);
    });

    it("rejette une signature invalide ou sans préfixe sha256=", () => {
        env.CHARIOW_WEBHOOK_SECRET = "secret_test";
        const body = JSON.stringify({ event: "license_issued" });
        const hex = crypto.createHmac("sha256", "secret_test").update(body).digest("hex");
        assert.equal(verifyPulseSignature(body, "signature_invalide"), false);
        // Un digest correct sans le préfixe "sha256=" est rejeté
        assert.equal(verifyPulseSignature(body, hex), false);
        // Un digest correct d'un autre secret est rejeté
        const wrong =
            "sha256=" + crypto.createHmac("sha256", "autre_secret").update(body).digest("hex");
        assert.equal(verifyPulseSignature(body, wrong), false);
    });

    it("rejette quand le secret ou la signature manque", () => {
        env.CHARIOW_WEBHOOK_SECRET = undefined;
        assert.equal(verifyPulseSignature("{}", "abc"), false);
        env.CHARIOW_WEBHOOK_SECRET = "secret_test";
        assert.equal(verifyPulseSignature("{}", null), false);
    });
});
