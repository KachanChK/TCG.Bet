import { ConnectionHandler } from '../database/connection';
import { login } from '../services/login';
import { User } from '../models/Account'; 
import express from 'express';

const router = express.Router();

router.post('/login', async (req, res) => {
    const user: User = req.body;

    try {
        let result = await ConnectionHandler.connectAndExecute(connection => login(connection, user))
        if (result.success) {
            res.status(201).json({
                message: `Logado com sucesso.`, token: result.token
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