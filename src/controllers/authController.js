import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/dbConfig.js'; // Assurez-vous d'importer correctement Prisma

// Inscription d'un utilisateur
export const register = async (req, res) => {
  const { login, password, clientId, photo } = req.body;

  try {
    // Vérifier si le login existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { login },
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Ce login est déjà utilisé. Veuillez en choisir un autre.',
      });
    }

    // Vérifier si le client existe pour lier au compte utilisateur
    const existingClient = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!existingClient) {
      return res.status(400).json({
        status: 'error',
        message: 'Client non trouvé. Veuillez fournir un client valide.',
      });
    }

    // Validation du mot de passe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        status: 'error',
        message: 'Le mot de passe doit contenir au minimum 5 caractères, incluant des lettres majuscules, minuscules, chiffres, et caractères spéciaux.',
      });
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création de l'utilisateur
    const user = await prisma.user.create({
      data: {
        login,
        password: hashedPassword,
        photo,
        client: {
          connect: { id: clientId },
        },
        role: {
          connectOrCreate: {
            where: { nomRole: 'BOUTIQUIER' },
            create: { nomRole: 'BOUTIQUIER' },
          },
        },
      },
    });

    res.status(201).json({
      status: 'success',
      data: user,
      message: 'Utilisateur créé avec succès.',
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription :', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur serveur. Veuillez réessayer.',
    });
  }
};

// Connexion d'un utilisateur
export const login = async (req, res) => {
  const { login, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { login },
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Utilisateur non trouvé.',
      });
    }

    // Comparer le mot de passe fourni avec le mot de passe haché
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: 'error',
        message: 'Mot de passe incorrect.',
      });
    }

    // Génération du token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role?.nomRole },
      process.env.SECRET_KEY,
      { expiresIn: '1h' } // Le token expire après 1 heure
    );

    res.status(200).json({
      status: 'success',
      data: { token },
      message: 'Authentification réussie.',
    });
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur serveur. Veuillez réessayer.',
    });
  }
};

// Middleware pour protéger les routes nécessitant un utilisateur authentifié
export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Récupérer le token à partir des en-têtes

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Accès refusé. Token manquant.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY); // Vérifier le token
    req.user = decoded; // Attacher les informations décodées à la requête
    next(); // Passer à la prochaine fonction de middleware ou à la route
  } catch (error) {
    console.error('Erreur de vérification du token :', error);
    res.status(403).json({
      status: 'error',
      message: 'Token invalide ou expiré.',
    });
  }
};
