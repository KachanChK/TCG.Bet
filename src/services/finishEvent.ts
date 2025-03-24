import { ConnectionHandler } from '../database/connection';
import { Event } from "../models/Event";
import OracleDB from "oracledb";
import { auth } from '../microServices/tokenAuth';

export const finishEvent = async (connection: OracleDB.Connection, event: Event, token: string): Promise<{ success: boolean; error?: string; }> => {
    try {
        let authResult = await ConnectionHandler.connectAndExecute(connection => auth(connection, token))
        if (!authResult.success) {
            return { success: false, error: authResult.error }
        }
        const userId = authResult.userId;
        const isMod = authResult.isMod;
        if (!isMod) {
            return { success: false, error: "Não é possível finalizar evento como Usuário." }
        }

        const eventId = event.id
        const result = event.result
        if (!eventId || !result) {
            return { success: false, error: "Campos faltando." };
        }
        console.log('ID DO EVENTO A SER FINALIZADO:', eventId)
        let getEvent: any = await connection.execute(
            `SELECT COUNT(*), event_status, result FROM events WHERE id = :eventId GROUP BY event_status, result`,
            [eventId]
        )
        const eventExists = getEvent.rows[0]['COUNT(*)']
        if (eventExists < 1) {
            return { success: false, error: "Este evento não encontrado, verifique se o evento existe." }
        }
        const eventStatus = getEvent.rows[0]['EVENT_STATUS']
        const eventResult = getEvent.rows[0]['RESULT']
        if (eventStatus != 'Encerrado') {
            return { success: false, error: 'Este evento ainda não foi encerrado ou não pode ser finalizado.' }
        }
        if (eventResult != null) {
            return { success: false, error: 'Este evento já foi finalizado.' }
        }

        await connection.execute(
            `UPDATE events SET result = :result WHERE id = :eventId`,
            [result, eventId]
        )

        const getBets: any = await connection.execute(
            `SELECT COUNT(*) AS total_bets,
            SUM(CASE WHEN guess = 'Sim' THEN 1 ELSE 0 END) AS total_sim,
            SUM(CASE WHEN guess = 'Não' THEN 1 ELSE 0 END) AS total_nao,
            SUM(quotas_amount) AS total_quotas
            FROM bets
            WHERE event_id = :eventId
            GROUP BY event_id`,
            [eventId],
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        )

        if (getBets.rows.length === 0) {
            return { success: false, error: "Nenhuma aposta encontrada para este evento." };
        }

        const total_bets = getBets.rows[0]['TOTAL_BETS']
        const total_sim = getBets.rows[0]['TOTAL_SIM']
        const total_nao = getBets.rows[0]['TOTAL_NAO']
        const total_quotas = getBets.rows[0]['TOTAL_QUOTAS']

        const multiplierSim = total_sim > 0 ? total_bets / total_sim : 0
        const multiplierNao = total_nao > 0 ? total_bets / total_nao : 0

        const bets: any = await connection.execute(
            `SELECT owner_id, bet_amount, guess FROM bets WHERE event_id = :eventId`,
            [eventId],
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        )

        const multiplier = result == 'Sim' ? multiplierSim : multiplierNao;
        console.log('MULTIPLICADOR:', multiplier)

        console.log(bets.rows.length)
        for (let i = 0; i < bets.rows.length; i++) {
            const bet = bets.rows[i]
            console.log(bet)
            if (bet['GUESS'] == result) {
                const ownerId = bet['OWNER_ID']
                const win = (bet['BET_AMOUNT'] * multiplier).toFixed(2)
                const walletResult: any = await connection.execute(
                    `SELECT id FROM wallets WHERE owner_id = :ownerId`,
                    [ownerId],
                    { outFormat: OracleDB.OUT_FORMAT_OBJECT }
                )
                const walletId = walletResult.rows[0]['ID']
                console.log('WALLET ID:', walletId)
                await connection.execute(
                    `UPDATE wallets SET balance = balance + :win WHERE owner_id = :ownerId`,
                    [win, ownerId]
                )
                console.log('ADICIONOU SALDO')
                await connection.execute(
                    `INSERT INTO wallet_history (transaction_type, amount, wallet_id) VALUES ('Ganho', :win, :walletId)`,
                    [win, walletId]
                )
                console.log('ADICIONOU HISTORY')
            }
        }
        connection.commit()
        return { success: true }
    } catch (error: unknown) {
        console.error("Erro ao finalizar: ", error);
        return { success: false, error: "Erro desconhecido ao finalizar evento." };
    }
};