// @ts-check
// Este arquivo é executado durante o build no Vercel

import { PrismaClient } from '@prisma/client';
import process from 'node:process';

const prisma = new PrismaClient();

async function main() {
  // Verifica se já existem tabelas no banco de dados
  try {
    // Tenta criar uma sessão padrão para garantir que a tabela existe
    await prisma.session.upsert({
      where: {
        id: 'default-session'
      },
      update: {},
      create: {
        id: 'default-session',
        shop: 'default-shop',
        state: 'default-state',
        isOnline: false,
        accessToken: 'default-token'
      }
    });

    console.log('Banco de dados inicializado com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 