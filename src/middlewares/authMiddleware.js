import jwt from 'jsonwebtoken';
const SECRET_KEY = process.env.SECRET_KEY;

export const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Récupère le token du header

  if (!token) {
    return res.status(403).json({ message: 'Accès interdit' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Accès interdit' });
    }
    req.user = user; // Ajoute les informations de l'utilisateur dans la requête
    next();
  });
};
