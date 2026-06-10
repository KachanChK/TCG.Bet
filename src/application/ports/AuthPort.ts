import { UseCaseResult } from "../shared/UseCaseResult";

export interface AuthenticatedUser {
    userId: number;
    isModerator: boolean;
}

export interface AuthPort {
    authenticate(token: string): Promise<UseCaseResult<AuthenticatedUser>>;
}
