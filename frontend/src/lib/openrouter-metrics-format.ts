export const METRICS_PREVIEW = 5;

const usdFmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
});

export function formatUsd(n: number): string {
    if (!Number.isFinite(n) || n === 0) {
        return usdFmt.format(0);
    }
    if (n < 0.01 && n > 0) {
        return usdFmt.format(n);
    }
    return usdFmt.format(n);
}

export function formatTokens(n: number): string {
    if (!Number.isFinite(n)) return "0";
    return new Intl.NumberFormat("en-US").format(Math.round(n));
}

export function formatLastUsed(raw: unknown): string {
    if (raw == null) return "—";
    const d =
        raw instanceof Date
            ? raw
            : typeof raw === "string" || typeof raw === "number"
              ? new Date(raw)
              : null;
    if (!d || Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}
