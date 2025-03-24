import { ConnectionHandler } from '../database/connection';
import { Event } from "../models/Event";
import OracleDB from "oracledb";
import { auth } from '../microServices/tokenAuth';

export const deleteEvent = async (connection: OracleDB.Connection, event: Event, token: string): Promise<{ success: boolean; error?: string; }> => {
    try {
        let authResult = await ConnectionHandler.connectAndExecute(connection => auth(connection, token))
        if (!authResult.success) {
            return { success: false, error: authResult.error }
        }
        const userId = authResult.userId;
        const isMod = authResult.isMod;
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