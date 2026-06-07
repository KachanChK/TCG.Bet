import { AuthPort } from "../ports/AuthPort";
import { BetRepository } from "../ports/BetRepository";
import { EventRepository } from "../ports/EventRepository";
import { WalletRepository } from "../ports/WalletRepository";
import { UseCaseResult, fail, ok } from "../shared/UseCaseResult";
import { PayoutStrategy } from "../../domain/betting/PayoutStrategy";
import { WalletTransactionFactory } from "../../domain/wallet/WalletTransaction";

export interface FinishEventRequest {
    token: string;
    eventId?: number;
    result?: string;
}

export class FinishEventUseCase {
    constructor(
        private readonly auth: AuthPort,
        private readonly events: EventRepository,
        private readonly bets: BetRepository,
        private readonly wallets: WalletRepository,
        private readonly payoutStrategy: PayoutStrategy
    ) {}

    async execute(request: FinishEventRequest): Promise<UseCaseResult> {
        const authResult = await this.auth.authenticate(request.token);
        if (!authResult.success) {
            return fail(authResult.error);
        }

        const user = authResult.data;
        if (!user) {
            return fail("Token invalido.");
        }

        if (!user.isModerator) {
            return fail("Nao e possivel finalizar evento como Usuario.");
        }

        if (!request.eventId || !request.result) {
            return fail("Campos faltando.");
        }

        const event = await this.events.findById(request.eventId);
        if (!event) {
            return fail("Evento nao encontrado.");
        }

        if (event.status !== "Encerrado") {
            return fail("Este evento ainda nao foi encerrado ou nao pode ser finalizado.");
        }

        if (event.result !== null) {
            return fail("Este evento ja foi finalizado.");
        }

        const bets = await this.bets.findByEventId(request.eventId);
        if (bets.length === 0) {
            return fail("Nenhuma aposta encontrada para este evento.");
        }

        const payouts = this.payoutStrategy.calculatePayouts(request.result, bets);
        await this.events.setResult(request.eventId, request.result);

        for (const payout of payouts) {
            const wallet = await this.wallets.findByOwnerId(payout.ownerId);
            if (!wallet) {
                return fail(`Carteira nao encontrada para o usuario ${payout.ownerId}.`);
            }

            await this.wallets.increaseBalance(payout.ownerId, payout.amountInCents);
            await this.wallets.addHistory(WalletTransactionFactory.win(wallet.id, payout.amountInCents));
        }

        return ok();
    }
}
