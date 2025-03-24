import { ConnectionHandler } from '../database/connection';
import { createUser } from '../services/signUp'; 
import { login } from '../services/login';
import { User } from '../models/Account'; 
import express from 'express';

const router = express.Router();

router.post('/signUp', async (req, res) => {
    const user: User = req.body;

    try {
        let result = await ConnectionHandler.connectAndExecute(connection => createUser(connection, user))
        if (result.success) {
            res.status(201).json({ message: 'Cadastro concluído.' });
        } else {
            res.status(400).json({ error: result.error })
            console.log(result.error)
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