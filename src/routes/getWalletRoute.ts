import { ConnectionHandler } from '../database/connection';
import { getWallet } from '../services/getWallet';
import express from 'express';

const router = express.Router();

router.get('/getWallet', async (req, res) => {
    const { authorization } = req.headers
    const token = authorization?.split(' ')[1]
    if(!token) {
        res.status(400).json({ error: 'Token não fornecido' })
        return;
    }

    try {
        let result = await ConnectionHandler.connectAndExecute(connection => getWallet(connection, token))
        if (result.success) {
            res.status(201).json({ wallet: result.wallet, walletHistory: result.walletHistory});
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