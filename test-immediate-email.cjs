// Script para criar um convite de review para envio imediato
// Útil para testar o fluxo de envio de emails sem esperar pelo agendamento
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createImmediateInvitation() {
  try {
    // Obter todas as lojas com configurações de email válidas
    const stores = await prisma.reviewSettings.findMany({
      where: {
        OR: [
          {
            emailProvider: 'mailtrap',
            mailtrapToken: { not: null },
            mailtrapInboxId: { not: null },
            emailFromAddress: { not: null },
          },
          {
            emailProvider: { in: ['sendgrid', 'mailgun'] },
            emailApiKey: { not: null },
            emailFromAddress: { not: null },
          }
        ]
      }
    });

    if (stores.length === 0) {
      console.log('❌ Nenhuma loja encontrada com configurações de email válidas');
      return;
    }

    console.log(`🏪 Encontradas ${stores.length} lojas com configurações de email válidas`);
    
    // Usar a primeira loja encontrada
    const store = stores[0];
    console.log(`📧 Usando loja: ${store.shop}`);
    console.log(`   Provider: ${store.emailProvider}`);
    console.log(`   From: ${store.emailFromAddress}`);

    // Data atual para envio imediato
    const now = new Date();
    
    // Criar um convite de teste
    const invitation = await prisma.reviewInvitation.create({
      data: {
        shop: store.shop,
        customerEmail: 'teste@example.com',
        customerName: 'Cliente Teste',
        orderId: `test-${Date.now()}`,
        productId: 'gid://shopify/Product/123456789', // Formato correto do productId
        productTitle: 'Produto de Teste',
        scheduledFor: now, // Agendar para agora
        token: `test-token-${Date.now()}`,
        reminderCount: 0,
      }
    });

    console.log(`✅ Convite criado com sucesso para envio imediato!`);
    console.log(`   ID: ${invitation.id}`);
    console.log(`   Email: ${invitation.customerEmail}`);
    console.log(`   Agendado para: ${invitation.scheduledFor}`);
    console.log('\nAgora execute o script de processamento de emails:');
    console.log('node cron-emails.cjs');

  } catch (error) {
    console.error('❌ Erro ao criar convite:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createImmediateInvitation();
