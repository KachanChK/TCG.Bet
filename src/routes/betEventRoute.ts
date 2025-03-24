import { ConnectionHandler } from '../database/connection';
import { betEvent } from '../services/betEvent';
import { Bet } from '../models/Bets'
import express from 'express';

const router = express.Router();

router.post('/bet', async (req, res) => {
    const bet: Bet = req.body;
    const { authorization } = req.headers
    const token = authorization?.split(' ')[1]
    if(!token) {
        res.status(400).json({ error: 'Token não fornecido' })
        return;
    }

    try {
        let result = await ConnectionHandler.connectAndExecute(connection => betEvent(connection, bet, token))
        if (result.success) {
            res.status(201).json({
                message: `Aposta realizada com sucesso.`
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