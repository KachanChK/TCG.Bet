import { Event } from "../models/Event";
import OracleDB from "oracledb";
import { JwtOracleAuthAdapter } from '../infrastructure/auth/JwtOracleAuthAdapter';

export const deleteEvent = async (connection: OracleDB.Connection, event: Event, token: string): Promise<{ success: boolean; error?: string; }> => {
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
        const isMod = user.isModerator;
        if (isMod) {
            return { success: false, error: "Não é possível deletar evento como Moderador." }
        }

        const eventId = event.id
        if (!eventId) {
            return { success: false, error: "Campos faltando." };
        }
        console.log('ID DO EVENTO A SER CANCELADO:', eventId)
        let getEvent: any = await connection.execute(
            `SELECT COUNT(*) FROM events WHERE owner_id = :userId AND id = :eventId`,
            [userId, eventId]
        )
        const eventExists = getEvent.rows[0]['COUNT(*)']
        if (eventExists < 1) {
            return { success: false, error: "Evento não encontrado, verifique se o evento existe."}
        }

        await connection.execute(
            `UPDATE events SET event_status = 'Cancelado' WHERE id = :eventId`,
            [eventId]
        )

        connection.commit()
        return { success: true }
    } catch (error: unknown) {
        console.error("Erro ao criar evento: ", error);
        return { success: false, error: "Erro desconhecido ao criar evento." };
    }
};
