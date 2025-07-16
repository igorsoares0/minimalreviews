import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

declare global {
  var __db__: PrismaClient;
}

if (process.env.NODE_ENV === 'production') {
  // Para produção, criar nova instância com logging
  prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
} else {
  // Para desenvolvimento, reutilizar instância com logging
  if (!global.__db__) {
    global.__db__ = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global.__db__;
  prisma.$connect();
}

export default prisma;
