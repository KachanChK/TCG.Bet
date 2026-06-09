import { FinishEventUseCase } from "../application/useCases/FinishEventUseCase";
import { PoolPayoutStrategy } from "../domain/betting/PayoutStrategy";
import { JwtOracleAuthAdapter } from "../infrastructure/auth/JwtOracleAuthAdapter";
import { OracleBetRepository } from "../infrastructure/repositories/OracleBetRepository";
import { OracleEventRepository } from "../infrastructure/repositories/OracleEventRepository";
import { OracleWalletRepository } from "../infrastructure/repositories/OracleWalletRepository";
import { Event } from "../models/Event";
import OracleDB from "oracledb";

export const finishEvent = async (
    connection: OracleDB.Connection,
    event: Event,
    token: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        const useCase = new FinishEventUseCase(
            new JwtOracleAuthAdapter(connection),
            new OracleEventRepository(connection),
            new OracleBetRepository(connection),
            new OracleWalletRepository(connection),
            new PoolPayoutStrategy()
        );

        const result = await useCase.execute({
            token,
            eventId: event.id,
            result: event.result
        });

        if (result.success) {
            await connection.commit();
        }

        return result;
    } catch (error: unknown) {
        console.error("Erro ao finalizar evento: ", error);
        return { success: false, error: "Erro desconhecido ao finalizar evento." };
    }
};
