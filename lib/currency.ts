import type { Currency } from "@prisma/client";

export type { Currency };

export const DEFAULT_EXCHANGE_RATE = 22500;

export function convertToShopCurrency(
    amount: number,
    sourceCurrency: Currency,
    shopCurrency: Currency,
    exchangeRate: number
): number {
    if (sourceCurrency === shopCurrency) return roundCurrency(amount, shopCurrency);
    const converted =
        sourceCurrency === "USD"
            ? (amount * exchangeRate) / 10
            : (amount * 10) / exchangeRate;
    return roundCurrency(converted, shopCurrency);
}

export function roundCurrency(amount: number, currency: Currency): number {
    const factor = currency === "USD" ? 100 : 1;
    return Math.round((amount + Number.EPSILON) * factor) / factor;
}

export function currencyLabel(currency: Currency): string {
    return currency === "USD" ? "$" : "Fc";
}

export function formatCurrency(amount: number, currency: Currency): string {
    return `${amount.toLocaleString("fr-FR", {
        minimumFractionDigits: currency === "USD" ? 2 : 0,
        maximumFractionDigits: currency === "USD" ? 2 : 0,
    })} ${currencyLabel(currency)}`;
}