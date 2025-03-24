import { ConnectionHandler } from '../database/connection';
import { auth } from '../microServices/tokenAuth';
import { EvaluateInfo } from "../models/EvaluateInfo";
import OracleDB from "oracledb";
import { sendMail } from "../microServices/mailService";
import fs from "fs";
import path from "path";


export const evaluateEvent = async (connection: OracleDB.Connection, evaluateInfo: EvaluateInfo, token: string): Promise<{ success: boolean; error?: string; }> => {
    try {
        let authResult = await ConnectionHandler.connectAndExecute(connection => auth(connection, token))
        if (!authResult.success) {
            return { success: false, error: authResult.error }
        }
        const userId = authResult.userId;
        const isMod = authResult.isMod;
        if (!isMod) {
            return { success: false, error: "Área restrita para moderadores." }
        }
        const event_id = evaluateInfo.event_id
        const avaliation = evaluateInfo.avaliation
        const motive: any = evaluateInfo.motive
        if (!event_id || !avaliation) {
            return { success: false, error: "Campos faltando." }
        }
        if (avaliation == 'Reprovado' && !motive) {
            return { success: false, error: "Insira o motivo da reprovação do evento." };
        }

        const formatDate = (date: Date): string => {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        };

        const actualDate = formatDate(new Date())
        console.log(actualDate)

        if (avaliation == 'Aprovado') {
            await connection.execute(
                `UPDATE events SET event_status = 'Aprovado', event_bet_starts = TO_DATE(:actualDate, 'DD/MM/YYYY') WHERE id = :event_id`,
                [actualDate, event_id]
            )
        }

        if (avaliation == 'Reprovado') {
            const getOwner: any = await connection.execute(
                `SELECT owner_id, title FROM events WHERE id = :event_id`,
                [event_id],
                { outFormat: OracleDB.OUT_FORMAT_OBJECT }
            )
            const ownerId = getOwner.rows[0]['OWNER_ID']
            const eventTitle = getOwner.rows[0]['TITLE']
            console.log('ID DONO DO EVENTO:', ownerId)

            const getOwnerEmail: any = await connection.execute(
                `SELECT email FROM accounts WHERE id = :ownerId`,
                [ownerId],
                { outFormat: OracleDB.OUT_FORMAT_OBJECT }
            )

            const ownerEmail = getOwnerEmail.rows[0]['EMAIL']
            console.log('EMAIL DONO DO EVENTO:', ownerEmail)

            await connection.execute(
                `UPDATE events SET event_status = 'Reprovado' WHERE id = :event_id`,
                [event_id]
            )
            const templatePath = path.join(__dirname, '../../public/mailMessage.html');
            let mailTemplate = fs.readFileSync(templatePath, 'utf-8');

            mailTemplate = mailTemplate
                .replace('{{eventTitle}}', eventTitle)
                .replace('{{motive}}', motive);
                
            // enviar email para o dono do evento
            const from: string = 'pedrohkachan';
            const to: string = ownerEmail;
            const subject: string = `Evento reprovado: ${eventTitle}`;


            sendMail(from, to, subject, mailTemplate);
        }


        connection.commit()
        return { success: true }
    } catch (error: unknown) {
        console.error("Erro ao criar evento: ", error);
        return { success: false, error: "Erro desconhecido ao criar evento." };
    }
};