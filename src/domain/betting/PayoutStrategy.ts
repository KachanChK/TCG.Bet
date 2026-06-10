export interface SettledBet {
    ownerId: number;
    betAmountInCents: number;
    guess: string;
}

export interface Payout {
    ownerId: number;
    amountInCents: number;
}

export interface PayoutStrategy {
    calculatePayouts(winningGuess: string, bets: SettledBet[]): Payout[];
}

export class PoolPayoutStrategy implements PayoutStrategy {
    calculatePayouts(winningGuess: string, bets: SettledBet[]): Payout[] {
        const totalPool = bets.reduce((sum, bet) => sum + bet.betAmountInCents, 0);
        const normalizedWinner = normalizeGuess(winningGuess);
        const winningBets = bets.filter((bet) => normalizeGuess(bet.guess) === normalizedWinner);
        const winningPool = winningBets.reduce((sum, bet) => sum + bet.betAmountInCents, 0);

        if (totalPool <= 0 || winningPool <= 0) {
            return [];
        }

        return winningBets.map((bet) => ({
            ownerId: bet.ownerId,
            amountInCents: Math.round((bet.betAmountInCents / winningPool) * totalPool)
        }));
    }
}

function normalizeGuess(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");
}
