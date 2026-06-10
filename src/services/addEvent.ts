import { Event } from "../models/Event";
import { parse } from 'date-fns';
import OracleDB from "oracledb";
import { JwtOracleAuthAdapter } from '../infrastructure/auth/JwtOracleAuthAdapter';

export const addEvent = async (connection: OracleDB.Connection, event: Event, token: string): Promise<{ success: boolean; error?: string; }> => {
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
            return { success: false, error: "Não é possível criar evento como Moderador" }
        }

        if (!event.title || !event.description || !event.quota_value || !event.event_date || !event.event_bet_ends) {
            return { success: false, error: "Campos faltando." };
        }

        if (event.quota_value < 1) {
            return { success: false, error: "Valor mínimo da cota: R$1"}
        }

        const eventDate = parse(event.event_date, "dd/MM/yyyy", new Date())
        const eventBetEnds = parse(event.event_bet_ends, "dd/MM/yyyy", new Date())
        const todaysDate = new Date()
        if (eventDate <= todaysDate) {
            return { success: false, error: "O evento deve acontecer em uma data posterior a data atual."}
        }
        if (eventBetEnds <= todaysDate) {
            return { success: false, error: "As apostas devem encerrar em uma data posterior a data atual."}
        }
        if (eventBetEnds >= eventDate) {
            return { success: false, error: "As apostas não podem encerrar depois do evento acontecer."}
        }

        await connection.execute(
            `INSERT INTO events (title, event_description, quota_value, event_date, event_bet_ends, event_status, owner_id) VALUES (:title, :event_description, :quota_value, TO_DATE(:event_date, 'DD/MM/YYYY'), TO_DATE(:event_bet_ends, 'DD/MM/YYYY'), 'Pendente', :userId)`,
            [event.title, event.description, event.quota_value, event.event_date, event.event_bet_ends, userId]
        );

        connection.commit()
        return { success: true, }
    } catch (error: unknown) {
        console.error("Erro ao criar evento: ", error);
        return { success: false, error: "Erro desconhecido ao criar evento" };
    }
};
