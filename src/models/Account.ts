export interface User {
    id?: number;
    username?: string;
    email: string;
    password: string;
    birthdate?: string; // Pode ser `Date` se você converter antes de salvar no banco
    role?: number;
}
