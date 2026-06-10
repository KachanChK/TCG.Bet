import { PasswordHasher } from "../domain/security/PasswordHasher";
import { User } from "../models/Account";
import OracleDB from "oracledb";
import jwt from "jsonwebtoken";

export const login = async (
    connection: OracleDB.Connection,
    user: User
): Promise<{ success: boolean; error?: string; token?: string }> => {
    try {
        if (!user.email || !user.password) {
            return { success: false, error: "Campos faltando." };
        }

        const loginQuery: any = await connection.execute(
            `SELECT id, username, email, password FROM accounts WHERE email = :email`,
            [user.email],
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );

        if (!loginQuery.rows || loginQuery.rows.length < 1) {
            return { success: false, error: "Usuario nao encontrado." };
        }

        const account = loginQuery.rows[0];
        const isValidPassword = PasswordHasher.verify(user.password, account["PASSWORD"]);
        if (!isValidPassword) {
            return { success: false, error: "Dados de login invalidos, tente novamente." };
        }

        const token = jwt.sign({ userId: account["ID"] }, process.env.JWT_PASS ?? "", { expiresIn: "8h" });
        return { success: true, token };
    } catch (error: unknown) {
        console.error("Erro ao autenticar usuario:", error);
        return { success: false, error: "Dados de login invalidos, tente novamente." };
    }
};
