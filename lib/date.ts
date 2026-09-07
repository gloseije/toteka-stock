export type FormatDateInput = Date | string | number;

function toDate(value: FormatDateInput): Date {
    return value instanceof Date ? value : new Date(value);
}

/** Date seule : jour, mois (court ou long), année. */
export function formatDate(value: FormatDateInput, options?: { full?: boolean }): string {
    return toDate(value).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: options?.full ? "long" : "short",
        year: "numeric",
    });
}

/** Date courte avec heure : jour, mois court, heure. */
export function formatDateTime(value: FormatDateInput): string {
    return toDate(value).toLocaleString("fr-FR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

/** Date complète avec heure : jour de la semaine, date longue, heure. */
export function formatDateTimeLong(value: FormatDateInput): string {
    return toDate(value).toLocaleString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}
