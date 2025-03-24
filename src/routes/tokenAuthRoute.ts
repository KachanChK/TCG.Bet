import { ConnectionHandler } from '../database/connection';
import { auth } from '../microServices/tokenAuth'
import express from 'express';

const router = express.Router();

router.post('/tokenAuth', async (req, res) => {
    const { authorization } = req.headers
    const token = authorization?.split(' ')[1]
    if (!token) {
        res.status(400).json({ error: 'Token não fornecido' })
        return;
    }

    try {
        let result = await ConnectionHandler.connectAndExecute(connection => auth(connection, token))
        if (result.success) {
            res.status(201).json({ message: `Token válido.` });
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