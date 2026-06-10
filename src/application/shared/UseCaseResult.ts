export type UseCaseResult<T = void> =
    | { success: true; data?: T }
    | { success: false; error: string };

export function ok<T = void>(data?: T): UseCaseResult<T> {
    return data === undefined ? { success: true } : { success: true, data };
}

export function fail<T = void>(error: string): UseCaseResult<T> {
    return { success: false, error };
}
