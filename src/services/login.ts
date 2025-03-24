import { User } from "../models/Account";
import OracleDB from "oracledb";
import jwt from "jsonwebtoken"

export const login = async (connection: OracleDB.Connection, user: User): Promise<{ success: boolean; error?: string; token?: string }> => {
    try {
        if (!user.email || !user.password) {
            return { success: false, error: "Campos faltando." };
        }

        const loginQuery: any = await connection.execute(
            `SELECT COUNT(*), id, username, email FROM accounts WHERE email = :email AND password = :password GROUP BY id, username, email`,
            [user.email, user.password]
        )
        const count = loginQuery.rows[0]['COUNT(*)'];
        const id = loginQuery.rows[0]['ID']
        if (count < 1) {
            return { success: false, error: "Usuário não encontrado. "}
        }

        const token = jwt.sign({ userId: id }, process.env.JWT_PASS ?? '', { expiresIn: '8h' })
        console.log('Token gerado: ', token)

        return { success: true, token: token }
    } catch (error: unknown) {
        console.error("Erro... : ", error);
        return { success: false, error: "Dados de login inválidos, tente novamente." };
    }
};