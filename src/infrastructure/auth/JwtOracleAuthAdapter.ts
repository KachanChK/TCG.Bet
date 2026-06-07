import OracleDB from "oracledb";
import { AuthPort } from "../../application/ports/AuthPort";
import { UseCaseResult, fail, ok } from "../../application/shared/UseCaseResult";
import { auth } from "../../microServices/tokenAuth";

export class JwtOracleAuthAdapter implements AuthPort {
    constructor(private readonly connection: OracleDB.Connection) {}

    async authenticate(token: string): Promise<UseCaseResult<{ userId: number; isModerator: boolean }>> {
        const result = await auth(this.connection, token);

        if (!result.success || !result.userId) {
            return fail(result.error ?? "Token invalido.");
        }

        return ok({
            userId: result.userId,
            isModerator: Boolean(result.isMod)
        });
    }
}
