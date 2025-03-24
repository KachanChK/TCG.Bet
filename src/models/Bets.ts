export interface Bet {
    id?: number,
    quotas_amount: number,
    bet_amount: number,
    guess?: string,
    event_id?: number,
    owner_id?: number
}