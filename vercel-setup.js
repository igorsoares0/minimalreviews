// @ts-check
// Este script configura o ambiente Vercel sem depender do Prisma CLI

import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando configuração do ambiente Vercel...');
  
  // Verifica se o diretório prisma existe
  const prismaDir = path.join(__dirname, 'prisma');
  if (!fs.existsSync(prismaDir)) {
    console.log(`Criando diretório ${prismaDir}...`);
    fs.mkdirSync(prismaDir, { recursive: true });
  }
  
  // Verifica se o banco de dados existe
  const dbPath = path.join(prismaDir, 'data.db');
  if (!fs.existsSync(dbPath)) {
    console.log(`Banco de dados não encontrado em ${dbPath}, será criado automaticamente.`);
  }
  
  // Tenta executar uma operação no banco de dados para verificar a conexão
  try {
    console.log('Verificando conexão com o banco de dados...');
    await prisma.$connect();
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
    
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
    
    console.log('Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('Erro ao configurar o banco de dados:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(error => {
  console.error('Erro fatal durante a configuração:', error);
  process.exit(1);
}); 