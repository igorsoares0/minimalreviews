const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function verificarStatus() {
  try {
    console.log('📊 Verificando status dos testes...\n');
    
    // Convites pendentes
    const pendentes = await db.reviewInvitation.findMany({
      where: { sentAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log(`📧 Convites pendentes: ${pendentes.length}`);
    pendentes.forEach(c => {
      console.log(`   - ${c.customerEmail} | ${c.productTitle} | ${c.scheduledFor}`);
    });
    
    // Convites enviados
    const enviados = await db.reviewInvitation.findMany({
      where: { sentAt: { not: null } },
      orderBy: { sentAt: 'desc' },
      take: 5
    });
    
    console.log(`\n✅ Convites enviados: ${enviados.length}`);
    enviados.forEach(c => {
      console.log(`   - ${c.customerEmail} | Enviado: ${c.sentAt} | Respondido: ${c.responded}`);
    });
    
    // Reviews no RWS (se conectado)
    console.log('\n🔄 Para verificar reviews no RWS, execute:');
    console.log('   curl http://localhost:3002/api/reviews');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await db.$disconnect();
  }
}

verificarStatus(); 