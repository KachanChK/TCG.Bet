import { ConnectionHandler } from '../database/connection';
import { Wallet } from '../models/Wallet';
import { auth } from '../microServices/tokenAuth';
import OracleDB from "oracledb";

export const withdrawFunds = async (connection: OracleDB.Connection, wallet: Wallet, token: string): Promise<{ success: boolean; error?: string; }> => {
    try {
        let authResult = await ConnectionHandler.connectAndExecute(connection => auth(connection, token))
        if (!authResult.success) {
            return { success: false, error: authResult.error }
        }
        const userId = authResult.userId;
        const isMod = authResult.isMod;
        if (isMod) {
            return { success: false, error: "Não é possível sacar fundos como Moderador" }
        }

        const amount = wallet.balance

        if (!amount) {
            return { success: false, error: "Campos faltando." };
        }

        const amountCents = amount * 100

        const getBalance: any = await connection.execute(
            `SELECT balance, id FROM wallets WHERE owner_id = :userId`,
            [userId],
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        )
        const walletId = getBalance.rows[0]['ID']
        const actualBalance = getBalance.rows[0]['BALANCE'] 
        if (amountCents > actualBalance) {
            return { success: false, error: 'Saldo insuficiente'}
        }
        const newBalance = actualBalance - amountCents
        console.log("Novo saldo", newBalance)
        await connection.execute(
            `UPDATE wallets SET balance = :newBalance WHERE owner_id = :userId`,
            [newBalance, userId]
        );
        await connection.execute(
            `INSERT INTO wallet_history (transaction_type, amount, wallet_id) VALUES ('Saque', :amountCents, :walletId)`,
            [amountCents, walletId]
        )
        connection.commit()
        return { success: true }
    } catch (error: unknown) {
        console.error("Erro ao sacar fundos: ", error);
        return { success: false, error: "Erro desconhecido ao sacar fundos" };
    }
};