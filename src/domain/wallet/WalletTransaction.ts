import { assertPositiveCents } from "./Money";

export type WalletTransactionType = "Deposito" | "Saque" | "Aposta" | "Ganho";

export interface WalletTransaction {
    walletId: number;
    amountInCents: number;
    type: WalletTransactionType;
}

export class WalletTransactionFactory {
    static deposit(walletId: number, amountInCents: number): WalletTransaction {
        return this.create(walletId, amountInCents, "Deposito");
    }

    static withdraw(walletId: number, amountInCents: number): WalletTransaction {
        return this.create(walletId, amountInCents, "Saque");
    }

    static bet(walletId: number, amountInCents: number): WalletTransaction {
        return this.create(walletId, amountInCents, "Aposta");
    }

    static win(walletId: number, amountInCents: number): WalletTransaction {
        return this.create(walletId, amountInCents, "Ganho");
    }

    private static create(
        walletId: number,
        amountInCents: number,
        type: WalletTransactionType
    ): WalletTransaction {
        if (!Number.isInteger(walletId) || walletId <= 0) {
            throw new Error("Carteira invalida.");
        }

        assertPositiveCents(amountInCents);
        return { walletId, amountInCents, type };
    }
}
