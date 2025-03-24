import OracleDB from "oracledb";
import { endEvent } from "../microServices/endEvents"
import { ConnectionHandler } from '../database/connection';

export const getEvents = async (connection: OracleDB.Connection): Promise<{ success: boolean; data?: any[]; error?: string; }> => {
    try {
        const getEvents: any = await connection.execute(
            `SELECT * FROM events WHERE event_status = 'Aprovado' ORDER BY id`,
            [],
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );
        const events = getEvents.rows
        let result = await ConnectionHandler.connectAndExecute(connection => endEvent(connection, events))
        return { success: true, data: result.data }
    } catch (error: unknown) {
        console.error("Erro ao pegar eventos: ", error);
        return { success: false, error: "Erro desconhecido ao pegar eventos." };
    }
};