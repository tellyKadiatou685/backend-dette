import bcrypt from 'bcrypt';
import prisma from '../config/dbConfig.js';

export const saveClient = async (req, res) => {
  const { surname, adresse = null, telephone, user } = req.body;

  // Validation des données obligatoires
  if (!surname || !telephone) {
    return res.status(400).json({
      status: 400,
      data: null,
      message: "Les champs 'surname' et 'telephone' sont obligatoires.",
    });
  }

  // Validation du format du téléphone sénégalais
  const senegalPhoneRegex = /^7[0-8][0-9]{7}$/;
  if (!senegalPhoneRegex.test(telephone)) {
    return res.status(400).json({
      status: 400,
      data: null,
      message: "Le numéro de téléphone doit respecter le format d'un téléphone portable sénégalais.",
    });
  }

  try {
    // Débogage : Afficher les valeurs pour vérifier si tout est correct
    console.log('Prisma:', prisma);
    console.log('Prisma Client:', prisma.client);
    console.log('Request Body:', req.body);

    // Vérification des doublons pour le téléphone et le surname
    const [existingClient, existingSurname] = await Promise.all([
      prisma.client.findUnique({ where: { telephone } }),
      prisma.client.findUnique({ where: { surname } })
    ]);

    if (existingClient) {
      return res.status(409).json({
        status: 409,
        data: null,
        message: "Le numéro de téléphone est déjà utilisé.",
      });
    }

    if (existingSurname) {
      return res.status(409).json({
        status: 409,
        data: null,
        message: "Le surname est déjà utilisé.",
      });
    }

    // Cas où un utilisateur est fourni (client avec compte)
    if (user) {
      const { login, password, nom, prenom, photo } = user;

      // Validation des champs utilisateur
      if (!login || !password || !nom || !prenom) {
        return res.status(400).json({
          status: 400,
          data: null,
          message: "Les champs 'login', 'password', 'nom', et 'prenom' sont obligatoires pour l'utilisateur.",
        });
      }

      // Validation du mot de passe
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          status: 400,
          data: null,
          message: "Le mot de passe doit contenir au minimum 5 caractères, des lettres majuscules, minuscules, des chiffres et des caractères spéciaux.",
        });
      }

      // Vérification du doublon pour le login
      const existingUser = await prisma.user.findUnique({ where: { login } });
      if (existingUser) {
        return res.status(409).json({
          status: 409,
          data: null,
          message: "Le login est déjà utilisé.",
        });
      }

      // Hashage du mot de passe utilisateur
      const hashedPassword = await bcrypt.hash(password, 10);

      // Création de l'utilisateur et du client dans une transaction
      const result = await prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            login,
            password: hashedPassword,
            nom,
            prenom,
            photo: photo || '',
            role: 'CLIENT',
          },
        });

        const newClient = await tx.client.create({
          data: {
            surname,
            adresse,
            telephone,
            userId: createdUser.id, // Lien vers l'utilisateur créé
          },
        });

        return { client: newClient, user: createdUser };
      });

      return res.status(201).json({
        status: 201,
        data: result.client,
        message: "Client et compte utilisateur enregistrés avec succès.",
      });

    } else {
      // Cas où le client n'a pas de compte (juste un client)
      const newClient = await prisma.client.create({
        data: {
          surname,
          adresse,
          telephone,
        },
      });

      return res.status(201).json({
        status: 201,
        data: newClient,
        message: "Client enregistré avec succès sans compte utilisateur.",
      });
    }

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du client:', error);
    res.status(500).json({
      status: 500,
      data: null,
      message: "Une erreur s'est produite lors de l'enregistrement du client.",
    });
  }
};
