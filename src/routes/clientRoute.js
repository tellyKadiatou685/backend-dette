import express from 'express';
import { saveClient } from '../controllers/ClientController.js';

const router = express.Router();
router.post('/', saveClient);

export default router;