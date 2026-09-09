export type AnalyticsMethod = "email" | "google";

export type AnalyticsParams = Record<string, string | number | boolean | undefined>;

type GtagCommand = "config" | "event" | "consent";

declare global {
    interface Window {
        gtag: (
            command: GtagCommand,
            targetId: string,
            params?: Record<string, unknown>
        ) => void;
        dataLayer: unknown[];
    }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export function track(eventName: string, params?: AnalyticsParams): void {
    if (typeof window === "undefined") return;
    if (!GA_ID) return;
    if (typeof window.gtag !== "function") return;

    window.gtag("event", eventName, params ? { ...params } : undefined);
}

export function trackSignUp(method: AnalyticsMethod): void {
    track("sign_up", { method });
}

export function trackLogin(method: AnalyticsMethod): void {
    track("login", { method });
}

export function trackProductCreated(): void {
    track("product_created");
}

export function trackSaleCreated(currency?: string): void {
    track("sale_created", currency ? { currency } : undefined);
}

export function trackCustomerCreated(): void {
    track("customer_created");
}
