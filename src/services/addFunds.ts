import { MoveWalletFundsUseCase } from "../application/useCases/MoveWalletFundsUseCase";
import { JwtOracleAuthAdapter } from "../infrastructure/auth/JwtOracleAuthAdapter";
import { OracleWalletRepository } from "../infrastructure/repositories/OracleWalletRepository";
import { Wallet } from "../models/Wallet";
import OracleDB from "oracledb";

export const addFunds = async (
    connection: OracleDB.Connection,
    wallet: Wallet,
    token: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        const useCase = new MoveWalletFundsUseCase(
            new JwtOracleAuthAdapter(connection),
            new OracleWalletRepository(connection)
        );

        const result = await useCase.execute({
            token,
            amount: wallet.balance,
            type: "deposit"
        });

        if (result.success) {
            await connection.commit();
        }

        return result;
    } catch (error: unknown) {
        console.error("Erro ao depositar fundos: ", error);
        return { success: false, error: "Erro desconhecido ao depositar fundos." };
    }
};
