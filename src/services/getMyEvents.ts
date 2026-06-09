import OracleDB from "oracledb";
import { JwtOracleAuthAdapter } from '../infrastructure/auth/JwtOracleAuthAdapter';

export const getMyEvents = async (connection: OracleDB.Connection, token: string): Promise<{ success: boolean; data?: any[]; error?: string; }> => {
    try {
        let authResult = await new JwtOracleAuthAdapter(connection).authenticate(token)
        if (!authResult.success) {
            return { success: false, error: authResult.error }
        }
        const user = authResult.data;
        if (!user) {
            return { success: false, error: "Token invÃ¡lido." }
        }
        const userId = user.userId;

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
