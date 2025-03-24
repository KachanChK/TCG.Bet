import { ConnectionHandler } from '../database/connection';
import { addFunds } from '../services/addFunds';
import { Wallet } from '../models/Wallet'; 
import express from 'express';

const router = express.Router();

router.post('/addFunds', async (req, res) => {
    const wallet: Wallet = req.body;
    const { authorization } = req.headers
    const token = authorization?.split(' ')[1]
    if(!token) {
        res.status(400).json({ error: 'Token não fornecido' })
        return;
    }

    try {
        let result = await ConnectionHandler.connectAndExecute(connection => addFunds(connection, wallet, token))
        if (result.success) {
            res.status(201).json({
                message: `Fundos adicionados com sucesso.`
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