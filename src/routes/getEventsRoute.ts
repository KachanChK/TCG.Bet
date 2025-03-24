import { ConnectionHandler } from '../database/connection';
import { getEvents } from '../services/getEvents';
import express from 'express';

const router = express.Router();

router.get('/getEvents', async (req, res) => {
    try {
        let result = await ConnectionHandler.connectAndExecute(connection => getEvents(connection))
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