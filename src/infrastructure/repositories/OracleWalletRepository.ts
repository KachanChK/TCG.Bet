import OracleDB from "oracledb";
import { WalletRepository, StoredWallet } from "../../application/ports/WalletRepository";
import { WalletTransaction } from "../../domain/wallet/WalletTransaction";

export class OracleWalletRepository implements WalletRepository {
    constructor(private readonly connection: OracleDB.Connection) {}

    async findByOwnerId(ownerId: number): Promise<StoredWallet | null> {
        const result: any = await this.connection.execute(
            `SELECT id, balance, owner_id FROM wallets WHERE owner_id = :ownerId`,
            [ownerId],
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );

        if (!result.rows || result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];
        return {
            id: row.ID,
            balanceInCents: row.BALANCE,
            ownerId: row.OWNER_ID
        };
    }

    async setBalance(ownerId: number, balanceInCents: number): Promise<void> {
        await this.connection.execute(
            `UPDATE wallets SET balance = :balance WHERE owner_id = :ownerId`,
            [balanceInCents, ownerId]
        );
    }

    async increaseBalance(ownerId: number, amountInCents: number): Promise<void> {
        await this.connection.execute(
            `UPDATE wallets SET balance = balance + :amount WHERE owner_id = :ownerId`,
            [amountInCents, ownerId]
        );
    }

    async addHistory(transaction: WalletTransaction): Promise<void> {
        await this.connection.execute(
            `INSERT INTO wallet_history (transaction_type, amount, wallet_id)
             VALUES (:type, :amount, :walletId)`,
            [transaction.type, transaction.amountInCents, transaction.walletId]
        );
    }
}
