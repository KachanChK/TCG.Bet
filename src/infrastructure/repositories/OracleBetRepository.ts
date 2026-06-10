import OracleDB from "oracledb";
import { BetRepository, CreateBetInput, StoredBet } from "../../application/ports/BetRepository";

export class OracleBetRepository implements BetRepository {
    constructor(private readonly connection: OracleDB.Connection) {}

    async create(input: CreateBetInput): Promise<void> {
        await this.connection.execute(
            `INSERT INTO bets (quotas_amount, bet_amount, guess, event_id, owner_id)
             VALUES (:quotaAmount, :betAmount, :guess, :eventId, :ownerId)`,
            [input.quotasAmount, input.betAmountInCents, input.guess, input.eventId, input.ownerId]
        );
    }

    async findByEventId(eventId: number): Promise<StoredBet[]> {
        const result: any = await this.connection.execute(
            `SELECT owner_id, bet_amount, guess FROM bets WHERE event_id = :eventId`,
            [eventId],
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );

        return result.rows.map((row: any) => ({
            ownerId: row.OWNER_ID,
            betAmountInCents: row.BET_AMOUNT,
            guess: row.GUESS
        }));
    }
}
