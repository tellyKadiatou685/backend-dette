import express from 'express';
import cors from 'cors';
import authRouter from './src/routes/authRoutes.js';
import clientRouter from './src/routes/clientRoute.js'; 




const app = express();


app.use(express.json());
app.use(cors());

app.use('/api/auth', authRouter);


app.use('/api/clients', clientRouter);

// Démarrer le serveur
app.listen(3000, () => {
  console.log('Serveur démarré sur http://localhost:3000');
});
