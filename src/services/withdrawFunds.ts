import { MoveWalletFundsUseCase } from "../application/useCases/MoveWalletFundsUseCase";
import { JwtOracleAuthAdapter } from "../infrastructure/auth/JwtOracleAuthAdapter";
import { OracleWalletRepository } from "../infrastructure/repositories/OracleWalletRepository";
import { Wallet } from "../models/Wallet";
import OracleDB from "oracledb";

export const withdrawFunds = async (
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
            type: "withdraw"
        });

        if (result.success) {
            await connection.commit();
        }

        return result;
    } catch (error: unknown) {
        console.error("Erro ao sacar fundos: ", error);
        return { success: false, error: "Erro desconhecido ao sacar fundos." };
    }
};
