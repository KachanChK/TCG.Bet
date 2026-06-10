import { PlaceBetUseCase } from "../application/useCases/PlaceBetUseCase";
import { JwtOracleAuthAdapter } from "../infrastructure/auth/JwtOracleAuthAdapter";
import { OracleBetRepository } from "../infrastructure/repositories/OracleBetRepository";
import { OracleEventRepository } from "../infrastructure/repositories/OracleEventRepository";
import { OracleWalletRepository } from "../infrastructure/repositories/OracleWalletRepository";
import { Bet } from "../models/Bets";
import OracleDB from "oracledb";

export const betEvent = async (
    connection: OracleDB.Connection,
    bet: Bet,
    token: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        const useCase = new PlaceBetUseCase(
            new JwtOracleAuthAdapter(connection),
            new OracleWalletRepository(connection),
            new OracleEventRepository(connection),
            new OracleBetRepository(connection)
        );

        const result = await useCase.execute({
            token,
            betAmount: bet.bet_amount,
            quotasAmount: bet.quotas_amount,
            guess: bet.guess,
            eventId: bet.event_id
        });

        if (result.success) {
            await connection.commit();
        }

        return result;
    } catch (error: unknown) {
        console.error("Erro ao apostar: ", error);
        return { success: false, error: "Erro desconhecido ao apostar." };
    }
};
