export interface CreateBetInput {
    quotasAmount: number;
    betAmountInCents: number;
    guess: string;
    eventId: number;
    ownerId: number;
}

export interface StoredBet {
    ownerId: number;
    betAmountInCents: number;
    guess: string;
}

export interface BetRepository {
    create(input: CreateBetInput): Promise<void>;
    findByEventId(eventId: number): Promise<StoredBet[]>;
}
