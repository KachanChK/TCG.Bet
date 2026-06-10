export function toCents(amount: number): number {
    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("O valor deve ser maior que zero.");
    }

    return Math.round(amount * 100);
}

export function assertPositiveCents(amountInCents: number): void {
    if (!Number.isInteger(amountInCents) || amountInCents <= 0) {
        throw new Error("O valor em centavos deve ser maior que zero.");
    }
}
