// src/testConnection.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Vérifier la connexion en exécutant une simple requête
    await prisma.$queryRaw`SELECT 1`; // Utilise une requête simple pour vérifier la connexion
    console.log('Vous êtes bien connecté à la base de données via Prisma et Neon!');
  } catch (error) {
    console.error('La connexion à la base de données a échoué:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
