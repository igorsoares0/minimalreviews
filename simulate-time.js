const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function simularTempo() {
  try {
    console.log(' Simulando passagem de tempo para lembretes...\n');
    
    // Buscar convites não respondidos
    const convites = await db.reviewInvitation.findMany({
      where: {
        responded: false,
        sentAt: { not: null }
      }
    });

    if (convites.length === 0) {
      console.log(' Nenhum convite enviado e não respondido encontrado');
      console.log(' Execute create-test-invite.js e depois cron-emails.js primeiro');
      return;
    }

    // Simular que foram enviados há 3 dias
    const tresDiasAtras = new Date();
    tresDiasAtras.setDate(tresDiasAtras.getDate() - 3);

    const resultado = await db.reviewInvitation.updateMany({
      where: {
        responded: false,
        sentAt: { not: null }
      },
      data: { sentAt: tresDiasAtras }
    });

    console.log(  convites atualizados);
    console.log( Data simulada: );
    console.log('\n Agora execute: node cron-emails.js');
    console.log('   Os lembretes devem ser enviados!');

  } catch (error) {
    console.error(' Erro:', error);
  } finally {
    await db.();
  }
}

simularTempo();
