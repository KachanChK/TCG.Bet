import OracleDB from "oracledb";
import { EventRepository, StoredEvent } from "../../application/ports/EventRepository";

export class OracleEventRepository implements EventRepository {
    constructor(private readonly connection: OracleDB.Connection) {}

    async findById(eventId: number): Promise<StoredEvent | null> {
        const result: any = await this.connection.execute(
            `SELECT id, title, event_status, result, owner_id FROM events WHERE id = :eventId`,
            [eventId],
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );

        if (!result.rows || result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];
        return {
            id: row.ID,
            title: row.TITLE,
            status: row.EVENT_STATUS,
            result: row.RESULT,
            ownerId: row.OWNER_ID
        };
    }

    async setResult(eventId: number, result: string): Promise<void> {
        await this.connection.execute(
            `UPDATE events SET result = :result WHERE id = :eventId`,
            [result, eventId]
        );
    }
}
