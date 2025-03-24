export interface Event {
    id?: number,
    title: string,
    description?: string,
    quota_value?: number,
    event_date?: string,
    event_bet_starts?: string,
    event_bet_ends: string,
    event_status?: string,
    owner_id?: number,
    result?: string  
}