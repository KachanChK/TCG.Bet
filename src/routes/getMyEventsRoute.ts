import { ConnectionHandler } from '../database/connection';
import { getMyEvents } from '../services/getMyEvents';
import express from 'express';

const router = express.Router();

router.get('/getMyEvents', async (req, res) => {
    const { authorization } = req.headers
    const token = authorization?.split(' ')[1]
    if(!token) {
        res.status(400).json({ error: 'Token não fornecido' })
        return;
    }

    try {
        let result = await ConnectionHandler.connectAndExecute(connection => getMyEvents(connection, token))
        if (result.success && result.data) {
            res.status(201).json(result.data);
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