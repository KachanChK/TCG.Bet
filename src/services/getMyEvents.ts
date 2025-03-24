import { ConnectionHandler } from '../database/connection';
import { auth } from '../microServices/tokenAuth';
import OracleDB from "oracledb";

export const getMyEvents = async (connection: OracleDB.Connection, token: string): Promise<{ success: boolean; data?: any[]; error?: string; }> => {
    try {
        let authResult = await ConnectionHandler.connectAndExecute(connection => auth(connection, token))
        if (!authResult.success) {
            return { success: false, error: authResult.error }
        }
        const userId = authResult.userId;
        const isMod = authResult.isMod;

        const result = await connection.execute(
            `SELECT * FROM events WHERE owner_id = :userId ORDER BY id DESC`,
            [userId],
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );

        return { success: true, data: result.rows }
    } catch (error: unknown) {
        console.error("Erro ao pegar eventos: ", error);
        return { success: false, error: "Erro desconhecido ao pegar eventos." };
    }
};