import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

// Route pour la connexion
router.post('/login', async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  // Vérification que tous les champs sont remplis
  if (!email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
  }

  // Vérification de la validité du mot de passe
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Les mots de passe ne correspondent pas' });
  }

  // Recherche de l'utilisateur dans la base de données
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  // Comparaison du mot de passe
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(400).json({ message: 'Mot de passe incorrect' });
  }

  // Génération du token JWT
  const token = jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

  res.json({ token });
});

export default router;
