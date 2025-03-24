import OracleDB from "oracledb";
import jwt from "jsonwebtoken";

type JwtPayLoad = {
    userId: number
}

export const auth = async (connection: OracleDB.Connection, token: string) : Promise<{ success: boolean; userId?: number; isMod?: boolean; error?: string; }> => {
    try {
        const { userId } = jwt.verify(token, process.env.JWT_PASS ?? '') as JwtPayLoad
        console.log("ID recebido no token: ", userId)

        let isModerator: boolean = false

        const getUser: any = await connection.execute(
            `SELECT COUNT(*), role FROM accounts WHERE id = :userId GROUP BY role`, [userId]
        )
        if (getUser.rows[0]['COUNT(*)'] < 1) {
            return { success: false, error: 'Token Inválido. Faça login novamente.'}
        }
        const role = getUser.rows[0]['ROLE']
        if (role === 'Moderador') {
            isModerator = true
        }

        return { success: true, userId: userId, isMod: isModerator }
    } catch (error: unknown) {
        console.error("Erro ao verificar token: ", error);
        return { success: false, error: "Erro desconhecido ao verificar token." };
    }
}