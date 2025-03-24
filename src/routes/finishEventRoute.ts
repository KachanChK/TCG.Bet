import { ConnectionHandler } from '../database/connection';
import { finishEvent } from '../services/finishEvent';
import { Event } from '../models/Event'; 
import express from 'express';

const router = express.Router();

router.post('/finishEvent', async (req, res) => {
    const event: Event = req.body;
    const { authorization } = req.headers
    const token = authorization?.split(' ')[1]
    if(!token) {
        res.status(400).json({ error: 'Token não fornecido' })
        return;
    }

    try {
        let result = await ConnectionHandler.connectAndExecute(connection => finishEvent(connection, event, token))
        if (result.success) {
            res.status(201).json({
                message: `Evento finalizado com sucesso.`
            });
        } else {
            res.status(400).json({ error: result.error })
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Erro desconhecido.' });
        }
    }
});

export default router;