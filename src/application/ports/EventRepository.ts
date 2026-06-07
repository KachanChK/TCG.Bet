export interface StoredEvent {
    id: number;
    title: string;
    status: string;
    result: string | null;
    ownerId: number;
}

export interface EventRepository {
    findById(eventId: number): Promise<StoredEvent | null>;
    setResult(eventId: number, result: string): Promise<void>;
}
