const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function criarConviteTeste() {
  try {
    console.log('📧 Criando convite de teste...\n');
    
    // Para teste, agendar para AGORA (envio imediato)
    const agora = new Date();

    const convite = await db.reviewInvitation.create({
      data: {
        shop: 'lojatesteigor.myshopify.com', // Shop correto
        orderId: 'TESTE-' + Date.now(),
        customerEmail: 'igor.srs8@hotmail.com', // 🔥 COLOQUE SEU EMAIL AQUI
        customerName: 'Cliente Teste',
        productId: 'gid://shopify/Product/123456',
        productTitle: 'Produto Incrível de Teste',
        productImage: 'https://via.placeholder.com/300x300/4f46e5/white?text=Produto+Teste',
        scheduledFor: agora, // Envio AGORA
        token: Math.random().toString(36).substring(2) + Date.now().toString(36),
      }
    });

    console.log('✅ Convite de teste criado!');
    console.log(`📧 Email: ${convite.customerEmail}`);
    console.log(`📅 Agendado para: ${agora.toLocaleString()} (AGORA)`);
    console.log(`🔗 Token: ${convite.token}`);
    console.log(`🆔 ID: ${convite.id}`);
    console.log('\n🚀 Execute agora: node cron-emails.cjs');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await db.$disconnect();
  }
}

criarConviteTeste();
