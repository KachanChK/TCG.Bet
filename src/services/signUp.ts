import { User } from "../models/Account";
import { parse } from 'date-fns';
import OracleDB from "oracledb";

export const createUser = async (connection: OracleDB.Connection, user: User): Promise<{ success: boolean; error?: string }> => {
    try {
        if (!user.username || !user.email || !user.password || !user.birthdate) {
            return { success: false, error: "Campos faltando." };
        }

        const emailQuery: any = await connection.execute(
            `SELECT COUNT(*) FROM accounts WHERE email = :email`,
            { email: user.email }
        );
        const count = emailQuery.rows[0]['COUNT(*)'];

        if (count > 0) {
            return { success: false, error: "E-mail já cadastrado." };
        }

        const birthdate = user.birthdate ? user.birthdate : null

        if(birthdate === null) {
            return { success: false, error: "Data de nascimento inválida."}
        }
        const dateOfBirth = parse(user.birthdate, "dd/MM/yyyy", new Date())
        const todaysDate = new Date()
        console.log(dateOfBirth)
        console.log(todaysDate)
        if ((todaysDate.getFullYear() - dateOfBirth.getFullYear()) < 18) {
            return { success: false, error: "Plataforma proibida para menores de 18 anos."}
        }
        

        const insertQuery = await connection.execute(
            `INSERT INTO accounts (username, email, password, birthdate, role) VALUES (:username, :email, :password, TO_DATE(:birthdate, 'DD/MM/YYYY'), 'Usuário') RETURNING id INTO :id`,
            {
                username: user.username,
                email: user.email,
                password: user.password,
                birthdate,
                id: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER }
            }
        );

        const newId = (insertQuery.outBinds as { id: number[] }).id[0]
        console.log(`Novo ID inserido: ${newId}`);
        
        await connection.execute(
            `INSERT INTO wallets (balance, owner_id) VALUES (:balance, :owner_id)`,
            { balance: 0, owner_id: newId }
        );

        console.log(`Usuário ${user.username} criado com sucesso.`);
        connection.commit();
        return { success: true }
    } catch (error: unknown) {
        console.error("Erro ao criar usuário:", error);
        return { success: false, error: "Erro desconhecido ao criar usuário." };
    }
};