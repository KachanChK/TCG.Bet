import OracleDB from "oracledb";

export const endEvent = async (connection: OracleDB.Connection, events: any[]): Promise<{ success: boolean; data?: any[]; error?: string; }> => {
    try {
        const actualDate = new Date()
        const actualDateOnly = new Date(actualDate);
        actualDateOnly.setHours(0, 0, 0, 0);
        console.log('Tamanho da lista events:', events.length)
        for (let i = events.length - 1; i >= 0; i--) {
            console.log(`Evento ${i}:`, events[i])
            let eventId = events[i]['ID']
            let eventBetEnds = new Date(events[i]['EVENT_BET_ENDS'])
            let eventBetEndsOnly = new Date(eventBetEnds);
            eventBetEndsOnly.setHours(0, 0, 0, 0);
            if (eventBetEndsOnly <= actualDateOnly) {
                console.log('Encerrando evento...')
                events.splice(i, 1)
                await connection.execute(
                    `UPDATE events SET event_status = 'Encerrado' WHERE id = :eventId`,
                    [eventId]
                )
                console.log('Evento encerrado com sucesso.')
            }
        }
        await connection.commit()
        return { success: true, data: events }
    } catch (error: unknown) {
        console.error("Erro ao encerrar eventos: ", error);
        return { success: false, error: "Erro desconhecido ao encerrar eventos." };
    }
}