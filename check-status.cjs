const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function verificarStatus() {
  try {
    console.log(' Verificando status do sistema...\n');
    
    const convites = await db.reviewInvitation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    console.log(' Status dos Convites:');
    console.log(`   Total: ${convites.length}`);
    const enviados = convites.filter(c => c.sentAt).length;
    const respondidos = convites.filter(c => c.responded).length;
    const comLembretes = convites.filter(c => c.reminderCount > 0).length;
    console.log(`   Enviados: ${enviados}`);
    console.log(`   Respondidos: ${respondidos}`);
    console.log(`   Com lembretes: ${comLembretes}`);

    if (convites.length > 0) {
      console.log('\n Últimos convites:');
      convites.forEach((conv, i) => {
        const status = conv.responded ? ' Respondido' : 
                      conv.sentAt ? ' Enviado' : ' Pendente';
        console.log(`   ${i+1}. ${conv.customerEmail} - ${conv.productTitle}`);
        console.log(`      Status: ${status}`);
        console.log(`      Agendado: ${conv.scheduledFor.toLocaleString()}`);
        if (conv.sentAt) {
          console.log(`      Enviado: ${conv.sentAt.toLocaleString()}`);
        }
        console.log(`      Lembretes: ${conv.reminderCount}`);
        console.log('');
      });
    }

    const reviews = await db.review.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log(` Reviews criados: ${reviews.length}`);
    if (reviews.length > 0) {
      console.log('   Últimos reviews:');
      reviews.forEach((rev, i) => {
        console.log(`   ${i+1}. ${rev.customerName || 'Anônimo'} - ${rev.rating}★`);
        console.log(`      Produto: ${rev.productTitle}`);
        console.log(`      Data: ${rev.createdAt.toLocaleString()}`);
      });
    }

  } catch (error) {
    console.error(' Erro:', error);
  } finally {
    await db.$disconnect();
  }
}

verificarStatus();
