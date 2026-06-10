import { AuthPort } from "../ports/AuthPort";
import { WalletRepository } from "../ports/WalletRepository";
import { UseCaseResult, fail, ok } from "../shared/UseCaseResult";
import { toCents } from "../../domain/wallet/Money";
import { WalletTransactionFactory } from "../../domain/wallet/WalletTransaction";

export type WalletMovementType = "deposit" | "withdraw";

export interface MoveWalletFundsRequest {
    token: string;
    amount: number;
    type: WalletMovementType;
}

export class MoveWalletFundsUseCase {
    constructor(
        private readonly auth: AuthPort,
        private readonly wallets: WalletRepository
    ) {}

    async execute(request: MoveWalletFundsRequest): Promise<UseCaseResult> {
        const authResult = await this.auth.authenticate(request.token);
        if (!authResult.success) {
            return fail(authResult.error);
        }

        const user = authResult.data;
        if (!user) {
            return fail("Token invalido.");
        }

        if (user.isModerator) {
            return fail("Moderadores nao movimentam carteira.");
        }

        let amountInCents: number;
        try {
            amountInCents = toCents(request.amount);
        } catch (error) {
            return fail(error instanceof Error ? error.message : "Valor invalido.");
        }

        const wallet = await this.wallets.findByOwnerId(user.userId);
        if (!wallet) {
            return fail("Carteira nao encontrada.");
        }

        if (request.type === "withdraw" && amountInCents > wallet.balanceInCents) {
            return fail("Saldo insuficiente.");
        }

        const newBalance =
            request.type === "deposit"
                ? wallet.balanceInCents + amountInCents
                : wallet.balanceInCents - amountInCents;

        await this.wallets.setBalance(wallet.ownerId, newBalance);

        const transaction =
            request.type === "deposit"
                ? WalletTransactionFactory.deposit(wallet.id, amountInCents)
                : WalletTransactionFactory.withdraw(wallet.id, amountInCents);

        await this.wallets.addHistory(transaction);
        return ok();
    }
}
