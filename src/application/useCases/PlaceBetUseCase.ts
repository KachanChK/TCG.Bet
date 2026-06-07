import { AuthPort } from "../ports/AuthPort";
import { BetRepository } from "../ports/BetRepository";
import { EventRepository } from "../ports/EventRepository";
import { WalletRepository } from "../ports/WalletRepository";
import { UseCaseResult, fail, ok } from "../shared/UseCaseResult";
import { toCents } from "../../domain/wallet/Money";
import { WalletTransactionFactory } from "../../domain/wallet/WalletTransaction";

export interface PlaceBetRequest {
    token: string;
    betAmount: number;
    quotasAmount: number;
    guess?: string;
    eventId?: number;
}

export class PlaceBetUseCase {
    constructor(
        private readonly auth: AuthPort,
        private readonly wallets: WalletRepository,
        private readonly events: EventRepository,
        private readonly bets: BetRepository
    ) {}

    async execute(request: PlaceBetRequest): Promise<UseCaseResult> {
        const authResult = await this.auth.authenticate(request.token);
        if (!authResult.success) {
            return fail(authResult.error);
        }

        const user = authResult.data;
        if (!user) {
            return fail("Token invalido.");
        }

        if (user.isModerator) {
            return fail("Nao e possivel apostar como Moderador.");
        }

        if (!request.eventId || !request.guess || !request.quotasAmount || !request.betAmount) {
            return fail("Campos faltando.");
        }

        if (request.quotasAmount <= 0) {
            return fail("Quantidade de cotas invalida.");
        }

        const event = await this.events.findById(request.eventId);
        if (!event) {
            return fail("Evento nao encontrado.");
        }

        if (event.status !== "Aprovado") {
            return fail("Evento nao esta aberto para apostas.");
        }

        let betAmountInCents: number;
        try {
            betAmountInCents = toCents(request.betAmount);
        } catch (error) {
            return fail(error instanceof Error ? error.message : "Valor invalido.");
        }

        const wallet = await this.wallets.findByOwnerId(user.userId);
        if (!wallet) {
            return fail("Carteira nao encontrada.");
        }

        if (wallet.balanceInCents < betAmountInCents) {
            return fail("Saldo insuficiente.");
        }

        await this.wallets.setBalance(user.userId, wallet.balanceInCents - betAmountInCents);
        await this.bets.create({
            quotasAmount: request.quotasAmount,
            betAmountInCents,
            guess: request.guess,
            eventId: request.eventId,
            ownerId: user.userId
        });
        await this.wallets.addHistory(WalletTransactionFactory.bet(wallet.id, betAmountInCents));

        return ok();
    }
}
