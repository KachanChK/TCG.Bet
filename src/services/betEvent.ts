import { ConnectionHandler } from '../database/connection';
import { auth } from '../microServices/tokenAuth';
import { Bet } from '../models/Bets';
import OracleDB, { autoCommit } from "oracledb";

export const betEvent = async (connection: OracleDB.Connection, bet: Bet, token: string): Promise<{ success: boolean; error?: string; }> => {
    try {
        let authResult = await ConnectionHandler.connectAndExecute(connection => auth(connection, token))
        if (!authResult.success) {
            return { success: false, error: authResult.error }
        }
        const userId = authResult.userId;
        const isMod = authResult.isMod;
        if (isMod) {
            return { success: false, error: "Não é possível apostar como Moderador" }
        }
        const betAmount = bet.bet_amount
        const quotaAmount = bet.quotas_amount
        const guess = bet.guess
        const eventId = bet.event_id
        if (!betAmount || !quotaAmount || !guess) {
            return { success: false, error: "Campos faltando." };
        }

        const getWallet: any = await connection.execute(
            `SELECT balance, id FROM wallets WHERE owner_id = :userId`,
            [userId],
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        )

        const walletId = getWallet.rows[0]['ID']
        const actualBalance = getWallet.rows[0]['BALANCE']
        const betCents = betAmount * 100
        console.log('SALDO ATUAL: ', actualBalance)
        console.log('WALLET ID: ', walletId)

        if (actualBalance < betCents) {
            return { success: false, error: 'Saldo insuficiente.' }
        }

        const newBalance = actualBalance - betCents

        await connection.execute(
            `UPDATE wallets SET balance = :newBalance WHERE owner_id = :userId`,
            [newBalance, userId]
        )

        await connection.execute(
            `INSERT INTO bets (quotas_amount, bet_amount, guess, event_id, owner_id) VALUES (:quotaAmount, :betCents, :guess, :eventId, :userId)`,
            [quotaAmount, betCents, guess, eventId, userId]
        )

        await connection.execute(
            `INSERT INTO wallet_history (transaction_type, amount, wallet_id) VALUES ('Aposta', :betCents, :walletId)`,
            [betCents, walletId]
        )
        
        connection.commit()
        return { success: true }
    } catch (error: unknown) {
        console.error("Erro ao depositar fundos: ", error);
        return { success: false, error: "Erro desconhecido ao depositar fundos" };
    }
};