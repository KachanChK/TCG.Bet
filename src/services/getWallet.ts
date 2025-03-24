import { ConnectionHandler } from "../database/connection";
import { auth } from "../microServices/tokenAuth"
import OracleDB from "oracledb";

export const getWallet = async (connection: OracleDB.Connection, token: string): Promise<{ success: boolean; wallet?: any[]; walletHistory?: any[]; error?: string; }> => {
    try {
        let authResult = await ConnectionHandler.connectAndExecute(connection => auth(connection, token))
        if (!authResult.success) {
            return { success: false, error: authResult.error }
        }
        const userId = authResult.userId;
        const wallet: any = await connection.execute(
            `SELECT * FROM wallets WHERE owner_id = :userId`,
            [userId], 
            { outFormat: OracleDB.OUT_FORMAT_OBJECT } 
        );
        const walletId = wallet.rows[0]['ID']
        const walletHistory: any = await connection.execute(
            `SELECT * FROM wallet_history WHERE wallet_id = :walletId ORDER BY id DESC`,
            [walletId], 
            { outFormat: OracleDB.OUT_FORMAT_OBJECT } 
        );

        return { success: true, wallet: wallet.rows, walletHistory: walletHistory.rows }
    } catch (error: unknown) {
        console.error("Erro ao pegar wallet: ", error);
        return { success: false, error: "Erro desconhecido ao pegar wallet." };
    }
};