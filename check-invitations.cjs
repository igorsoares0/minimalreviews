// check-invitations.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkInvitations() {
  try {
    const shop = "lojatesteigor.myshopify.com";
    
    console.log('🔍 Verificando convites no banco...\n');
    
    const invitations = await prisma.reviewInvitation.findMany({
      where: { shop },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    console.log(`📊 Total de convites: ${invitations.length}\n`);
    
    invitations.forEach((invitation, index) => {
      console.log(`${index + 1}. ${invitation.productTitle}`);
      console.log(`   Email: ${invitation.customerEmail}`);
      console.log(`   Agendado para: ${invitation.scheduledFor.toISOString()}`);
      console.log(`   Enviado: ${invitation.sentAt ? 'Sim' : 'Não'}`);
      console.log(`   Respondido: ${invitation.responded ? 'Sim' : 'Não'}`);
      console.log(`   Token: ${invitation.token.substring(0, 10)}...`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkInvitations();