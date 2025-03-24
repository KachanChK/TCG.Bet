import OracleDB from "oracledb";
import dotenv from 'dotenv';
dotenv.config()

export namespace ConnectionHandler {
    export async function connectAndExecute(callback: (connection: OracleDB.Connection) => Promise<any>): Promise<any> {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;
        let connection;

        try {
            connection = await OracleDB.getConnection({
                user: process.env.USER,
                password: process.env.PASSWORD,
                connectString: process.env.CONN_STR
            });
            console.log('Conectado com sucesso.')

            return await callback(connection);

        } catch (error) {
            console.error('Erro na operação:', error);
        } finally {
            if (connection) {
                try {
                    await connection.close();
                    console.log('Conexão fechada com sucesso')
                } catch (closeError) {
                    console.error('Erro ao fechar conexão:', closeError);
                }
            }
        }
    }
}