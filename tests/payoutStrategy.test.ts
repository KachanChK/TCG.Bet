import test from "node:test";
import assert from "node:assert/strict";
import { PoolPayoutStrategy } from "../src/domain/betting/PayoutStrategy";

test("PoolPayoutStrategy distributes the full betting pool to winners", () => {
    const strategy = new PoolPayoutStrategy();

    const payouts = strategy.calculatePayouts("Sim", [
        { ownerId: 1, betAmountInCents: 1000, guess: "Sim" },
        { ownerId: 2, betAmountInCents: 3000, guess: "Sim" },
        { ownerId: 3, betAmountInCents: 6000, guess: "Nao" }
    ]);

    assert.deepEqual(payouts, [
        { ownerId: 1, amountInCents: 2500 },
        { ownerId: 2, amountInCents: 7500 }
    ]);
});

test("PoolPayoutStrategy normalizes accents in guesses", () => {
    const strategy = new PoolPayoutStrategy();

    const payouts = strategy.calculatePayouts("Não", [
        { ownerId: 1, betAmountInCents: 1000, guess: "Nao" },
        { ownerId: 2, betAmountInCents: 1000, guess: "Sim" }
    ]);

    assert.deepEqual(payouts, [{ ownerId: 1, amountInCents: 2000 }]);
});

test("PoolPayoutStrategy returns no payouts when nobody wins", () => {
    const strategy = new PoolPayoutStrategy();

    const payouts = strategy.calculatePayouts("Sim", [
        { ownerId: 1, betAmountInCents: 1000, guess: "Nao" }
    ]);

    assert.deepEqual(payouts, []);
});
