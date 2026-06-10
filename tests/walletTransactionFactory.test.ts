import test from "node:test";
import assert from "node:assert/strict";
import { toCents } from "../src/domain/wallet/Money";
import { WalletTransactionFactory } from "../src/domain/wallet/WalletTransaction";

test("toCents converts monetary values with cent precision", () => {
    assert.equal(toCents(10.25), 1025);
    assert.equal(toCents(0.01), 1);
});

test("WalletTransactionFactory creates typed wallet history entries", () => {
    assert.deepEqual(WalletTransactionFactory.deposit(7, 2500), {
        walletId: 7,
        amountInCents: 2500,
        type: "Deposito"
    });

    assert.deepEqual(WalletTransactionFactory.bet(7, 500), {
        walletId: 7,
        amountInCents: 500,
        type: "Aposta"
    });
});

test("WalletTransactionFactory rejects invalid transactions", () => {
    assert.throws(() => WalletTransactionFactory.withdraw(0, 100));
    assert.throws(() => WalletTransactionFactory.win(1, 0));
    assert.throws(() => toCents(-1));
});
